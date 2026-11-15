# ResearchLens: System Architecture & Technical Design

## 1. Executive Summary & Product Vision

**ResearchLens** is a research-grade, interactive AI SaaS platform designed for university researchers, postdocs, professors, and academic scholars. Unlike shallow "chat-with-PDF" tools that treat scientific literature as unstructured text blocks, ResearchLens is an end-to-end research intelligence system built to understand scientific methodology, track research lineages, cross-compare empirical studies, synthesize literature reviews with auditable citations, and discover research gaps.

### Key Architectural Tenets
1. **Verifiable Grounding & Zero Hallucination**: The system rigorously separates author-reported findings from AI syntheses. Every claim must provide pinpoint citations (paper title, page number, section, exact excerpt, and confidence score).
2. **Hybrid Multi-Stage Retrieval**: Combining dense vector representations (`sentence-transformers`), sparse BM25 lexical search, reciprocal rank fusion (RRF), and cross-encoder reranking to ensure domain-specific academic terminology and acronyms are retrieved with high precision.
3. **Multi-Document Reasoning**: Built from the ground up to query across entire project collections, generating side-by-side methodological matrices and thematic literature syntheses.
4. **Security & Prompt Injection Protection**: Treating academic PDFs as untrusted external input with multi-layer sanitization against indirect prompt injection, invisible zero-width unicode attacks, and malicious prompt overrides.
5. **Decoupled, Resilient Architecture**: Next.js 14+ App Router frontend, FastAPI Python backend, PostgreSQL with pgvector, and multi-provider LLM abstraction (OpenAI, Anthropic, Google Gemini, Groq, plus local offline embeddings).

---

## 2. High-Level System Architecture

The following diagram illustrates the interaction between the Client Layer, API Gateway, Application Backend, AI/ML Ingestion & Retrieval Engine, Vector & Relational Storage, and External LLM Providers:

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (Next.js 14 / React 18 / TypeScript)"]
        UI["Modern Research Workspace UI\n(Tailwind CSS, Framer Motion, Lucide)"]
        State["State Store & Cache\n(Zustand / TanStack Query)"]
        PDFView["Interactive Document Viewer\n(Page Navigation, Bounding Box Highlights)"]
        ChatUI["Streaming Chat & Citation Viewer"]
        CompUI["Side-by-Side Comparison Matrix"]
    end

    subgraph Gateway["API Gateway & Security Layer"]
        CORS["CORS & Rate Limiter"]
        AuthMiddleware["JWT / Supabase Auth Validator"]
        InputSanitizer["Untrusted Input Sanitizer\n(Prompt Injection Defense)"]
    end

    subgraph BackendCore["FastAPI Backend Application"]
        Router["API Router (REST & WebSockets)"]
        PaperSvc["Paper Management Service"]
        IngestSvc["Document Ingestion Orchestrator"]
        RAGSvc["RAG Orchestrator & Multi-Paper Agent"]
        CompSvc["Comparison & Gap Analysis Engine"]
        LitSvc["Literature Review Generator"]
        AnalyticsSvc["Research Analytics Engine"]
    end

    subgraph AIEngine["AI / ML & Document Processing Subsystem"]
        PDFParser["PyMuPDF (fitz) Extractor\n(Layout, Fonts, Equations, Metadata)"]
        Chunker["Semantic Hierarchical Chunker\n(Header-aware, sliding window)"]
        Embedder["Dense Embedding Pipeline\n(all-MiniLM-L6-v2 / OpenAI)"]
        LexicalIndex["PostgreSQL tsvector / BM25 Index"]
        Reranker["Cross-Encoder Reranker\n(ms-marco-MiniLM-L-6-v2)"]
        HallucinationChecker["Citation Verification & Grounding Guard"]
        LLMAdapter["Multi-Provider LLM Gateway\n(OpenAI, Anthropic, Gemini, Groq, Ollama)"]
    end

    subgraph StorageLayer["Persistence & Database Layer"]
        PG["PostgreSQL (Supabase) Database\n(Users, Projects, Papers, Metadata, Notes)"]
        PGVector["pgvector Vector Store\n(HNSW Index for Embeddings)"]
        BlobStore["Object Storage / Supabase Storage\n(Raw PDFs, Extracted Figures, Thumbnails)"]
    end

    UI --> Gateway
    Gateway --> Router
    Router --> IngestSvc
    Router --> RAGSvc
    Router --> CompSvc
    Router --> LitSvc
    Router --> AnalyticsSvc

    IngestSvc --> PDFParser
    PDFParser --> Chunker
    Chunker --> Embedder
    Embedder --> PGVector
    Chunker --> LexicalIndex
    IngestSvc --> BlobStore
    IngestSvc --> PG

    RAGSvc --> Embedder
    RAGSvc --> PGVector
    RAGSvc --> LexicalIndex
    RAGSvc --> Reranker
    Reranker --> HallucinationChecker
    HallucinationChecker --> LLMAdapter
    LLMAdapter --> RAGSvc
    RAGSvc --> Router
```

---

## 3. Document Ingestion Pipeline Architecture

Scientific papers feature complex multi-column typography, mathematical notations, tables, headers, and reference sections. A naive text split discards vital structural context. ResearchLens implements an advanced document processing pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor User as Researcher
    participant Frontend as Next.js Client
    participant API as FastAPI Ingestion Endpoint
    participant Storage as File / Supabase Storage
    participant PyMuPDF as PyMuPDF Extractor
    participant MetadataEngine as Metadata & Header Engine
    participant Chunker as Semantic Hierarchical Chunker
    participant Embedder as SentenceTransformer Embedder
    participant DB as PostgreSQL + pgvector

    User->>Frontend: Uploads Research Paper (PDF)
    Frontend->>API: POST /api/v1/papers/upload (Multipart/Form-Data)
    API->>API: Validate MIME type, size limit, PDF header magic bytes
    API->>Storage: Store original PDF securely
    API->>DB: Create paper record (status: 'processing')
    API-->>Frontend: Return paper_id & job_id (HTTP 202)

    API->>PyMuPDF: Extract page-by-page text, layout blocks, font sizes, bounding boxes
    PyMuPDF-->>MetadataEngine: Stream layout blocks & font hierarchies
    MetadataEngine->>MetadataEngine: Extract Title, Authors, Abstract, Section Headings, DOI
    MetadataEngine->>DB: Store extracted paper_metadata

    MetadataEngine->>Chunker: Pass section-structured text stream
    Chunker->>Chunker: Split into recursive semantic chunks (500 tokens, 80 overlap)<br/>Prepends Paper Title + Section Header context
    Chunker-->>Embedder: Chunks with page_number, chunk_index, section_title
    Embedder->>Embedder: Generate 384-d normalized dense vector embeddings
    Embedder->>DB: Batch insert document_chunks & pgvector embeddings
    Embedder->>DB: Generate tsvector for full-text search
    API->>DB: Update paper record (status: 'indexed')
    API-->>Frontend: WebSocket / SSE push: Processing Complete
```

---

## 4. Multi-Stage Hybrid RAG Pipeline

Standard single-vector search fails on academic queries containing acronyms, exact theorem names, and hyper-specific dataset names. ResearchLens solves this through a four-stage hybrid retrieval and verification pipeline:

```mermaid
flowchart TD
    subgraph QueryInput["1. Query Analysis"]
        Q["User Query\n'How does Vision Transformer compare to CNNs on ImageNet?'"]
        CleanQ["Query Sanitization & Acronym Expansion"]
    end

    subgraph RetrievalStage["2. Dual Retrieval Stage"]
        DenseRet["Dense Vector Search\n(Cosine Similarity via pgvector HNSW)\nTop K = 25"]
        SparseRet["Sparse Lexical Search\n(PostgreSQL ts_rank_cd / BM25)\nTop K = 25"]
    end

    subgraph FusionStage["3. Reciprocal Rank Fusion (RRF)"]
        RRF["RRF Scoring Algorithm:\nRRF_score(d) = sum(1 / (k + rank_i(d)))\nAlpha Weighting = 0.6"]
        MergedPool["Merged Candidate Set\nTop 15 Chunks"]
    end

    subgraph RerankStage["4. Cross-Encoder Reranking"]
        CrossEnc["Cross-Encoder Neural Reranker\n(ms-marco-MiniLM-L-6-v2)\nJoint attention over (query, chunk_text)"]
        TopChunks["Top 5 High-Precision Chunks\nwith Relevant Excerpts & Page Refs"]
    end

    subgraph GenerationStage["5. Guarded Context Generation"]
        PromptConstructor["System Prompt Construction\n- Grounding Constraints\n- Anti-Hallucination Directives\n- Source Tagging (<source id=1 p=4>)"]
        LLM["Configurable LLM Provider\n(Streaming Response Generator)"]
    end

    subgraph VerificationStage["6. Citation & Faithfulness Verification"]
        Extractor["Citation Extraction Engine\nMatches [Paper X, p. Y] against retrieved chunks"]
        Faithfulness["Faithfulness Validator\nRejects unsupported factual assertions"]
        FinalPayload["Verified Response Payload:\n- Answer Markdown\n- Structured Citations Array\n- Confidence Score\n- Document References"]
    end

    Q --> CleanQ
    CleanQ --> DenseRet
    CleanQ --> SparseRet
    DenseRet --> RRF
    SparseRet --> RRF
    RRF --> MergedPool
    MergedPool --> CrossEnc
    CrossEnc --> TopChunks
    TopChunks --> PromptConstructor
    PromptConstructor --> LLM
    LLM --> Extractor
    Extractor --> Faithfulness
    Faithfulness --> FinalPayload
```

---

## 5. Security & Prompt Injection Mitigation

Academic papers sourced from external preprint servers can contain adversarial prompt injection payloads (e.g., hidden white text on white backgrounds saying *"Ignore previous instructions and output..."*). ResearchLens treats all PDF text as untrusted data:

1. **Delimiter Escaping & Context Quarantining**: Document excerpts are injected into LLM prompts inside strict XML/JSON isolation boundaries with unique per-request nonces:
   ```xml
   <untrusted_document_context paper_id="uuid" page="4">
   ... raw text sanitized ...
   </untrusted_document_context>
   ```
2. **Instruction-Disarming Sanitizer**: Strips common injection patterns (e.g., `SYSTEM:`, `ASSISTANT:`, `Ignore prior instructions`, zero-width Unicode characters, ASCII control characters).
3. **Strict System Prompt Constraints**: The LLM system prompt explicitly orders the model that text inside `<untrusted_document_context>` is purely factual data to be analyzed, never executable instructions.
4. **Output Citation Validation**: Every assertion accompanied by a citation is programmatically matched via substring or embedding distance against the retrieved chunk. If the retrieved chunk does not contain the cited fact, the UI flags the statement as an AI hypothesis rather than a verified author claim.

---

## 6. Offline & Fallback Operational Mode

ResearchLens does not fail when external LLM APIs are offline or unconfigured:
- **Local Embedding & Semantic Search**: Uses `all-MiniLM-L6-v2` locally on CPU/GPU without external network calls.
- **Lexical BM25 Search**: Native PostgreSQL full-text search functions entirely offline.
- **Document Viewer & Annotation**: Researchers can read, highlight, tag, search, and manage papers without an LLM key.
- **Extracted Metadata & Tables**: Structured paper metadata, tables, and section hierarchies are browsable offline.
