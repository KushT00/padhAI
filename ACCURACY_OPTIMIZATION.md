# RAG Accuracy Optimization Guide

## ✅ Improvements Already Implemented

### **1. Better Chunking Strategy**
```python
chunk_size=1500  # Increased from 1000
chunk_overlap=300  # Increased from 200
separators=["\n\n", "\n", ". ", " ", ""]  # Natural boundaries
```

**Why it helps:**
- Larger chunks preserve more context
- Higher overlap ensures continuity between chunks
- Natural separators prevent breaking mid-sentence

### **2. More Retrieved Context**
```python
k=10  # Increased from 6
fetch_k=20  # Pre-fetch 20, filter to top 10
```

**Why it helps:**
- More relevant chunks = better answers
- fetch_k allows filtering for quality

### **3. Custom Prompt Template**
- Instructs LLM to stick to context
- Asks for citations
- Requests clear explanations
- Handles "I don't know" gracefully

---

## 🎯 Additional Optimization Strategies

### **4. Use MMR (Maximal Marginal Relevance)**

For diverse results instead of just similar ones:

```python
retriever = vectorstore.as_retriever(
    search_type="mmr",  # Changed from "similarity"
    search_kwargs={
        "k": 10,
        "fetch_k": 20,
        "lambda_mult": 0.5  # 0=diversity, 1=relevance
    }
)
```

**When to use:**
- Questions requiring multiple perspectives
- Broad topics covered across different sections
- Avoiding redundant information

### **5. Hybrid Search (Dense + Sparse)**

Combine semantic search with keyword matching:

```python
# Install: pip install rank-bm25
from rank_bm25 import BM25Okapi

# Implement BM25 + FAISS hybrid retrieval
# Weight: 0.7 semantic + 0.3 keyword
```

**Benefits:**
- Catches exact term matches
- Better for technical terms, formulas, names
- Complements semantic understanding

### **6. Re-ranking Retrieved Chunks**

Add a re-ranker model to improve chunk selection:

```python
# Install: pip install sentence-transformers
from sentence_transformers import CrossEncoder

reranker = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

# Re-rank retrieved chunks
scores = reranker.predict([(query, chunk) for chunk in chunks])
```

**Benefits:**
- More accurate relevance scoring
- Filters out false positives
- Improves final answer quality

### **7. Query Expansion**

Generate multiple versions of the user's question:

```python
def expand_query(original_query):
    expansion_prompt = f"""
    Generate 3 alternative phrasings of this question:
    {original_query}
    
    Return as a list.
    """
    # Use LLM to generate variations
    # Search with all variations
    # Combine results
```

**Benefits:**
- Catches documents that use different terminology
- Improves recall
- Handles ambiguous queries

### **8. Metadata Filtering**

Add metadata to chunks during indexing:

```python
# During indexing
for doc in docs:
    doc.metadata["source"] = filename
    doc.metadata["page"] = page_number
    doc.metadata["section"] = section_name

# During retrieval
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 10,
        "filter": {"source": "specific_file.pdf"}
    }
)
```

**Benefits:**
- Filter by document, chapter, date
- More targeted retrieval
- Better for multi-document queries

### **9. Contextual Compression**

Compress retrieved chunks to only relevant parts:

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

compressor = LLMChainExtractor.from_llm(llm)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=retriever
)
```

**Benefits:**
- Removes irrelevant parts of chunks
- Reduces token usage
- Focuses LLM on key information

### **10. Parent Document Retrieval**

Store small chunks but retrieve larger parent documents:

```python
from langchain.retrievers import ParentDocumentRetriever

# Index small chunks for precision
# Retrieve full sections for context
```

**Benefits:**
- Best of both worlds
- Precise matching + full context
- Better for complex questions

---

## 📊 Evaluation Metrics

### **Track These Metrics:**

1. **Answer Relevance**
   - Does the answer address the question?
   - Scale: 1-5

2. **Faithfulness**
   - Is the answer based on the documents?
   - No hallucinations?

3. **Context Precision**
   - Are retrieved chunks relevant?
   - % of useful chunks

4. **Context Recall**
   - Did we retrieve all relevant info?
   - Missing important chunks?

### **Automated Evaluation:**

```python
# Install: pip install ragas
from ragas import evaluate
from ragas.metrics import (
    answer_relevancy,
    faithfulness,
    context_precision,
    context_recall
)

# Evaluate your RAG system
results = evaluate(
    dataset=test_dataset,
    metrics=[answer_relevancy, faithfulness, context_precision, context_recall]
)
```

---

## 🔧 Parameter Tuning Guide

### **Chunk Size**
- **Small (500-800)**: Technical docs, code, formulas
- **Medium (1000-1500)**: General text, textbooks
- **Large (2000-3000)**: Narrative content, essays

### **Chunk Overlap**
- **Low (10-15%)**: Independent sections
- **Medium (20-25%)**: Standard use case
- **High (30-40%)**: Highly connected content

### **Number of Chunks (k)**
- **Few (3-5)**: Simple, factual questions
- **Medium (6-10)**: Standard questions
- **Many (10-15)**: Complex, multi-part questions

### **Temperature**
- **0.0**: Factual, deterministic answers
- **0.3-0.5**: Slight creativity, still grounded
- **0.7-1.0**: Creative, explanatory answers

---

## 🎓 Best Practices

### **1. Document Preprocessing**
```python
# Clean PDFs before indexing
- Remove headers/footers
- Fix OCR errors
- Normalize formatting
- Extract tables separately
```

### **2. Query Preprocessing**
```python
# Clean user queries
- Fix typos
- Expand abbreviations
- Remove filler words
- Standardize terminology
```

### **3. Post-processing**
```python
# Improve final answers
- Format with markdown
- Add citations
- Include confidence scores
- Suggest follow-up questions
```

### **4. Caching**
```python
# Cache frequent queries
- Store query embeddings
- Cache LLM responses
- Reduce API costs
```

### **5. Monitoring**
```python
# Track performance
- Log all queries
- Monitor response times
- Track user feedback
- A/B test improvements
```

---

## 🚀 Advanced Techniques

### **1. Multi-Query Retrieval**
Generate multiple queries from one question, retrieve for each, combine results.

### **2. Self-Query Retrieval**
LLM extracts metadata filters from natural language query.

### **3. Ensemble Retrieval**
Combine multiple retrieval methods (BM25 + Dense + Hybrid).

### **4. Adaptive Retrieval**
Dynamically adjust k based on query complexity.

### **5. Iterative Retrieval**
Retrieve → Answer → If insufficient, retrieve more → Re-answer.

---

## 📈 Performance Benchmarks

### **Current Setup:**
- Chunk size: 1500
- Overlap: 300
- Retrieved chunks: 10
- Model: DeepSeek R1 70B
- Embeddings: Gemini

### **Expected Performance:**
- **Accuracy**: 80-90% for factual questions
- **Response time**: 2-5 seconds
- **Context relevance**: 70-85%

### **To Improve Further:**
1. Implement re-ranking (+10-15% accuracy)
2. Add query expansion (+5-10% recall)
3. Use hybrid search (+10-15% precision)
4. Fine-tune embeddings on your domain (+15-20% accuracy)

---

## 🎯 Quick Wins (Implement These First)

1. ✅ **Increase chunk size** (Done)
2. ✅ **Increase k value** (Done)
3. ✅ **Add custom prompt** (Done)
4. ⭐ **Try MMR search** (Change search_type)
5. ⭐ **Add re-ranking** (Install CrossEncoder)
6. ⭐ **Implement query expansion** (Use LLM)

---

## 📚 Resources

- [LangChain RAG Guide](https://python.langchain.com/docs/use_cases/question_answering/)
- [RAGAS Evaluation](https://docs.ragas.io/)
- [Advanced RAG Techniques](https://www.pinecone.io/learn/advanced-rag/)
- [Chunking Strategies](https://www.pinecone.io/learn/chunking-strategies/)

---

**Remember:** The best configuration depends on your specific documents and use case. Test different settings and measure results! 🚀
