# ResearchLens: Implementation Roadmap & Development Phases

This roadmap outlines the engineering execution plan for ResearchLens across all 7 defined development phases.

---

## Phase 1: Architecture, Design & Foundations
- [x] Workspace inspection and Git repository setup.
- [x] High-level System Architecture & Component Interaction design (`docs/ARCHITECTURE.md`).
- [x] Normalized PostgreSQL & pgvector Database Schema design with DDL (`docs/DATABASE_DESIGN.md`, `database/schema.sql`).
- [x] REST & WebSocket API Protocol Specification (`docs/API_SPECIFICATION.md`).
- [x] UI/UX Design System, Typography, Layout, and Component Specs (`docs/UI_UX_SPECIFICATION.md`).
- [x] Evaluation Methodology and Benchmark Metrics Formulation (`docs/EVALUATION_METHODOLOGY.md`).
- [x] Comprehensive Environment Configuration (`.env.example`).
- [x] Project Structure Initialization (`frontend/`, `backend/`, `database/`, `ai-engine/`, `evaluation/`, `docs/`, `tests/`).

---

## Phase 2: Frontend Foundation, Navigation, Dashboard & Library
- [ ] Initialize Next.js 14 App Router project with TypeScript, Tailwind CSS, Lucide Icons, and Framer Motion.
- [ ] Implement global design tokens, Navy/Slate/Violet theme, and responsive Sidebar & Top Navigation layouts.
- [ ] Build Authentication context and user session management (Supabase / local fallback).
- [ ] Implement Module A: Intelligent Research Dashboard (KPI cards, timeline feed, Recharts visualizations).
- [ ] Implement Module B: Research Paper Library (Drag-and-drop PDF dropzone, search, multi-faceted filters, paper cards, table view, collection tags).
- [ ] Frontend unit & component tests.

---

## Phase 3: Document Processing, Chunking & Embedding Pipeline
- [ ] Build FastAPI backend core application structure with dependency injection and configuration.
- [ ] Implement PyMuPDF (fitz) PDF parsing service (extracting titles, authors, abstract, headings, page numbers, text blocks).
- [ ] Implement Semantic Hierarchical Chunker (token-aware sliding window, section header prefixing).
- [ ] Implement Embedding Service (SentenceTransformers `all-MiniLM-L6-v2` dense vectors + pgvector integration).
- [ ] Implement asynchronous background ingestion worker and job status tracking (`processing_jobs`).
- [ ] Document deduplication via SHA-256 hash checks.
- [ ] Integration tests for PDF ingestion and embedding generation.

---

## Phase 4: Advanced RAG Retrieval, Assistant & Traceable Citations
- [ ] Implement hybrid retrieval engine (Dense pgvector cosine + Sparse PostgreSQL tsvector BM25 with Reciprocal Rank Fusion).
- [ ] Implement Cross-Encoder Neural Reranker (`ms-marco-MiniLM-L-6-v2`).
- [ ] Implement multi-provider LLM adapter (OpenAI, Anthropic, Gemini, Groq, local offline fallback).
- [ ] Implement citation verification engine (grounding verification, page validation, confidence scoring).
- [ ] Implement prompt injection defense filter and delimited context isolation.
- [ ] Build interactive Split-Screen UI: PDF viewer on left, streaming conversation thread on right with clickable citation navigation.
- [ ] Real-time token streaming via WebSocket / Server-Sent Events.

---

## Phase 5: Multi-Paper Comparison, Gap Explorer & Literature Review
- [ ] Implement Module D: Multi-Paper Comparison Engine (structured matrix extraction across objective, methodology, datasets, metrics, results, limitations).
- [ ] Implement Module E: Research Gap Explorer (categorization of author-reported limitations vs. AI-hypothesized gaps).
- [ ] Implement Module F: Literature Review Generator (structured academic synthesis with markdown/PDF export).
- [ ] Implement Module G: Notes & Highlights (text annotations linked to PDF bounding coordinates).
- [ ] Implement Module H: Research Analytics (interactive Recharts connected to live database queries).

---

## Phase 6: Security, Rigorous Evaluation & Testing
- [ ] Run benchmark evaluation suite across Sparse, Dense, Hybrid, and Hybrid+Reranked modes.
- [ ] Generate empirical benchmark evaluation report (`Recall@5`, `Precision@5`, `MRR`, `Faithfulness`, `Latency`).
- [ ] Implement rate limiting, file upload sanitization, and input validation security layers.
- [ ] End-to-end backend and frontend automated test suite (`pytest` + React component tests).

---

## Phase 7: Docker, Deployment Preparation & GitHub Presentation
- [ ] Multi-container `docker-compose.yml` (Next.js frontend, FastAPI backend, PostgreSQL with pgvector).
- [ ] GitHub Actions CI/CD workflows (linting, automated testing, docker build validation).
- [ ] Comprehensive `README.md` with architecture diagrams, setup guides, API docs, and screenshots.
- [ ] Technical documentation review and project readiness sign-off.
