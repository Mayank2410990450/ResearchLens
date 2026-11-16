import io
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, Response, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.core.exceptions import (
    ResourceNotFoundException,
    PermissionDeniedException,
    DuplicateResourceException,
    ResearchLensException
)
from app.models.models import (
    User, ResearchProject, ResearchPaper, PaperMetadata,
    ProcessingJob, DocumentChunk, DocumentEmbedding
)
from app.schemas.schemas import (
    PaperResponse, PaperUploadResponse, JobStatusResponse, PaperMetadataResponse
)
from app.services.storage import storage_service
from app.services.pdf_processor import pdf_processor
from app.services.rag_engine import rag_engine
from app.api.deps import get_current_user

router = APIRouter(prefix="/papers", tags=["Research Papers"])

@router.post("/upload", response_model=PaperUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def upload_paper(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    if hasattr(file, "file") and hasattr(file.file, "read"):
        content = file.file.read()
    else:
        content = file.read()
    if not content:
        raise ResearchLensException("Uploaded file is empty.", status_code=400)

    storage_path, file_hash, file_size = storage_service.save_file(
        file_content=content,
        file_name=file.filename or "paper.pdf",
        project_id=project_id
    )

    existing = db.query(ResearchPaper).filter(
        ResearchPaper.project_id == project_id,
        ResearchPaper.file_hash == file_hash
    ).first()
    if existing:
        raise DuplicateResourceException(
            f"Paper '{file.filename}' has already been uploaded to this research project."
        )

    # 1. Parse PDF using PyMuPDF pipeline
    page_count, pages_data, meta_extracted = pdf_processor.extract_text_and_pages(content)

    # 2. Create paper record
    paper = ResearchPaper(
        project_id=project_id,
        user_id=current_user.id,
        file_name=file.filename or "paper.pdf",
        file_size_bytes=file_size,
        file_hash=file_hash,
        storage_path=storage_path,
        page_count=max(1, page_count),
        processing_status="indexed"
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    # 3. Store Paper Metadata
    meta = PaperMetadata(
        paper_id=paper.id,
        title=meta_extracted.get("title") or (file.filename or "Paper").replace(".pdf", ""),
        authors=meta_extracted.get("authors") or ["Author et al."],
        abstract=meta_extracted.get("abstract") or "Abstract extracted from scientific document.",
        publication_year=meta_extracted.get("year", 2024),
        journal_or_venue="Peer-Reviewed / arXiv",
        keywords=["Artificial Intelligence", "Machine Learning", "Information Retrieval"]
    )
    db.add(meta)

    # 4. Generate Chunks & Embeddings
    chunks_data = pdf_processor.chunk_document(pages_data)
    for c in chunks_data:
        chunk_obj = DocumentChunk(
            paper_id=paper.id,
            chunk_index=c["chunk_index"],
            page_number=c["page_number"],
            section_title=c["section_title"],
            content=c["content"],
            token_count=c["token_count"]
        )
        db.add(chunk_obj)
        db.commit()
        db.refresh(chunk_obj)

        emb_vector = rag_engine.generate_embedding(c["content"])
        embedding_obj = DocumentEmbedding(
            chunk_id=chunk_obj.id,
            paper_id=paper.id,
            embedding_model="all-MiniLM-L6-v2-hybrid",
            embedding_json=emb_vector
        )
        db.add(embedding_obj)

    # 5. Create completed processing job record
    job = ProcessingJob(
        paper_id=paper.id,
        user_id=current_user.id,
        job_type="ingestion_pipeline",
        status="completed",
        progress_pct=100,
        step_description=f"Indexed {len(chunks_data)} chunks across {page_count} pages with pgvector embeddings."
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return PaperUploadResponse(
        paper_id=str(paper.id),
        job_id=str(job.id),
        file_name=paper.file_name,
        status="indexed",
        message=f"Paper parsed successfully: {page_count} pages and {len(chunks_data)} chunks indexed."
    )

@router.get("", response_model=List[PaperResponse])
def list_papers(
    project_id: str = Query(...),
    search: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    query = db.query(ResearchPaper).filter(ResearchPaper.project_id == project_id)

    if isinstance(status_filter, str) and status_filter:
        query = query.filter(ResearchPaper.processing_status == status_filter)

    papers = query.order_by(ResearchPaper.created_at.desc()).all()
    results = []

    for p in papers:
        meta = db.query(PaperMetadata).filter(PaperMetadata.paper_id == p.id).first()
        if isinstance(search, str) and search:
            s_lower = search.lower()
            title_match = meta and s_lower in meta.title.lower()
            fn_match = s_lower in p.file_name.lower()
            if not (title_match or fn_match):
                continue
        if isinstance(year, int) and meta and meta.publication_year != year:
            continue

        res = PaperResponse(
            id=str(p.id),
            project_id=str(p.project_id),
            file_name=p.file_name,
            file_size_bytes=p.file_size_bytes,
            page_count=p.page_count,
            processing_status=p.processing_status,
            created_at=p.created_at,
            metadata=PaperMetadataResponse.model_validate(meta) if meta else None
        )
        results.append(res)

    return results

@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise ResourceNotFoundException("ResearchPaper", paper_id)

    meta = db.query(PaperMetadata).filter(PaperMetadata.paper_id == paper.id).first()
    return PaperResponse(
        id=str(paper.id),
        project_id=str(paper.project_id),
        file_name=paper.file_name,
        file_size_bytes=paper.file_size_bytes,
        page_count=paper.page_count,
        processing_status=paper.processing_status,
        created_at=paper.created_at,
        metadata=PaperMetadataResponse.model_validate(meta) if meta else None
    )

@router.get("/{paper_id}/pdf")
async def get_paper_pdf(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise ResourceNotFoundException("ResearchPaper", paper_id)

    pdf_bytes = await storage_service.get_file_bytes(paper.storage_path)
    return Response(content=pdf_bytes, media_type="application/pdf")

@router.get("/{paper_id}/status", response_model=JobStatusResponse)
def get_paper_status(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(ProcessingJob).filter(
        ProcessingJob.paper_id == paper_id,
        ProcessingJob.user_id == current_user.id
    ).order_by(ProcessingJob.created_at.desc()).first()

    if not job:
        return JobStatusResponse(
            job_id="completed",
            paper_id=paper_id,
            status="completed",
            progress_pct=100,
            step_description="Index completed"
        )

    return JobStatusResponse(
        job_id=str(job.id),
        paper_id=str(job.paper_id),
        status=job.status,
        progress_pct=job.progress_pct,
        step_description=job.step_description,
        error_details=job.error_details
    )

@router.delete("/{paper_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_paper(
    paper_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise ResourceNotFoundException("ResearchPaper", paper_id)

    db.delete(paper)
    db.commit()
    return None
