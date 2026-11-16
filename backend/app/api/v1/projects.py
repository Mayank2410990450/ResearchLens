from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import ResourceNotFoundException, PermissionDeniedException
from app.models.models import User, ResearchProject, ResearchPaper
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Research Projects"])

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(ResearchProject).filter(ResearchProject.user_id == current_user.id).all()
    results = []
    for proj in projects:
        count = db.query(ResearchPaper).filter(ResearchPaper.project_id == proj.id).count()
        p_res = ProjectResponse.model_validate(proj)
        p_res.paper_count = count
        results.append(p_res)
    return results

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = ResearchProject(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        research_field=payload.research_field or "Computer Science"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    res = ProjectResponse.model_validate(project)
    res.paper_count = 0
    return res

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)
    
    count = db.query(ResearchPaper).filter(ResearchPaper.project_id == project.id).count()
    res = ProjectResponse.model_validate(project)
    res.paper_count = count
    return res

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    if payload.title is not None:
        project.title = payload.title
    if payload.description is not None:
        project.description = payload.description
    if payload.research_field is not None:
        project.research_field = payload.research_field

    db.commit()
    db.refresh(project)
    count = db.query(ResearchPaper).filter(ResearchPaper.project_id == project.id).count()
    res = ProjectResponse.model_validate(project)
    res.paper_count = count
    return res

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == project_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise ResourceNotFoundException("ResearchProject", project_id)

    db.delete(project)
    db.commit()
    return None
