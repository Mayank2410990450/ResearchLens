# ResearchLens: REST & WebSocket API Specification

## 1. Overview & Protocol Architecture

ResearchLens provides a RESTful HTTP API (FastAPI) and bidirectional WebSockets for real-time document processing updates and streaming token generation.

- **Base URL**: `/api/v1`
- **Authentication**: Bearer JWT tokens (`Authorization: Bearer <token>`) or Supabase Session token.
- **Content Types**: `application/json`, `multipart/form-data` for PDF uploads.
- **Error Format**: RFC 7807 compliant problem details JSON with human-readable error messages.

---

## 2. Authentication & User Profile Endpoints

### `POST /api/v1/auth/register`
Creates a new researcher account.
- **Request Body**:
  ```json
  {
    "email": "dr.sharma@stanford.edu",
    "password": "StrongPassword!2026",
    "full_name": "Dr. Priya Sharma",
    "institution": "Stanford AI Lab"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "email": "dr.sharma@stanford.edu",
      "full_name": "Dr. Priya Sharma",
      "institution": "Stanford AI Lab",
      "role": "researcher"
    },
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```

### `POST /api/v1/auth/login`
Authenticates user and returns JWT.

### `GET /api/v1/auth/me`
Retrieves current authenticated researcher profile.

---

## 3. Research Projects & Collections

### `GET /api/v1/projects`
Lists all research projects for the authenticated user.

### `POST /api/v1/projects`
Creates a new research project workspace.
- **Request Body**:
  ```json
  {
    "title": "Efficiency in Vision-Language Models",
    "description": "Investigating parameter-efficient fine-tuning and pruning techniques for multimodal architectures.",
    "research_field": "Computer Science / Computer Vision"
  }
  ```

### `GET /api/v1/projects/{project_id}/collections`
Retrieves categorized collections (e.g. "Baselines", "Quantization").

---

## 4. Research Paper Library & Document Ingestion

### `POST /api/v1/papers/upload`
Uploads one or more scientific PDF documents for parsing, chunking, and indexing.
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: PDF file binary.
  - `project_id`: Target project UUID.
- **Response (202 Accepted)**:
  ```json
  {
    "paper_id": "8f8a1e20-3b4c-4e5a-90ab-123456789abc",
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_name": "attention_is_all_you_need.pdf",
    "status": "processing",
    "message": "Paper uploaded successfully. Background indexing started."
  }
  ```

### `GET /api/v1/papers`
Query and list papers in a project with filtering and pagination.
- **Query Parameters**:
  - `project_id` (UUID, required)
  - `search` (string, optional: matches title, authors, keywords)
  - `status` (string, optional: `indexed`, `processing`, `failed`)
  - `year` (int, optional)
  - `collection_id` (UUID, optional)
  - `sort_by` (`created_at`, `publication_year`, `title`)
  - `order` (`asc`, `desc`)
  - `page` (int, default 1), `limit` (int, default 20)

### `GET /api/v1/papers/{paper_id}`
Returns full paper details, including extracted metadata, page count, and section outline.

### `GET /api/v1/papers/{paper_id}/pdf`
Streams the raw PDF file for rendering in the interactive client PDF viewer.

### `GET /api/v1/papers/{paper_id}/status`
Polls status of background ingestion job.

### `DELETE /api/v1/papers/{paper_id}`
Deletes paper, chunks, embeddings, citations, notes, and raw file.

---

## 5. Advanced RAG Research Assistant

### `POST /api/v1/chat/conversations`
Creates a new conversation thread.
- **Request Body**:
  ```json
  {
    "project_id": "d3b07384-d113-4670-bb5c-7b003c582f3c",
    "paper_id": "8f8a1e20-3b4c-4e5a-90ab-123456789abc", // null for multi-paper
    "title": "Methodology Analysis of Self-Attention"
  }
  ```

### `POST /api/v1/chat/query`
Executes hybrid retrieval, reranking, and grounded generation.
- **Request Body**:
  ```json
  {
    "conversation_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "message": "What is the primary computational complexity bottleneck of standard self-attention, and what alternative does the author propose?",
    "paper_ids": ["8f8a1e20-3b4c-4e5a-90ab-123456789abc"],
    "retrieval_mode": "hybrid_reranked",
    "stream": false
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "role": "assistant",
    "content": "Standard self-attention exhibits an \\(O(n^2)\\) computational complexity bottleneck with respect to sequence length \\(n\\)...",
    "citations": [
      {
        "citation_id": "cit-001",
        "paper_id": "8f8a1e20-3b4c-4e5a-90ab-123456789abc",
        "paper_title": "Attention Is All You Need",
        "page_number": 4,
        "section_title": "3.2 Attention",
        "exact_quote": "The computational complexity per layer is O(n^2 * d)...",
        "confidence_score": 0.94,
        "verification_status": "verified"
      }
    ],
    "context_chunks_retrieved": 5,
    "model_used": "gpt-4o-mini"
  }
  ```

### `WebSocket /api/v1/ws/chat/{conversation_id}`
Bidirectional WebSocket for token-by-token streaming responses with interleaved citation events.

---

## 6. Multi-Paper Comparison Engine

### `POST /api/v1/comparison/generate`
Performs structured comparative extraction across 2+ selected papers.
- **Request Body**:
  ```json
  {
    "project_id": "d3b07384-d113-4670-bb5c-7b003c582f3c",
    "paper_ids": [
      "8f8a1e20-3b4c-4e5a-90ab-123456789abc",
      "9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d"
    ],
    "title": "Transformer vs Performer Architecture Comparison"
  }
  ```
- **Response (200 OK)**:
  Returns comparative JSON grid covering:
  `research_objective`, `problem_statement`, `methodology`, `datasets`, `algorithms`, `evaluation_metrics`, `results`, `limitations`, `future_work`, accompanied by synthesis narrative.

### `GET /api/v1/comparison/reports/{report_id}`
Fetches saved comparison matrix.

---

## 7. Research Gap Explorer

### `POST /api/v1/gaps/analyze`
Scans uploaded corpus for repeated limitations, experimental divergence, and open hypotheses.
- **Request Body**:
  ```json
  {
    "project_id": "d3b07384-d113-4670-bb5c-7b003c582f3c",
    "paper_ids": [] // empty means all papers in project
  }
  ```
- **Response (200 OK)**:
  Returns structured gap objects distinguishing:
  - `author_reported_limitations` (verifiable author quotes)
  - `corpus_divergences` (e.g. Paper A tested only synthetic data, Paper B tested real-world clinical data)
  - `ai_hypothesized_gaps` (carefully flagged as speculative research opportunities)

---

## 8. Literature Review Synthesis

### `POST /api/v1/literature-review/generate`
Synthesizes a structured literature review.
- **Request Body**:
  ```json
  {
    "project_id": "d3b07384-d113-4670-bb5c-7b003c582f3c",
    "paper_ids": ["8f8a1e20...", "9a1b2c3d..."],
    "review_focus": "Efficient attention mechanisms in vision and text models",
    "format": "markdown"
  }
  ```

### `GET /api/v1/literature-review/reports/{id}/export`
Exports review in Markdown or PDF with formatted references.

---

## 9. Research Analytics

### `GET /api/v1/analytics/overview`
Returns real data-derived statistics:
- Total papers, total pages indexed, chunk counts.
- Timeline of publication years.
- Top methodologies extracted.
- Top keywords and datasets across the project.
- Activity log over time.

---

## 10. Information Retrieval & RAG Benchmark Evaluation

### `POST /api/v1/evaluation/run`
Executes empirical comparison between:
- Sparse BM25
- Dense Vector (pgvector)
- Hybrid RRF
- Hybrid + Cross-Encoder Reranker
- **Returns**: Precision@5, Recall@5, MRR, Mean Latency (ms), and faithfulness score.
