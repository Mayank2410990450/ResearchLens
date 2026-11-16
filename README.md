# ResearchLens — AI-Powered Research Intelligence & Scientific Discovery Platform

ResearchLens is a scientific research intelligence platform designed for researchers, academics, and university students to ingest scientific papers, analyze methodologies, discover research gaps, and conduct grounded inquiry with verifiable page-level citations.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────────┐
                      │              ResearchLens UI                 │
                      │   (Next.js 14 • Tailwind • Three.js WebGL)   │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP REST / WebSocket
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             FastAPI Backend v1.0             │
                      │  (Pydantic V2 • JWT • RFC 7807 • PyMuPDF)    │
                      └──────────────┬───────────────┬───────────────┘
                                     │               │
                     Dense + Lexical │               │ Storage
                                     ▼               ▼
                      ┌──────────────────────┐  ┌────────────────────┐
                      │ PostgreSQL / pgvector│  │  Document Storage  │
                      │ (HNSW Cosine + GIN)  │  │ (Supabase / Local) │
                      └──────────────────────┘  └────────────────────┘
```

---

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Three.js (WebGL constellation hero), Recharts, Lucide Icons.
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic migrations, Pydantic V2, PyMuPDF (`fitz`), NumPy, Scikit-learn.
- **Database:** PostgreSQL 16 with `pgvector` extension (HNSW index, cosine distance) and SQLite in-memory fallback for local testing.
- **Document Processing:** PyMuPDF page-by-page text, layout, and metadata extraction, 500-token sliding window chunking with 100-token overlap.
- **RAG & Search:** Hybrid Retrieval (Dense 384-d semantic embeddings + Sparse BM25 keyword matching) with configurable $\alpha$ balance and verifiable page-coordinate citations.
- **Containerization:** Docker, Docker Compose, GitHub Actions CI.

---

## Key Capabilities

1. **Intelligent Ingestion Pipeline:** Secure drag-and-drop PDF upload with SHA-256 deduplication, PyMuPDF page-by-page extraction, and HNSW index synchronization.
2. **AI Research Assistant:** Conversational scientific Q&A grounded strictly in paper text with verifiable citations (exact quotes, page numbers, and confidence ratings). Clicking citations jumps to the exact page and highlight in the split-screen reader.
3. **Cross-Paper Comparison Engine:** Side-by-side comparative matrices across methodologies, datasets, algorithms, results, and limitations with Markdown export.
4. **Literature Review Studio:** Automated synthesis drafts with thematic grouping, inline citation anchors, and bibliographies.
5. **Research Gap Explorer:** Systematic detection of scalability bottlenecks and architectural limitations, explicitly distinguishing verified document evidence from AI-generated hypotheses.
6. **Enterprise Security & Isolation:** User-level row isolation across all papers, projects, and notes. Prompt injection sanitization for uploaded document contents.

---

## Quickstart Guide

### Option 1: Docker Compose (Recommended for Full Stack)

```bash
# Clone the repository
git clone https://github.com/your-username/researchlens.git
cd researchlens

# Copy environment variables
cp .env.example .env

# Build and start all services (Postgres with pgvector, FastAPI backend, Next.js frontend)
docker compose up --build -d
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger):** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Option 2: Local Development Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI server with hot-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running the Automated Test Suite

ResearchLens includes comprehensive unit and integration tests covering authentication, database CRUD, cross-user isolation, PDF parsing, semantic embeddings, and hybrid RAG retrieval.

```bash
# Run all unit and integration tests
python -m pytest backend/tests/test_rag_pipeline.py backend/tests/test_api_endpoints.py -v
```

**Expected output:**
```
backend/tests/test_rag_pipeline.py::test_embedding_generation_and_cosine_similarity PASSED
backend/tests/test_rag_pipeline.py::test_hybrid_retrieval_and_citation_synthesis PASSED
backend/tests/test_rag_pipeline.py::test_document_chunking_preserves_pages PASSED
backend/tests/test_api_endpoints.py::test_auth_and_user_lifecycle PASSED
backend/tests/test_api_endpoints.py::test_projects_and_isolation PASSED
backend/tests/test_api_endpoints.py::test_full_rag_and_citation_pipeline PASSED
============================== 6 passed in 0.37s ==============================
```

---

## Production Build Verification

```bash
# Verify production frontend build
cd frontend
npm run build
```

---

## Environment Variables Configuration

See `.env.example` for all configurable parameters:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `sqlite:///./researchlens.db` |
| `JWT_SECRET` | Secret key for signing authentication tokens | Dev key |
| `ENVIRONMENT` | `development` or `production` | `development` |
| `HYBRID_ALPHA` | Weight between Dense (1.0) and Sparse (0.0) | `0.7` |
| `NEXT_PUBLIC_API_URL` | Frontend API base endpoint | `http://localhost:8000/api/v1` |

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
