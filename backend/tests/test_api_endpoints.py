import io
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi import UploadFile

from app.core.database import Base
from app.models.models import User, ResearchProject, ResearchPaper
from app.schemas.schemas import (
    UserCreate, UserLogin, ProjectCreate, ProjectUpdate,
    NoteCreate, CollectionCreate, ChatQueryRequest, ConversationCreate
)
from app.api.v1.auth import register_user, login_user, get_current_user_profile
from app.api.v1.projects import create_project, list_projects, get_project, update_project, delete_project
from app.api.v1.papers import upload_paper, list_papers, get_paper, delete_paper
from app.api.v1.chat import create_conversation, execute_chat_query
from app.api.v1.notes import create_note, list_notes, delete_note
from app.api.v1.collections import create_collection, list_collections
from app.api.v1.dashboard import get_dashboard_stats
from app.core.exceptions import ResearchLensException, DuplicateResourceException, ResourceNotFoundException

# In-memory test engine
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSession = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="function")
def db():
    import app.models.models
    Base.metadata.create_all(bind=test_engine)
    session = TestSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)

def test_auth_and_user_lifecycle(db):
    # 1. Register User
    payload = UserCreate(
        email="dr.chen@berkeley.edu",
        password="SecurePassword2026!",
        full_name="Dr. Alex Chen",
        institution="UC Berkeley"
    )
    reg_resp = register_user(payload=payload, db=db)
    assert reg_resp.access_token is not None
    assert reg_resp.user.email == "dr.chen@berkeley.edu"

    # 2. Duplicate registration fails
    with pytest.raises(DuplicateResourceException):
        register_user(payload=payload, db=db)

    # 3. Successful Login
    login_resp = login_user(UserLogin(email="dr.chen@berkeley.edu", password="SecurePassword2026!"), db=db)
    assert login_resp.access_token is not None

    # 4. Invalid Login fails
    with pytest.raises(ResearchLensException):
        login_user(UserLogin(email="dr.chen@berkeley.edu", password="WrongPassword!"), db=db)

def test_projects_and_isolation(db):
    # Create User A & User B
    user_a = User(email="user_a@test.com", full_name="User A", role="researcher")
    user_b = User(email="user_b@test.com", full_name="User B", role="researcher")
    db.add_all([user_a, user_b])
    db.commit()

    # User A creates a project
    proj_a = create_project(ProjectCreate(title="Deep RL Optimization"), current_user=user_a, db=db)
    assert proj_a.title == "Deep RL Optimization"

    # User A can list it
    projects_a = list_projects(current_user=user_a, db=db)
    assert len(projects_a) == 1
    assert projects_a[0].id == proj_a.id

    # User B cannot see User A's project (Cross-user data isolation)
    projects_b = list_projects(current_user=user_b, db=db)
    assert len(projects_b) == 0

    with pytest.raises(ResourceNotFoundException):
        get_project(project_id=proj_a.id, current_user=user_b, db=db)

    # User A can update and delete
    upd = update_project(project_id=proj_a.id, payload=ProjectUpdate(title="Updated Title"), current_user=user_a, db=db)
    assert upd.title == "Updated Title"

    delete_project(project_id=proj_a.id, current_user=user_a, db=db)
    assert len(list_projects(current_user=user_a, db=db)) == 0

def test_full_rag_and_citation_pipeline(db):
    # Create User & Project
    user = User(email="researcher@mit.edu", full_name="MIT Researcher", role="researcher")
    db.add(user)
    db.commit()

    project = ResearchProject(user_id=user.id, title="Attention & Memory Architectures")
    db.add(project)
    db.commit()

    # 1. Create realistic scientific PDF using fitz
    import pymupdf as fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text(
        fitz.Point(50, 72),
        "Abstract: We introduce self-attention for sequence transduction.\n"
        "3.2 Scaled Dot-Product Attention\n"
        "The computational complexity of self-attention per layer is O(n^2 * d) where n is the sequence length.\n"
        "This replaces recurrent neural networks with parallel execution across attention heads."
    )
    sample_pdf = doc.tobytes()
    doc.close()

    upload_file = UploadFile(filename="attention_all_you_need.pdf", file=io.BytesIO(sample_pdf))

    upload_res = upload_paper(
        project_id=str(project.id),
        file=upload_file,
        current_user=user,
        db=db
    )
    assert upload_res.status == "indexed"
    paper_id = upload_res.paper_id

    # 2. Verify paper is in library
    papers = list_papers(project_id=str(project.id), current_user=user, db=db)
    assert len(papers) == 1
    assert papers[0].id == paper_id

    # 3. Create conversation and execute grounded RAG query
    conv = create_conversation(ConversationCreate(project_id=str(project.id), paper_id=paper_id, title="RAG Analysis"), current_user=user, db=db)
    assert conv.id is not None

    query_res = execute_chat_query(
        payload=ChatQueryRequest(
            conversation_id=str(conv.id),
            message="What is the attention computational complexity?"
        ),
        current_user=user,
        db=db
    )

    assert query_res.content is not None
    assert len(query_res.citations) >= 1
    assert query_res.citations[0].verification_status in ("verified", "ai_hypothesis")
    assert query_res.citations[0].page_number >= 1

    # 4. Verify Dashboard Statistics derived from DB
    stats = get_dashboard_stats(project_id=str(project.id), current_user=user, db=db)
    assert stats.total_papers == 1
    assert stats.active_project_id == str(project.id)

    # 5. Clean up
    delete_paper(paper_id=paper_id, current_user=user, db=db)
    assert len(list_papers(project_id=str(project.id), current_user=user, db=db)) == 0
