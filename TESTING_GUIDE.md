# Testing Guide - PadhAI RAG System

## 🎯 Complete Testing Workflow

### Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:3000`
- User account created and logged in
- At least one folder with PDF files uploaded

---

## 📱 Frontend Testing

### 1. Get Your JWT Token

**Option A: Using Test Token Page**
1. Navigate to `http://localhost:3000/dashboard/test-token`
2. Copy the displayed JWT token
3. Use this token in Postman

**Option B: Using Browser Console**
1. Open DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
(await supabase.auth.getSession()).data.session.access_token
```
4. Copy the output token

### 2. Test Folder Operations

**Create Folder:**
1. Go to "My Folders" (`/dashboard/folders`)
2. Click "New Folder"
3. Enter name: "ML"
4. Click "Create"
5. ✅ Folder should appear in the grid

**Upload File:**
1. Click on "ML" folder
2. Click "Upload File"
3. Select a PDF (e.g., machine learning notes)
4. Click "Upload"
5. ✅ File should appear in the folder
6. ✅ Success message should show

**Index Folder:**
1. While in "ML" folder, click "Index Folder" (green button)
2. Wait for processing
3. ✅ Success message: "Folder indexed successfully! Processed X files and created Y chunks."

---

## 🔧 Postman Testing

### Setup Postman

**Option 1: Import Collection**
1. Open Postman
2. Click "Import"
3. Select `PadhAI_Postman_Collection.json`
4. Collection will be imported with all endpoints

**Option 2: Manual Setup**
Create requests manually using the examples below.

### Authentication Setup

For all authenticated endpoints, add this header:
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

Replace `YOUR_JWT_TOKEN_HERE` with the token you copied earlier.

---

### Test 1: Health Check

**Request:**
```
GET http://localhost:8000/
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "PadhAI RAG API"
}
```

---

### Test 2: Get User Folders

**Request:**
```
GET http://localhost:8000/folders
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response:**
```json
{
  "folders": ["ML", "Physics", "Chemistry"],
  "user_id": "your-user-uuid"
}
```

---

### Test 3: Index Folder

**Request:**
```
POST http://localhost:8000/index_folder
Content-Type: application/json
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "folder_name": "ML"
}
```

**Expected Response:**
```json
{
  "status": "indexed",
  "folder": "ML",
  "files_processed": 3,
  "chunks_created": 156
}
```

**Possible Errors:**
- `404`: "No files found in folder 'ML'" - Upload PDFs first
- `404`: "No PDF files found in folder 'ML'" - Only PDFs are supported
- `401`: "Invalid token" - Check your JWT token
- `500`: Check backend logs for detailed error

---

### Test 4: Chat with Folder Documents

**Request:**
```
POST http://localhost:8000/chat
Content-Type: application/json
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "folder_name": "ML",
  "query": "What is gradient descent and how does it work?"
}
```

**Expected Response:**
```json
{
  "answer": "Gradient descent is an optimization algorithm used in machine learning to minimize the cost function. It works by iteratively moving in the direction of steepest descent as defined by the negative of the gradient...",
  "folder": "ML",
  "user_id": "your-user-uuid"
}
```

**More Example Queries:**
```json
{
  "folder_name": "ML",
  "query": "Explain the difference between supervised and unsupervised learning"
}
```

```json
{
  "folder_name": "ML",
  "query": "What are the main types of neural networks mentioned in the documents?"
}
```

```json
{
  "folder_name": "ML",
  "query": "Summarize the key concepts from chapter 3"
}
```

**Possible Errors:**
- `404`: "Folder 'ML' not indexed yet" - Run index_folder first
- `400`: "Query text is required" - Add query field
- `401`: "Invalid token" - Check JWT token
- `500`: Check backend logs

---

## 🧪 Complete Test Scenario

### Scenario: Test ML Folder with Sample Documents

1. **Upload PDFs** (Frontend)
   - Upload: `machine_learning_basics.pdf`
   - Upload: `neural_networks.pdf`
   - Upload: `deep_learning.pdf`

2. **Index Folder** (Postman or Frontend)
   ```bash
   POST /index_folder
   {
     "folder_name": "ML"
   }
   ```
   ✅ Should return: `files_processed: 3`

3. **Test Chat Queries** (Postman)

   **Query 1: General Question**
   ```json
   {
     "folder_name": "ML",
     "query": "What is machine learning?"
   }
   ```
   ✅ Should return answer from your documents

   **Query 2: Specific Topic**
   ```json
   {
     "folder_name": "ML",
     "query": "Explain backpropagation algorithm"
   }
   ```
   ✅ Should return relevant context from neural networks PDF

   **Query 3: Comparison**
   ```json
   {
     "folder_name": "ML",
     "query": "Compare CNN and RNN architectures"
   }
   ```
   ✅ Should synthesize information from documents

---

## 🐛 Troubleshooting

### Issue: "Invalid token" (401)

**Solution:**
1. Token might be expired (default: 1 hour)
2. Get a fresh token from `/dashboard/test-token`
3. Make sure you're using `Bearer ` prefix

### Issue: "Folder not indexed yet" (404)

**Solution:**
1. Run `POST /index_folder` first
2. Check that PDFs were uploaded successfully
3. Verify folder name matches exactly (case-sensitive)

### Issue: "No files found in folder" (404)

**Solution:**
1. Upload PDFs via frontend first
2. Check Supabase Storage bucket has files at: `{user_id}/ML/`
3. Verify RLS policies are correct

### Issue: Backend not responding

**Solution:**
1. Check backend is running: `http://localhost:8000/`
2. Check backend logs for errors
3. Verify all environment variables are set
4. Install missing dependencies: `pip install -r requirements.txt`

### Issue: "Error processing chat" (500)

**Solution:**
1. Check backend logs for detailed error
2. Verify GROQ_API_KEY is set correctly
3. Verify GOOGLE_API_KEY is set correctly
4. Check if FAISS index exists: `./data/indexes/{user_id}/ML_faiss/`

---

## 📊 Expected Performance

- **Indexing**: ~5-10 seconds per PDF (depends on size)
- **Chat Response**: ~2-5 seconds (depends on query complexity)
- **File Upload**: Instant (Supabase Storage)

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend terminal will show:
INFO:     127.0.0.1:xxxxx - "POST /index_folder HTTP/1.1" 200 OK
INFO:     127.0.0.1:xxxxx - "POST /chat HTTP/1.1" 200 OK
```

### Check FAISS Index Created
```bash
# Should exist after indexing:
./data/indexes/{your-user-id}/ML_faiss/
  ├── index.faiss
  └── index.pkl
```

### Test with cURL (Alternative to Postman)

**Get Folders:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/folders
```

**Index Folder:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"folder_name":"ML"}' \
  http://localhost:8000/index_folder
```

**Chat:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"folder_name":"ML","query":"What is gradient descent?"}' \
  http://localhost:8000/chat
```

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] User logged in
- [ ] Folder created via frontend
- [ ] PDF uploaded to folder
- [ ] Folder indexed successfully
- [ ] Chat returns relevant answers
- [ ] Token authentication working
- [ ] All Postman tests passing

---

## 🎓 Next Steps

Once testing is complete:
1. Implement chat UI in frontend
2. Add folder selection dropdown in chat page
3. Display chat history
4. Add streaming responses
5. Implement file preview
6. Add batch indexing for multiple folders

Happy Testing! 🚀
