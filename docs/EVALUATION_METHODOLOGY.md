# ResearchLens: Information Retrieval & RAG Evaluation Methodology

## 1. Evaluation Philosophy

Scientific question answering demands substantially higher precision than general web search. A researcher acting on a misattributed theorem, an inverted empirical benchmark result, or a fabricated citation can waste weeks of investigative effort.

ResearchLens incorporates a rigorous, empirical evaluation harness to measure:
1. **Retrieval Efficacy**: Does the multi-stage retriever place the exact ground-truth paragraph into the top 5 chunks?
2. **Answer Faithfulness**: Is every factual proposition made by the LLM strictly supported by the retrieved context?
3. **Citation Precision**: Does the cited page and excerpt actually contain the claim it purports to prove?
4. **End-to-End Latency**: How do different retrieval pipeline configurations trade off latency for retrieval quality?

---

## 2. Evaluation Metrics Definition

### 2.1 Retrieval Metrics

#### Recall@K
The fraction of relevant ground-truth chunks retrieved in the top $K$ positions:
$$\text{Recall}@K = \frac{|\text{Retrieved}_K \cap \text{Relevant}|}{|\text{Relevant}|}$$

#### Precision@K
The fraction of retrieved chunks in the top $K$ positions that are genuinely relevant to the query:
$$\text{Precision}@K = \frac{|\text{Retrieved}_K \cap \text{Relevant}|}{K}$$

#### Mean Reciprocal Rank (MRR)
Measures the rank of the first relevant chunk across a set of $Q$ queries:
$$\text{MRR} = \frac{1}{|Q|} \sum_{i=1}^{|Q|} \frac{1}{\text{rank}_i}$$
Where $\text{rank}_i$ is the position of the first ground-truth relevant chunk for query $i$ (or $0$ if not found within top $K$).

---

### 2.2 Generation & Grounding Metrics

#### Citation Correctness (Ground-Truth Overlap)
Calculated by computing token-level n-gram overlap and semantic embedding similarity between the quoted citation string and the true source page text:
$$\text{Citation Correctness} = \begin{cases} 1 & \text{if quote exists on cited page with substring/fuzzy match } \ge 90\% \\ 0 & \text{otherwise} \end{cases}$$

#### Answer Faithfulness
Evaluates hallucination by breaking the generated response into discrete atomic statements $S = \{s_1, s_2, \dots, s_n\}$ and computing what percentage of statements are directly deducible from the retrieved chunks:
$$\text{Faithfulness} = \frac{\sum_{i=1}^n \mathbb{I}(s_i \text{ supported by Context})}{n}$$

#### Answer Relevance
Measures whether the generated answer directly addresses the researcher's query without conversational filler or extraneous divergence:
$$\text{Relevance} = \cos(\mathbf{e}_{\text{query}}, \mathbf{e}_{\text{answer}})$$

#### Latency (p50, p95)
Measured in milliseconds from query submission to final verified response.

---

## 3. Retrieval Pipeline Comparison Benchmark

The evaluation system rigorously compares four distinct retrieval pipelines:

| Mode | Pipeline Description | Strengths | Failure Modes |
|---|---|---|---|
| **Mode 1: Sparse (BM25 / tsvector)** | Exact lexical matching with inverted index and BM25 term weighting | Exceptional on rare acronyms, hyperparameter values, equation labels (e.g. "Eq. 4") | Misses paraphrased concepts and semantic synonyms |
| **Mode 2: Dense (Vector Search)** | Cosine similarity on 384-d normalized embeddings (`all-MiniLM-L6-v2`) | Captures conceptual semantic meaning across synonyms | Fails on exact serial numbers, specialized novel acronyms |
| **Mode 3: Hybrid (RRF)** | Reciprocal Rank Fusion combining Mode 1 and Mode 2 ($\alpha=0.6, k=60$) | Combines high keyword recall with semantic breadth | Top candidates may still lack query-document interaction precision |
| **Mode 4: Hybrid + Reranker** | Mode 3 candidate pool re-scored via neural Cross-Encoder (`ms-marco-MiniLM-L-6-v2`) | Full cross-attention between query and chunk; highest precision | Incurs additional latency (~20-50ms per batch) |

---

## 4. Benchmark Dataset Structure

The benchmark suite is located in `evaluation/dataset/academic_gold_benchmark.json`. Each entry contains:
```json
{
  "query_id": "eval-q001",
  "paper_id": "attention-is-all-you-need",
  "query": "What is the key computational complexity difference per layer between self-attention and recurrent layers with respect to sequence length n?",
  "ground_truth_page": 4,
  "ground_truth_section": "3.2 Attention",
  "ground_truth_excerpt": "Self-Attention complexity per layer is O(n^2 * d) whereas Recurrent is O(n * d^2)...",
  "expected_key_facts": [
    "Self-attention is O(n^2 * d)",
    "Recurrent layer is O(n * d^2)",
    "Self-attention is faster when sequence length n is smaller than representation dimensionality d"
  ]
}
```

---

## 5. Automated Evaluation Execution

The automated benchmark script executes against any configured backend instance:
```bash
python evaluation/evaluator.py --dataset evaluation/dataset/academic_gold_benchmark.json --output evaluation/reports/benchmark_results.json
```
This generates a detailed comparison table and JSON artifact tracking empirical metrics across all 4 modes without fabricating values.
