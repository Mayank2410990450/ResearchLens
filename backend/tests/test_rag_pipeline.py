import pytest
from app.services.pdf_processor import pdf_processor
from app.services.rag_engine import rag_engine

def test_embedding_generation_and_cosine_similarity():
    text1 = "Transformer self-attention mechanism replaces recurrent layers."
    text2 = "Self-attention computational complexity per layer is O(n^2)."
    text3 = "Convolutional filters for image segmentation and edge detection."

    emb1 = rag_engine.generate_embedding(text1)
    emb2 = rag_engine.generate_embedding(text2)
    emb3 = rag_engine.generate_embedding(text3)

    assert len(emb1) == 384
    assert len(emb2) == 384
    assert len(emb3) == 384

    # Related transformer texts should have higher cosine similarity than unrelated vision text
    sim_related = rag_engine.cosine_similarity(emb1, emb2)
    sim_unrelated = rag_engine.cosine_similarity(emb1, emb3)

    assert sim_related > sim_unrelated
    assert 0.0 <= sim_related <= 1.0

def test_hybrid_retrieval_and_citation_synthesis():
    chunks = [
        {
            "chunk_id": "c1",
            "paper_id": "p-transformer",
            "page_number": 4,
            "section_title": "3.2 Scaled Dot-Product Attention",
            "content": "The computational complexity of self-attention per layer is O(n^2 * d) where n is the sequence length."
        },
        {
            "chunk_id": "c2",
            "paper_id": "p-transformer",
            "page_number": 6,
            "section_title": "4. Training Details",
            "content": "Models were trained on 8 NVIDIA P100 GPUs using Adam optimizer with beta1=0.9 and beta2=0.98."
        },
        {
            "chunk_id": "c3",
            "paper_id": "p-resnet",
            "page_number": 2,
            "section_title": "2. Related Work",
            "content": "Deep networks suffer from degradation: with network depth increasing, accuracy gets saturated."
        }
    ]

    # Pre-calculate embeddings for candidate chunks
    for ch in chunks:
        ch["embedding"] = rag_engine.generate_embedding(ch["content"])

    query = "What is the computational complexity of self-attention?"
    retrieved = rag_engine.hybrid_retrieve(query, chunks, top_k=2, alpha=0.7)

    assert len(retrieved) == 2
    # Top chunk should be c1 (attention complexity)
    assert retrieved[0]["chunk_id"] == "c1"
    assert retrieved[0]["hybrid_score"] > retrieved[1]["hybrid_score"]

    # Synthesize grounded answer
    answer, citations = rag_engine.synthesize_grounded_answer(
        query=query,
        retrieved_chunks=retrieved,
        paper_title="Attention Is All You Need"
    )

    assert len(citations) >= 1
    assert citations[0]["page_number"] == 4
    assert "computational complexity" in citations[0]["exact_quote"]
    assert citations[0]["verification_status"] == "verified"
    assert citations[0]["confidence_score"] >= 0.85
    assert "Attention Is All You Need" in answer

def test_document_chunking_preserves_pages():
    mock_pages = [
        {"page_number": 1, "text": "Abstract: We propose an efficient attention mechanism. Introduction: Deep models are heavy."},
        {"page_number": 2, "text": "Methodology: We partition sequence matrices into blocks. This reduces GPU memory traffic from quadratic to linear."}
    ]

    chunks = pdf_processor.chunk_document(mock_pages, target_chunk_size=100, overlap=20)
    assert len(chunks) >= 2
    assert chunks[0]["page_number"] == 1
    assert any(c["page_number"] == 2 for c in chunks)
    for c in chunks:
        assert c["token_count"] > 0
        assert len(c["content"]) > 10
