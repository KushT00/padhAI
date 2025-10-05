# PadhAI - Multi-Tenant RAG System Setup Guide

## Overview
This is a complete multi-tenant RAG (Retrieval Augmented Generation) system that allows users to:
1. Upload documents to Supabase Storage (organized by user and folder)
2. Index documents using FAISS and Google Gemini embeddings
3. Chat with documents using Groq's DeepSeek R1 model

## Architecture

### Frontend (Next.js + TypeScript)
- **Storage**: Supabase Storage (`folders` bucket)
- **Authentication**: Supabase Auth with JWT
- **UI**: Folder management, file upload, search

### Backend (FastAPI + Python)
- **Storage**: Downloads from Supabase Storage temporarily for indexing
- **Vector DB**: FAISS (local filesystem)
- **Embeddings**: Google Gemini (`models/embedding-001`)
- **LLM**: Groq DeepSeek R1 Distill Llama 70B
- **Auth**: JWT token validation

## Prerequisites

1. **Supabase Project**
   - Create a project at [supabase.com](https://supabase.com)
   - Create a storage bucket named `folders`
   - Set up RLS policies (see below)

2. **API Keys**
   - Google AI API key (for Gemini embeddings)
   - Groq API key (for chat LLM)

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase (Frontend & Backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Google AI (Backend)
GOOGLE_API_KEY=your-google-api-key

# Groq (Backend)
GROQ_API_KEY=your-groq-api-key

# Backend API URL (Frontend)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Getting Supabase JWT Secret
1. Go to your Supabase project settings
2. Navigate to **API** → **JWT Settings**
3. Copy the **JWT Secret** value

## Supabase Storage Setup

### 1. Create Storage Bucket
```sql
-- Create the 'folders' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('folders', 'folders', false);
```

### 2. Set Up RLS Policies

```sql
-- Policy: Users can only access their own top-level directory
CREATE POLICY "Users can access own folders"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'folders'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);

-- Policy: Users can upload to their own folders
CREATE POLICY "Users can upload to own folders"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'folders'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);

-- Policy: Users can delete from their own folders
CREATE POLICY "Users can delete from own folders"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'folders'
    AND (SELECT auth.uid()::text) = (storage.foldername(name))[1]
);
```

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

## Running the Application

### 1. Start the Backend (FastAPI)
```bash
# From project root
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 2. Start the Frontend (Next.js)
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage Workflow

### 1. Create a Folder
1. Navigate to **My Folders** page
2. Click **New Folder**
3. Enter folder name (e.g., "ML", "Physics", "Chemistry")
4. Click **Create**

### 2. Upload Documents
1. Click on a folder to open it
2. Click **Upload File**
3. Select a PDF file
4. Click **Upload**

### 3. Index the Folder
1. After uploading files, click **Index Folder**
2. Wait for indexing to complete
3. You'll see a success message with stats (files processed, chunks created)

### 4. Chat with Documents
1. Navigate to **AI Chat** page
2. Select the folder you want to chat with
3. Ask questions about your documents
4. The system will retrieve relevant context and generate answers

## API Endpoints

### Backend (FastAPI)

#### `POST /index_folder`
Index all PDFs in a folder from Supabase Storage.

**Request:**
```json
{
  "folder_name": "ML"
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "indexed",
  "folder": "ML",
  "files_processed": 5,
  "chunks_created": 234
}
```

#### `POST /chat`
Chat with indexed documents.

**Request:**
```json
{
  "folder_name": "ML",
  "query": "What is gradient descent?"
}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "answer": "Gradient descent is an optimization algorithm...",
  "folder": "ML",
  "user_id": "user-uuid"
}
```

#### `GET /folders`
Get list of user's folders.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "folders": ["ML", "Physics", "Chemistry"],
  "user_id": "user-uuid"
}
```

## Storage Structure

Files are organized in Supabase Storage as:
```
folders/
  └── {user_id}/
      ├── ML/
      │   ├── .placeholder
      │   ├── lecture1.pdf
      │   └── notes.pdf
      ├── Physics/
      │   └── quantum.pdf
      └── Chemistry/
          └── organic.pdf
```

FAISS indexes are stored locally as:
```
./data/indexes/
  └── {user_id}/
      ├── ML_faiss/
      ├── Physics_faiss/
      └── Chemistry_faiss/
```

## Multi-Tenancy

The system is fully multi-tenant:
- Each user has their own folder namespace in Supabase Storage
- RLS policies ensure users can only access their own files
- FAISS indexes are stored separately per user
- JWT authentication ensures secure API access

## Troubleshooting

### "Folder not indexed yet" error
- Make sure you clicked **Index Folder** after uploading files
- Check backend logs for indexing errors
- Verify PDF files are valid and not corrupted

### "Invalid token" error
- Check that `SUPABASE_JWT_SECRET` is correctly set in `.env`
- Ensure user is logged in and token is not expired
- Try logging out and logging back in

### Backend connection errors
- Verify backend is running on port 8000
- Check CORS settings in `server.py`
- Ensure `NEXT_PUBLIC_API_URL` is set correctly

### Supabase Storage errors
- Verify RLS policies are correctly set up
- Check bucket name is exactly `folders`
- Ensure user is authenticated

## Production Deployment

### Backend
1. Deploy to a cloud service (AWS, GCP, Railway, etc.)
2. Update `NEXT_PUBLIC_API_URL` in frontend `.env`
3. Set up persistent storage for FAISS indexes
4. Consider using a vector database like Pinecone or Weaviate for production

### Frontend
1. Deploy to Vercel, Netlify, or similar
2. Update CORS origins in backend
3. Set environment variables in deployment platform

## Security Notes

⚠️ **Important Security Considerations:**
- Never commit `.env` file to version control
- Keep JWT secret secure
- Use HTTPS in production
- Regularly rotate API keys
- Monitor API usage and costs
- Implement rate limiting on backend endpoints

## Performance Tips

1. **Chunking**: Adjust `chunk_size` and `chunk_overlap` in `server.py` based on your documents
2. **Retrieval**: Modify `k` value in retriever for more/fewer context chunks
3. **Caching**: Consider caching frequently accessed indexes
4. **Batch Processing**: Index multiple folders in parallel if needed

## License

MIT License - See LICENSE file for details
