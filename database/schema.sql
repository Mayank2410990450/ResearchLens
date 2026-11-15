-- ==============================================================================
-- ResearchLens: Complete Database Schema
-- Compatible with PostgreSQL 15+ and pgvector extension
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Utility Trigger Function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Users Table (Local Auth or Supabase Auth synchronization)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'researcher',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Research Projects
CREATE TABLE IF NOT EXISTS research_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    research_field VARCHAR(100) DEFAULT 'Computer Science',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_projects_user_id ON research_projects(user_id);
CREATE TRIGGER update_research_projects_updated_at
BEFORE UPDATE ON research_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Research Papers
CREATE TABLE IF NOT EXISTS research_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_hash CHAR(64) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    page_count INT NOT NULL DEFAULT 0,
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_paper_hash UNIQUE (project_id, file_hash)
);

CREATE INDEX IF NOT EXISTS idx_research_papers_project_id ON research_papers(project_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_user_id ON research_papers(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_status ON research_papers(processing_status);
CREATE TRIGGER update_research_papers_updated_at
BEFORE UPDATE ON research_papers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Paper Metadata
CREATE TABLE IF NOT EXISTS paper_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL DEFAULT '{}',
    abstract TEXT,
    publication_year INT,
    journal_or_venue VARCHAR(500),
    doi VARCHAR(255),
    keywords TEXT[] NOT NULL DEFAULT '{}',
    primary_methodology VARCHAR(255),
    primary_dataset VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paper_metadata_paper_id ON paper_metadata(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_metadata_year ON paper_metadata(publication_year);
CREATE TRIGGER update_paper_metadata_updated_at
BEFORE UPDATE ON paper_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Document Chunks (Hierarchical with lexical tsvector)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT NOT NULL,
    section_title VARCHAR(255),
    content TEXT NOT NULL,
    token_count INT NOT NULL,
    tsv TSVECTOR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_paper_chunk_index UNIQUE (paper_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_document_chunks_paper_id ON document_chunks(paper_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_page ON document_chunks(paper_id, page_number);
CREATE INDEX IF NOT EXISTS idx_document_chunks_tsv ON document_chunks USING GIN(tsv);

-- Automatically populate tsvector on chunk insertion/update
CREATE OR REPLACE FUNCTION document_chunks_tsv_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tsv = to_tsvector('english', COALESCE(NEW.section_title, '') || ' ' || NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_chunks_tsv
BEFORE INSERT OR UPDATE ON document_chunks
FOR EACH ROW EXECUTE FUNCTION document_chunks_tsv_trigger();

-- 8. Document Embeddings (pgvector 384-d normalized vectors)
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE UNIQUE,
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    embedding_model VARCHAR(100) NOT NULL,
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_paper_id ON document_embeddings(paper_id);
-- HNSW index for high performance approximate cosine nearest neighbors search
CREATE INDEX IF NOT EXISTS idx_document_embeddings_hnsw 
ON document_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 9. Conversations (Single-paper or multi-paper)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES research_papers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Research Discussion',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_paper_id ON conversations(paper_id);
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- 11. Citations
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    exact_quote TEXT NOT NULL,
    confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    verification_status VARCHAR(50) NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'unverified', 'ai_hypothesis')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citations_message_id ON citations(message_id);
CREATE INDEX IF NOT EXISTS idx_citations_chunk_id ON citations(chunk_id);
CREATE INDEX IF NOT EXISTS idx_citations_paper_id ON citations(paper_id);

-- 12. Research Collections
CREATE TABLE IF NOT EXISTS research_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_hex VARCHAR(20) NOT NULL DEFAULT '#6366F1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_collections_project_id ON research_collections(project_id);

-- 13. Collection Papers (Junction Table)
CREATE TABLE IF NOT EXISTS collection_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES research_collections(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_collection_paper UNIQUE (collection_id, paper_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_papers_coll ON collection_papers(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_papers_paper ON collection_papers(paper_id);

-- 14. Research Notes
CREATE TABLE IF NOT EXISTS research_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES research_papers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content_markdown TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_notes_project ON research_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_research_notes_paper ON research_notes(paper_id);
CREATE TRIGGER update_research_notes_updated_at
BEFORE UPDATE ON research_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Highlights
CREATE TABLE IF NOT EXISTS highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    selected_text TEXT NOT NULL,
    bounding_box_json JSONB,
    color VARCHAR(30) NOT NULL DEFAULT 'yellow',
    note_id UUID REFERENCES research_notes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_highlights_paper_page ON highlights(paper_id, page_number);

-- 16. Comparison Reports
CREATE TABLE IF NOT EXISTS comparison_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    paper_ids UUID[] NOT NULL,
    matrix_json JSONB NOT NULL,
    comparative_synthesis_markdown TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comparison_reports_project ON comparison_reports(project_id);
CREATE TRIGGER update_comparison_reports_updated_at
BEFORE UPDATE ON comparison_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Generated Literature Reviews
CREATE TABLE IF NOT EXISTS generated_literature_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    paper_ids UUID[] NOT NULL,
    review_markdown TEXT NOT NULL,
    sections_json JSONB NOT NULL,
    references_json JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_literature_reviews_project ON generated_literature_reviews(project_id);
CREATE TRIGGER update_literature_reviews_updated_at
BEFORE UPDATE ON generated_literature_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. Processing Jobs
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES research_papers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
    step_description VARCHAR(255) NOT NULL DEFAULT 'Queued',
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_processing_jobs_paper ON processing_jobs(paper_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE TRIGGER update_processing_jobs_updated_at
BEFORE UPDATE ON processing_jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    ip_address VARCHAR(45),
    metadata_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- 20. Retrieval Evaluations
CREATE TABLE IF NOT EXISTS retrieval_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_query TEXT NOT NULL,
    ground_truth_chunk_ids UUID[] NOT NULL DEFAULT '{}',
    retrieved_chunk_ids UUID[] NOT NULL DEFAULT '{}',
    retrieval_mode VARCHAR(50) NOT NULL,
    recall_at_5 FLOAT NOT NULL,
    precision_at_5 FLOAT NOT NULL,
    mrr FLOAT NOT NULL,
    latency_ms FLOAT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retrieval_evaluations_user ON retrieval_evaluations(user_id);

-- 21. Row Level Security (RLS) Policies
ALTER TABLE research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_literature_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase environments, auth.uid() corresponds to the authenticated user ID.
-- Example policy for projects:
-- CREATE POLICY projects_isolation ON research_projects
--   FOR ALL USING (auth.uid() = user_id);
