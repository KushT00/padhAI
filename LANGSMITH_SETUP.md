# LangSmith Integration Guide

## 🎯 What is LangSmith?

LangSmith is LangChain's official monitoring and debugging platform. It helps you:
- **Track all LLM calls** - See every query, response, and token usage
- **Debug chains** - Visualize your RAG pipeline step-by-step
- **Monitor performance** - Response times, costs, errors
- **Evaluate quality** - Test different prompts and configurations
- **Analyze user queries** - Understand what users are asking

## 🚀 Setup Instructions

### **Step 1: Create LangSmith Account**

1. Go to: https://smith.langchain.com/
2. Sign up (free tier available)
3. Create a new organization
4. Create a project called "PadhAI-RAG"

### **Step 2: Get Your API Key**

1. Click on your profile (top right)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Copy the key (starts with `lsv2_...`)

### **Step 3: Add to .env File**

Add these lines to your `.env` file:

```env
# LangSmith Tracking
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_pt_your-api-key-here
LANGCHAIN_PROJECT=PadhAI-RAG
```

### **Step 4: Install LangSmith**

```bash
pip install langsmith
```

### **Step 5: Restart Backend**

```bash
# Stop current server (Ctrl+C)
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
✅ LangSmith tracing enabled
```

## 📊 What You'll See in LangSmith

### **1. Every Chat Query**
- User question
- Retrieved chunks
- LLM prompt
- Final answer
- Token usage
- Response time

### **2. Chain Visualization**
```
User Query
    ↓
Embedding Generation (Gemini)
    ↓
FAISS Similarity Search
    ↓
Retrieve Top 10 Chunks
    ↓
Build Prompt with Context
    ↓
LLM Call (Groq DeepSeek)
    ↓
Final Answer
```

### **3. Performance Metrics**
- **Latency**: How long each step takes
- **Tokens**: Input/output token counts
- **Cost**: Estimated API costs
- **Success Rate**: % of successful queries

### **4. Debugging Info**
- Exact prompts sent to LLM
- Retrieved document chunks
- Intermediate steps
- Error traces

## 🎨 LangSmith Dashboard Features

### **Traces Tab**
View all your RAG queries in real-time:
- Click any trace to see full details
- Filter by status, latency, user
- Search by query text

### **Datasets Tab**
Create test datasets:
```python
# Example test cases
test_queries = [
    "What is gradient descent?",
    "Explain backpropagation",
    "Compare CNN and RNN"
]
```

### **Evaluations Tab**
Run automated evaluations:
- Compare different prompts
- Test chunk sizes
- Measure accuracy improvements

### **Playground**
Test queries without code:
- Try different prompts
- Adjust parameters
- See results instantly

## 📈 Advanced Features

### **1. Custom Metadata**

Add custom tags to traces:

```python
from langsmith import traceable

@traceable(
    run_type="chain",
    name="RAG Query",
    metadata={"user_id": user_id, "folder": folder_name}
)
def chat_with_folder(folder_name, query):
    # Your existing code
    pass
```

### **2. Feedback Collection**

Track user feedback:

```python
from langsmith import Client

client = Client()

# After user rates answer
client.create_feedback(
    run_id=trace_id,
    key="user_rating",
    score=5,  # 1-5 stars
    comment="Very helpful!"
)
```

### **3. A/B Testing**

Compare different configurations:

```python
# Test different chunk sizes
configs = [
    {"chunk_size": 1000, "k": 6},
    {"chunk_size": 1500, "k": 10},
    {"chunk_size": 2000, "k": 8}
]

# LangSmith tracks which performs better
```

### **4. Cost Tracking**

Monitor API costs:
- Groq LLM calls
- Gemini embeddings
- Total per user/folder
- Daily/monthly trends

## 🔍 Example: Viewing a Trace

When you ask: "What is gradient descent?"

**LangSmith shows:**

```
Trace: RAG Query
├─ Embedding Generation
│  ├─ Input: "What is gradient descent?"
│  ├─ Model: models/embedding-001
│  ├─ Output: [768-dim vector]
│  └─ Duration: 120ms
│
├─ Vector Search
│  ├─ Query Vector: [768-dim]
│  ├─ Top K: 10
│  ├─ Retrieved Chunks: [chunk1, chunk2, ...]
│  └─ Duration: 45ms
│
├─ Prompt Construction
│  ├─ Template: Custom RAG prompt
│  ├─ Context: 10 chunks (15,234 chars)
│  ├─ Question: "What is gradient descent?"
│  └─ Final Prompt: [full text]
│
└─ LLM Call
   ├─ Model: deepseek-r1-distill-llama-70b
   ├─ Input Tokens: 3,456
   ├─ Output Tokens: 234
   ├─ Answer: "Gradient descent is..."
   ├─ Duration: 2.3s
   └─ Cost: $0.0023
```

## 📊 Metrics to Monitor

### **Quality Metrics**
- **Answer Relevance**: Does it answer the question?
- **Faithfulness**: Is it based on documents?
- **Context Precision**: Are retrieved chunks relevant?

### **Performance Metrics**
- **P95 Latency**: 95% of queries under X seconds
- **Error Rate**: % of failed queries
- **Token Usage**: Average tokens per query

### **Cost Metrics**
- **Cost per Query**: Average API cost
- **Daily Spend**: Total daily costs
- **Cost by User**: Who's using it most

## 🎯 Best Practices

### **1. Tag Your Traces**
```python
metadata = {
    "user_id": user_id,
    "folder": folder_name,
    "environment": "production",
    "version": "1.0"
}
```

### **2. Create Test Datasets**
Build a set of test queries with expected answers:
```python
test_dataset = [
    {
        "query": "What is gradient descent?",
        "expected_keywords": ["optimization", "minimize", "derivative"]
    }
]
```

### **3. Set Up Alerts**
Configure alerts for:
- High error rates
- Slow responses (>5s)
- High costs (>$X/day)

### **4. Regular Reviews**
Weekly check:
- Most common queries
- Failed queries
- Slow queries
- Expensive queries

## 🔧 Troubleshooting

### **Not Seeing Traces?**

1. Check `.env` has correct API key
2. Verify `LANGCHAIN_TRACING_V2=true`
3. Restart backend server
4. Check LangSmith project name matches

### **Traces Not Detailed Enough?**

Enable verbose logging:
```python
import langchain
langchain.verbose = True
```

### **Too Many Traces?**

Sample traces (e.g., 10%):
```python
import random
if random.random() < 0.1:  # 10% sampling
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

## 📚 Resources

- **LangSmith Docs**: https://docs.smith.langchain.com/
- **LangSmith Cookbook**: https://github.com/langchain-ai/langsmith-cookbook
- **YouTube Tutorials**: Search "LangSmith tutorial"
- **Discord**: LangChain Discord server

## 💡 Pro Tips

1. **Use Projects** - Separate dev/staging/prod
2. **Tag Everything** - Makes filtering easier
3. **Create Dashboards** - Custom views for metrics
4. **Export Data** - Download traces for analysis
5. **Share Traces** - Collaborate with team

## 🎉 Benefits You'll Get

✅ **Instant Debugging** - See exactly what went wrong
✅ **Performance Insights** - Identify bottlenecks
✅ **Cost Optimization** - Track and reduce API costs
✅ **Quality Improvement** - Test and compare approaches
✅ **User Analytics** - Understand usage patterns

---

**Start using LangSmith today to take your RAG system to the next level!** 🚀
