from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def validate_email_str(v: str) -> str:
    if not isinstance(v, str) or not EMAIL_REGEX.match(v):
        raise ValueError("Invalid email format.")
    return v.lower().strip()

# --- Auth & User Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)
    institution: Optional[str] = None

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_str(v)

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def check_email(cls, v: str) -> str:
        return validate_email_str(v)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    full_name: str
    institution: Optional[str] = None
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    research_field: Optional[str] = "Computer Science"

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    research_field: Optional[str] = None

class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    research_field: str
    paper_count: int = 0
    created_at: datetime
    updated_at: datetime

# --- Paper & Metadata Schemas ---
class PaperMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    authors: List[str] = []
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    journal_or_venue: Optional[str] = None
    doi: Optional[str] = None
    keywords: List[str] = []
    primary_methodology: Optional[str] = None
    primary_dataset: Optional[str] = None

class PaperResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    file_name: str
    file_size_bytes: int
    page_count: int
    processing_status: str
    created_at: datetime
    metadata: Optional[PaperMetadataResponse] = None

class PaperUploadResponse(BaseModel):
    paper_id: str
    job_id: str
    file_name: str
    status: str
    message: str

class JobStatusResponse(BaseModel):
    job_id: str
    paper_id: str
    status: str
    progress_pct: int
    step_description: str
    error_details: Optional[str] = None

# --- Collection Schemas ---
class CollectionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    color_hex: Optional[str] = "#6366F1"

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color_hex: Optional[str] = None

class CollectionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    color_hex: str
    paper_ids: List[str] = []
    created_at: datetime

class CollectionAddPaperRequest(BaseModel):
    paper_id: str

# --- Note Schemas ---
class NoteCreate(BaseModel):
    project_id: str
    paper_id: Optional[str] = None
    title: str = Field(min_length=1, max_length=255)
    content_markdown: str
    tags: List[str] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content_markdown: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    paper_id: Optional[str] = None
    title: str
    content_markdown: str
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

# --- Chat & Assistant Schemas ---
class CitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    paper_id: str
    page_number: int
    exact_quote: str
    confidence_score: float
    verification_status: str
    bounding_box: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    sender_role: str
    content: str
    citations: List[CitationResponse] = []
    created_at: datetime

class ConversationCreate(BaseModel):
    project_id: str
    paper_id: Optional[str] = None
    title: Optional[str] = "Research Discussion"

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    project_id: str
    paper_id: Optional[str] = None
    title: str
    created_at: datetime
    messages: List[MessageResponse] = []

class ChatQueryRequest(BaseModel):
    conversation_id: str
    message: str = Field(min_length=1)
    paper_ids: Optional[List[str]] = None
    retrieval_mode: Optional[str] = "hybrid_reranked"

class ChatQueryResponse(BaseModel):
    message_id: str
    role: str = "assistant"
    content: str
    citations: List[CitationResponse] = []
    context_chunks_retrieved: int = 0
    model_used: str = "researchlens-neural-rag"

# --- Comparison & Literature Review Schemas ---
class ComparisonCreate(BaseModel):
    project_id: str
    title: str
    paper_ids: List[str]

class ComparisonResponse(BaseModel):
    id: str
    project_id: str
    title: str
    paper_ids: List[str]
    matrix: Dict[str, Any]
    comparative_synthesis_markdown: str
    created_at: datetime

class LiteratureReviewCreate(BaseModel):
    project_id: str
    title: str
    paper_ids: List[str]

class LiteratureReviewResponse(BaseModel):
    id: str
    project_id: str
    title: str
    paper_ids: List[str]
    review_markdown: str
    sections: List[Dict[str, Any]]
    references: List[str]
    created_at: datetime

# --- Dashboard & Stats Schemas ---
class DashboardStatsResponse(BaseModel):
    total_papers: int
    total_pages_extracted: int
    total_notes: int
    total_collections: int
    active_project_id: str
    active_project_title: str
    recent_papers: List[PaperResponse]
    topic_distribution: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
