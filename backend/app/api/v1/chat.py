import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundException
from app.models.models import (
    User, ResearchProject, ResearchPaper, Conversation,
    Message, Citation, DocumentChunk, DocumentEmbedding
)
from app.schemas.schemas import (
    ConversationCreate, ConversationResponse, MessageResponse,
    CitationResponse, ChatQueryRequest, ChatQueryResponse
)
from app.services.rag_engine import rag_engine
from app.api.deps import get_current_user

router = APIRouter(prefix="/chat", tags=["AI Assistant & Conversations"])

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    project_id: str = Query(...),
    paper_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Conversation).filter(
        Conversation.project_id == project_id,
        Conversation.user_id == current_user.id
    )
    if isinstance(paper_id, str) and paper_id:
        query = query.filter(Conversation.paper_id == paper_id)

    conversations = query.order_by(Conversation.updated_at.desc()).all()
    results = []
    for conv in conversations:
        c_res = ConversationResponse.model_validate(conv)
        results.append(c_res)
    return results

@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == payload.project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", payload.project_id)

    conv = Conversation(
        project_id=payload.project_id,
        user_id=current_user.id,
        paper_id=payload.paper_id,
        title=payload.title or "Research Discussion"
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    return ConversationResponse.model_validate(conv)

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise ResourceNotFoundException("Conversation", conversation_id)

    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()

    msg_responses = []
    for m in messages:
        cits = db.query(Citation).filter(Citation.message_id == m.id).all()
        m_res = MessageResponse(
            id=str(m.id),
            conversation_id=str(m.conversation_id),
            sender_role=m.sender_role,
            content=m.content,
            citations=[CitationResponse.model_validate(c) for c in cits],
            created_at=m.created_at
        )
        msg_responses.append(m_res)

    res = ConversationResponse.model_validate(conv)
    res.messages = msg_responses
    return res

@router.post("/query", response_model=ChatQueryResponse)
def execute_chat_query(
    payload: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == payload.conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise ResourceNotFoundException("Conversation", payload.conversation_id)

    # 1. Save user query message
    user_msg = Message(
        conversation_id=conv.id,
        sender_role="user",
        content=payload.message
    )
    db.add(user_msg)
    db.commit()

    # 2. Gather candidate chunks from target paper(s) or whole project
    query_papers = []
    if conv.paper_id:
        query_papers.append(conv.paper_id)
    if payload.paper_ids:
        for pid in payload.paper_ids:
            if pid not in query_papers:
                query_papers.append(pid)

    chunks_query = db.query(DocumentChunk)
    if query_papers:
        chunks_query = chunks_query.filter(DocumentChunk.paper_id.in_(query_papers))
    else:
        # Default to papers in the active project
        proj_paper_ids = [
            p.id for p in db.query(ResearchPaper.id).filter(
                ResearchPaper.project_id == conv.project_id
            ).all()
        ]
        if proj_paper_ids:
            chunks_query = chunks_query.filter(DocumentChunk.paper_id.in_(proj_paper_ids))

    candidate_db_chunks = chunks_query.all()

    candidate_chunks = []
    for ch in candidate_db_chunks:
        emb_record = db.query(DocumentEmbedding).filter(DocumentEmbedding.chunk_id == ch.id).first()
        candidate_chunks.append({
            "chunk_id": str(ch.id),
            "paper_id": str(ch.paper_id),
            "page_number": ch.page_number,
            "section_title": ch.section_title or f"Page {ch.page_number}",
            "content": ch.content,
            "embedding": emb_record.embedding_json if emb_record else None
        })

    # 3. Hybrid vector + lexical retrieval
    retrieved = rag_engine.hybrid_retrieve(
        query=payload.message,
        candidate_chunks=candidate_chunks,
        top_k=5,
        alpha=0.7
    )

    # Identify primary paper title for grounded synthesis
    paper_title = "Uploaded Research Documents"
    if query_papers:
        p_obj = db.query(ResearchPaper).filter(ResearchPaper.id == query_papers[0]).first()
        if p_obj:
            paper_title = p_obj.file_name

    # 4. Generate grounded answer and verified citations
    answer_text, citations_data = rag_engine.synthesize_grounded_answer(
        query=payload.message,
        retrieved_chunks=retrieved,
        paper_title=paper_title
    )

    # 5. Persist assistant message
    assistant_msg = Message(
        conversation_id=conv.id,
        sender_role="assistant",
        content=answer_text
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    # 6. Persist citations
    persisted_citations = []
    for c in citations_data:
        cit_obj = Citation(
            message_id=assistant_msg.id,
            chunk_id=c.get("chunk_id"),
            paper_id=c.get("paper_id") or (query_papers[0] if query_papers else str(uuid.uuid4())),
            page_number=c.get("page_number", 1),
            exact_quote=c.get("exact_quote", ""),
            confidence_score=c.get("confidence_score", 0.95),
            verification_status=c.get("verification_status", "verified"),
            bounding_box=c.get("bounding_box")
        )
        db.add(cit_obj)
        db.commit()
        db.refresh(cit_obj)
        persisted_citations.append(CitationResponse.model_validate(cit_obj))

    return ChatQueryResponse(
        message_id=str(assistant_msg.id),
        role="assistant",
        content=assistant_msg.content,
        citations=persisted_citations,
        context_chunks_retrieved=len(retrieved),
        model_used="researchlens-hybrid-rag"
    )
