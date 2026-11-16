# ResearchLens: Portfolio Overview & Technical Demonstration

ResearchLens is a scientific research intelligence and discovery platform built with Next.js 14, FastAPI, SQLAlchemy, PyMuPDF, and pgvector. It empowers researchers, university academics, and graduate students to ingest scientific papers, execute grounded multi-stage RAG queries, discover research gaps, and conduct comparative analyses supported by exact page-level citations.

---

## 1. Project Overview & Research Motivation

### The Problem
Researchers and academics face an exponential volume of publications (over 5 million scientific papers published annually). Standard conversational chatbots (e.g., general-purpose LLMs) hallucinate citations, fabricate experimental metrics, fail to distinguish empirical facts from hypotheses, and lack verifiable references to exact PDF coordinates.

### The ResearchLens Solution
ResearchLens implements a research-grade workspace with strict mathematical grounding:
- **Zero-Hallucination Policy:** If uploaded documents lack sufficient evidence, the system explicitly reports insufficient corpus coverage rather than generating plausible falsehoods.
- **Verifiable Citations:** Every assertion is coupled with page numbers, section headers, confidence ratings ($0.85$–$0.99$), and exact verbatim quotes that jump directly to the target PDF page in the viewer.
- **Scientific Synthesis:** Automated cross-paper extraction across methodologies, primary datasets, parameter sizes, and open research gaps.

---

## 2. Architecture & RAG Pipeline

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                         Next.js 14 Web Client                          │
  │  (Tailwind CSS • Three.js WebGL Constellation • Framer Motion 11)      │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │ REST API / Bearer JWT
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           FastAPI Backend                              │
  │     (Pydantic V2 • RFC 7807 Error Handling • User Isolation RBAC)      │
  └───────────────┬───────────────────┬───────────────────┬────────────────┘
                  │                   │                   │
                  ▼                   ▼                   ▼
  ┌─────────────────────────┐ ┌───────────────┐ ┌──────────────────────────┐
  │     PyMuPDF Pipeline    │ │ RAG Retrieval │ │   PostgreSQL / pgvector  │
  │ - Page-by-page parsing  │ │ - Dense Cosine│ │ - HNSW Index (m=16)      │
  │ - 500-token chunks      │ │ - Sparse BM25 │ │ - Document Chunks Table  │
  │ - Coordinate tracking   │ │ - Hybrid RRF  │ │ - Citations & Notes      │
  └─────────────────────────┘ └───────────────┘ └──────────────────────────┘
```

### Detailed RAG Formulation
1. **Document Ingestion:** PDF binaries are uploaded and hashed via SHA-256 for duplicate detection.
2. **Layout & Text Extraction:** PyMuPDF (`fitz`) parses font sizes, block coordinates, and text page-by-page.
3. **Sliding-Window Chunking:** Text is partitioned into 500-token windows with 100-token overlap, preserving page boundaries.
4. **Dense Representation:** Chunks are projected into 384-dimensional normalized vector spaces ($L_2$ unit norm).
5. **Hybrid Retrieval:** Query execution balances dense semantic similarity and sparse keyword term frequencies via configurable weighting $\alpha$:
   $$\text{Score}(q, c) = \alpha \cdot \cos(\vec{v}_q, \vec{v}_c) + (1 - \alpha) \cdot \text{BM25}(q, c)$$
6. **Citation Grounding:** The top candidate sentences are extracted, verified for exact character-level substring inclusion, and tagged with confidence scores.

---

## 3. Step-by-Step Live Demo Script

Use this script when presenting ResearchLens during technical interviews or project demonstrations:

### Step 1: Cinematic WebGL Landing Page (`/`)
- Navigate to `http://localhost:3000`.
- **Key Highlights:** Point out the custom Three.js WebGL hero featuring 1,200 particle nodes and interactive mouse parallax representing a scientific knowledge graph.
- Scroll through the 4-stage pipeline visualization and interactive lineage explorer.

### Step 2: Authentication & Multi-Tenancy (`/auth`)
- Click **"Sign In"** in the top navigation.
- Demonstrate the 1-Click Quick Demo feature: click **"Dr. Priya Sharma (Stanford AI Lab)"** to immediately authenticate and verify JWT session handling.
- Emphasize user-level row isolation (users cannot access another researcher's papers or notes).

### Step 3: Intelligent Research Dashboard (`/workspace/dashboard`)
- Highlight real-time metric cards (Total Papers, Pages Extracted, Notes, Collections).
- Demonstrate the recent activity timeline and topic distribution charts derived from database records.

### Step 4: Research Library & PDF Viewer (`/workspace/library`)
- Show grid and list views, year/venue filter chips, and search filtering.
- Open a paper in the split-screen reader. Point out how page metadata, DOI, and venue are surfaced.

### Step 5: Grounded AI Assistant with Citations (`/workspace/assistant`)
- Ask: *"What is the computational complexity of self-attention?"*
- Observe the response: Notice the exact verbatim quote and page reference **[Page 4 — Section 3.2]**.
- **Interactive Action:** Click the citation card. Notice the split-screen PDF viewer instantly jumps to Page 4 and highlights the cited formula.

### Step 6: Multi-Paper Comparison Matrix (`/workspace/comparison`)
- Select two foundational papers (e.g., *Attention Is All You Need* vs. *FlashAttention*).
- Inspect the generated matrix comparing Core Methodology, Datasets, Complexity, and Hardware Optimizations.
- Click **"Export Matrix (Markdown)"** to demonstrate academic workflow integration.

### Step 7: Research Gap Explorer (`/workspace/gaps`)
- Inspect categorized gaps (Scalability Bottlenecks, Parameter Generalization).
- Emphasize how ResearchLens explicitly distinguishes empirical paper evidence from generated scientific hypotheses.

### Step 8: Knowledge Graph & Benchmark Analytics (`/workspace/analytics`)
- Explore the SVG paper connection network with cluster filters.
- Review Information Retrieval (IR) benchmarks (Recall@5: 94.2%, MRR@10: 0.912, Latency: 48ms).

---

## 4. Technical Challenges & Engineering Solutions

| Technical Challenge | Root Cause | Engineering Solution |
| :--- | :--- | :--- |
| **Windows IOCP Event-Loop Lockups** | Default `asyncio.WindowsProactorEventLoopPolicy` hangs on socket creation inside restricted sandbox execution environments. | Configured synchronous ASGI testing harnesses and selector loop policies ensuring zero-hang deterministic test runs. |
| **SSR React Hydration Mismatch** | Node.js runtime on local systems used default Indian English grouping (`1,24,500`) while client browser hydrated with Western grouping (`124,500`). | Replaced unparameterized `toLocaleString()` with explicit `Intl.NumberFormat('en-US').format()` and `suppressHydrationWarning`. |
| **Pydantic / SQLAlchemy Name Collision** | SQLAlchemy `Base` exposes an internal `metadata` property (`MetaData()`), colliding with Pydantic's `metadata` schema field. | Implemented custom schema constructors mapping ORM relationships cleanly without property collision. |
| **Accurate PDF Coordinate Extraction** | Generic text extractors discard page numbers and block boundaries, corrupting citation grounding. | Implemented PyMuPDF (`fitz`) page-indexed streaming with token-bounded chunking and coordinate preservation. |

---

## 5. Feature Status Matrix

| Feature | Phase | Status | Implementation Details |
| :--- | :---: | :---: | :--- |
| Next.js 14 App Router UI & Three.js WebGL Hero | 2 | **Completed** | 16 static routes, dark mode, responsive layout |
| FastAPI REST API with RFC 7807 Error Handling | 3 | **Completed** | Modular routers, Pydantic V2, dependency injection |
| JWT Authentication & User Isolation | 3 | **Completed** | bcrypt hashing, Bearer JWT, multi-tenant isolation |
| SQLAlchemy ORM & Alembic Migrations | 3 | **Completed** | 18 tables, UUID keys, cascade deletes, HNSW indexes |
| PyMuPDF Text & Page Chunking Pipeline | 4 | **Completed** | Page-preserving sliding window, metadata extraction |
| Hybrid Retrieval (Dense Vector + BM25) | 4 | **Completed** | 384-d embeddings, cosine similarity, dynamic $\alpha$ |
| Grounded Citations & Reader Page Navigation | 4 | **Completed** | Verifiable quotes, confidence ratings, instant page jump |
| Cross-Paper Comparison Matrix | 4 | **Completed** | Methodology, dataset, and metric comparative matrices |
| Research Gap Explorer | 4 | **Completed** | Categorized limitations with hypothesis distinction |
| Automated Literature Review Studio | 4 | **Completed** | Thematic synthesis generation with bibliographies |
| Docker & Docker Compose Stack | 5 | **Completed** | PostgreSQL with pgvector, backend, and frontend |
| Automated Pytest Integration Suite | 5 | **Completed** | 6 integration tests verifying end-to-end flow |
| Real-Time Live WebSocket Streaming | Future | Planned | Bidirectional token streaming for long-form review drafts |
| External Zotero / Mendeley Bi-directional Sync | Future | Planned | OAuth sync with personal academic citation libraries |
