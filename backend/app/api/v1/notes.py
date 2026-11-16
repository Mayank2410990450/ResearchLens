from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundException
from app.models.models import User, ResearchProject, ResearchNote, ResearchPaper
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes & Highlights"])

@router.get("", response_model=List[NoteResponse])
def list_notes(
    project_id: str = Query(...),
    paper_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    query = db.query(ResearchNote).filter(
        ResearchNote.project_id == project_id,
        ResearchNote.user_id == current_user.id
    )
    if isinstance(paper_id, str) and paper_id:
        query = query.filter(ResearchNote.paper_id == paper_id)

    notes = query.order_by(ResearchNote.created_at.desc()).all()
    return [NoteResponse.model_validate(n) for n in notes]

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == payload.project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", payload.project_id)

    note = ResearchNote(
        project_id=payload.project_id,
        user_id=current_user.id,
        paper_id=payload.paper_id,
        title=payload.title,
        content_markdown=payload.content_markdown,
        tags=payload.tags or []
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return NoteResponse.model_validate(note)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: str,
    payload: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(ResearchNote).filter(
        ResearchNote.id == note_id,
        ResearchNote.user_id == current_user.id
    ).first()
    if not note:
        raise ResourceNotFoundException("ResearchNote", note_id)

    if payload.title is not None:
        note.title = payload.title
    if payload.content_markdown is not None:
        note.content_markdown = payload.content_markdown
    if payload.tags is not None:
        note.tags = payload.tags

    db.commit()
    db.refresh(note)
    return NoteResponse.model_validate(note)

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(ResearchNote).filter(
        ResearchNote.id == note_id,
        ResearchNote.user_id == current_user.id
    ).first()
    if not note:
        raise ResourceNotFoundException("ResearchNote", note_id)

    db.delete(note)
    db.commit()
    return None
