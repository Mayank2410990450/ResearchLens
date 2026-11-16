import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, BigInteger, Float, Boolean,
    DateTime, ForeignKey, UniqueConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.types import GUID, StringList

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    institution = Column(String(255), nullable=True)
    role = Column(String(50), nullable=False, default="researcher")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    projects = relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")
    papers = relationship("ResearchPaper", back_populates="user", cascade="all, delete-orphan")
    notes = relationship("ResearchNote", back_populates="user", cascade="all, delete-orphan")
    collections = relationship("ResearchCollection", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    research_field = Column(String(100), default="Computer Science")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="projects")
    papers = relationship("ResearchPaper", back_populates="project", cascade="all, delete-orphan")
    collections = relationship("ResearchCollection", back_populates="project", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")
    notes = relationship("ResearchNote", back_populates="project", cascade="all, delete-orphan")
    comparison_reports = relationship("ComparisonReport", back_populates="project", cascade="all, delete-orphan")
    literature_reviews = relationship("GeneratedLiteratureReview", back_populates="project", cascade="all, delete-orphan")

class ResearchPaper(Base):
    __tablename__ = "research_papers"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(500), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    file_hash = Column(String(64), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    page_count = Column(Integer, default=0, nullable=False)
    processing_status = Column(String(50), default="pending", nullable=False, index=True)  # pending, processing, indexed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("project_id", "file_hash", name="uq_project_paper_hash"),
    )

    # Relationships
    project = relationship("ResearchProject", back_populates="papers")
    user = relationship("User", back_populates="papers")
    paper_metadata = relationship("PaperMetadata", back_populates="paper", uselist=False, cascade="all, delete-orphan")
    chunks = relationship("DocumentChunk", back_populates="paper", cascade="all, delete-orphan")
    notes = relationship("ResearchNote", back_populates="paper")
    highlights = relationship("Highlight", back_populates="paper", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="paper", cascade="all, delete-orphan")

class PaperMetadata(Base):
    __tablename__ = "paper_metadata"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    title = Column(Text, nullable=False)
    authors = Column(StringList, nullable=False, default=list)
    abstract = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=True, index=True)
    journal_or_venue = Column(String(500), nullable=True)
    doi = Column(String(255), nullable=True)
    keywords = Column(StringList, nullable=False, default=list)
    primary_methodology = Column(String(255), nullable=True)
    primary_dataset = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    paper = relationship("ResearchPaper", back_populates="paper_metadata")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    section_title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("paper_id", "chunk_index", name="uq_paper_chunk_index"),
        Index("idx_doc_chunks_page", "paper_id", "page_number"),
    )

    paper = relationship("ResearchPaper", back_populates="chunks")
    embedding = relationship("DocumentEmbedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    chunk_id = Column(GUID, ForeignKey("document_chunks.id", ondelete="CASCADE"), unique=True, nullable=False)
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    embedding_model = Column(String(100), nullable=False, default="all-MiniLM-L6-v2")
    # Store embedding array as JSON for generic cross-platform DB, pgvector on PostgreSQL
    embedding_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    chunk = relationship("DocumentChunk", back_populates="embedding")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="Research Discussion")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    project = relationship("ResearchProject", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(GUID, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    raw_response = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("Citation", back_populates="message", cascade="all, delete-orphan")

class Citation(Base):
    __tablename__ = "citations"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    message_id = Column(GUID, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(GUID, ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=True)
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    exact_quote = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False, default=1.0)
    verification_status = Column(String(50), nullable=False, default="verified")  # verified, unverified, ai_hypothesis
    bounding_box = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    message = relationship("Message", back_populates="citations")

class ResearchCollection(Base):
    __tablename__ = "research_collections"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color_hex = Column(String(20), nullable=False, default="#6366F1")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    project = relationship("ResearchProject", back_populates="collections")
    user = relationship("User", back_populates="collections")
    collection_papers = relationship("CollectionPaper", back_populates="collection", cascade="all, delete-orphan")

class CollectionPaper(Base):
    __tablename__ = "collection_papers"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(GUID, ForeignKey("research_collections.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    added_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("collection_id", "paper_id", name="uq_collection_paper"),
    )

    collection = relationship("ResearchCollection", back_populates="collection_papers")
    paper = relationship("ResearchPaper")

class ResearchNote(Base):
    __tablename__ = "research_notes"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    content_markdown = Column(Text, nullable=False)
    tags = Column(StringList, nullable=False, default=list)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    project = relationship("ResearchProject", back_populates="notes")
    user = relationship("User", back_populates="notes")
    paper = relationship("ResearchPaper", back_populates="notes")

class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    page_number = Column(Integer, nullable=False)
    selected_text = Column(Text, nullable=False)
    bounding_box_json = Column(JSON, nullable=True)
    color = Column(String(30), nullable=False, default="yellow")
    note_id = Column(GUID, ForeignKey("research_notes.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    paper = relationship("ResearchPaper", back_populates="highlights")

class ComparisonReport(Base):
    __tablename__ = "comparison_reports"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    paper_ids = Column(StringList, nullable=False, default=list)
    matrix_json = Column(JSON, nullable=False)
    comparative_synthesis_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    project = relationship("ResearchProject", back_populates="comparison_reports")

class GeneratedLiteratureReview(Base):
    __tablename__ = "generated_literature_reviews"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(GUID, ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    paper_ids = Column(StringList, nullable=False, default=list)
    review_markdown = Column(Text, nullable=False)
    sections_json = Column(JSON, nullable=False)
    references_json = Column(JSON, nullable=False)
    status = Column(String(50), nullable=False, default="completed")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    project = relationship("ResearchProject", back_populates="literature_reviews")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(GUID, ForeignKey("research_papers.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_type = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="queued")  # queued, running, completed, failed
    progress_pct = Column(Integer, nullable=False, default=0)
    step_description = Column(String(255), nullable=False, default="Queued")
    error_details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    paper = relationship("ResearchPaper", back_populates="processing_jobs")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(GUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

class RetrievalEvaluation(Base):
    __tablename__ = "retrieval_evaluations"

    id = Column(GUID, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    test_query = Column(Text, nullable=False)
    retrieval_mode = Column(String(50), nullable=False)
    recall_at_5 = Column(Float, nullable=False)
    precision_at_5 = Column(Float, nullable=False)
    mrr = Column(Float, nullable=False)
    latency_ms = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
