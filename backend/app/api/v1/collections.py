from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundException, PermissionDeniedException
from app.models.models import User, ResearchProject, ResearchCollection, CollectionPaper, ResearchPaper
from app.schemas.schemas import (
    CollectionCreate, CollectionUpdate, CollectionResponse, CollectionAddPaperRequest
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/collections", tags=["Research Collections"])

@router.get("", response_model=List[CollectionResponse])
def list_collections(
    project_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    collections = db.query(ResearchCollection).filter(
        ResearchCollection.project_id == project_id,
        ResearchCollection.user_id == current_user.id
    ).all()

    results = []
    for col in collections:
        paper_links = db.query(CollectionPaper).filter(CollectionPaper.collection_id == col.id).all()
        c_res = CollectionResponse.model_validate(col)
        c_res.paper_ids = [str(l.paper_id) for l in paper_links]
        results.append(c_res)

    return results

@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection(
    project_id: str = Query(...),
    payload: CollectionCreate = ...,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    collection = ResearchCollection(
        project_id=project_id,
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        color_hex=payload.color_hex or "#6366F1"
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)

    c_res = CollectionResponse.model_validate(collection)
    c_res.paper_ids = []
    return c_res

@router.post("/{collection_id}/papers", response_model=CollectionResponse)
def add_paper_to_collection(
    collection_id: str,
    payload: CollectionAddPaperRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    col = db.query(ResearchCollection).filter(
        ResearchCollection.id == collection_id,
        ResearchCollection.user_id == current_user.id
    ).first()
    if not col:
        raise ResourceNotFoundException("ResearchCollection", collection_id)

    paper = db.query(ResearchPaper).filter(
        ResearchPaper.id == payload.paper_id,
        ResearchPaper.user_id == current_user.id
    ).first()
    if not paper:
        raise ResourceNotFoundException("ResearchPaper", payload.paper_id)

    # Check already added
    exists = db.query(CollectionPaper).filter(
        CollectionPaper.collection_id == col.id,
        CollectionPaper.paper_id == paper.id
    ).first()
    if not exists:
        link = CollectionPaper(collection_id=col.id, paper_id=paper.id)
        db.add(link)
        db.commit()

    paper_links = db.query(CollectionPaper).filter(CollectionPaper.collection_id == col.id).all()
    c_res = CollectionResponse.model_validate(col)
    c_res.paper_ids = [str(l.paper_id) for l in paper_links]
    return c_res

@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_collection(
    collection_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    col = db.query(ResearchCollection).filter(
        ResearchCollection.id == collection_id,
        ResearchCollection.user_id == current_user.id
    ).first()
    if not col:
        raise ResourceNotFoundException("ResearchCollection", collection_id)

    db.delete(col)
    db.commit()
    return None
