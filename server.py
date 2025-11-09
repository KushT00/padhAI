# server.py
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os, tempfile
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional
import jwt

load_dotenv()

# LangSmith tracing (optional - for monitoring)
LANGCHAIN_TRACING = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
if LANGCHAIN_TRACING:
    print("✅ LangSmith tracing enabled")
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_PROJECT"] = os.getenv("LANGCHAIN_PROJECT", "PadhAI-RAG")
else:
    print("⚠️  LangSmith tracing disabled (set LANGCHAIN_TRACING_V2=true to enable)")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "http://127.0.0.1:3000",  # Alternative localhost
        "https://padh-ai-pro.vercel.app",  # Production
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # All Vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Service role key bypasses RLS
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

# Validate required environment variables
if not SUPABASE_URL:
    raise ValueError("SUPABASE_URL must be set in .env file")

# Use service role key for backend operations (bypasses RLS)
# This is safe because we validate user_id from JWT token
SUPABASE_KEY = SUPABASE_SERVICE_KEY if SUPABASE_SERVICE_KEY else SUPABASE_ANON_KEY

if not SUPABASE_KEY:
    raise ValueError("Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set")

if not SUPABASE_JWT_SECRET:
    print("WARNING: SUPABASE_JWT_SECRET not set. Using anon key for development.")
    SUPABASE_JWT_SECRET = SUPABASE_ANON_KEY

if SUPABASE_SERVICE_KEY:
    print("✅ Using Supabase Service Role Key (RLS bypassed)")
else:
    print("⚠️  Using Supabase Anon Key (RLS policies apply)")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

INDEX_DIR = "./data/indexes"  # Local storage for FAISS indexes

# Pydantic models
class IndexRequest(BaseModel):
    folder_name: str

class ChatRequest(BaseModel):
    folder_name: str
    query: str

class MCQRequest(BaseModel):
    folder_name: str
    num_questions: int

class PaperRequest(BaseModel):
    folder_name: str
    marks: int  # 20 or 60

# Authentication dependency
def get_current_user(authorization: Optional[str] = Header(None)) -> str:
    """Extract user_id from JWT token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Decode JWT token
        if not SUPABASE_JWT_SECRET:
            raise HTTPException(500, "Server configuration error: JWT secret not configured")
        
        payload = jwt.decode(
            token, 
            str(SUPABASE_JWT_SECRET),  # Ensure it's a string
            algorithms=["HS256"], 
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(401, "Invalid token: no user ID")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Authentication error: {str(e)}")

# ----------------- Index Folder from Supabase -----------------
@app.post("/index_folder")
def index_folder(request: IndexRequest, user_id: str = Depends(get_current_user)):
    """
    Download PDFs from Supabase Storage and create FAISS index
    Path in Supabase: {user_id}/{folder_name}/files.pdf
    """
    folder_name = request.folder_name
    
    try:
        # List all files in the user's folder from Supabase Storage
        # Path format: user_id/folder_name
        folder_path = f"{user_id}/{folder_name}"
        
        # List files - Supabase Python SDK requires path parameter
        try:
            files_list = supabase.storage.from_("folders").list(path=folder_path)
        except Exception as list_error:
            print(f"Error listing files: {list_error}")
            # Try alternative method
            files_list = supabase.storage.from_("folders").list(folder_path)
        
        # Debug logging
        print(f"User ID: {user_id}")
        print(f"Folder name: {folder_name}")
        print(f"Looking for files in path: {folder_path}")
        print(f"Files found: {files_list}")
        print(f"Number of files: {len(files_list) if files_list else 0}")
        
        if not files_list or len(files_list) == 0:
            raise HTTPException(404, f"No files found in folder '{folder_name}'. Path checked: {folder_path}. Make sure files are uploaded to the correct location.")
        
        # Filter PDF files only
        pdf_files = [f for f in files_list if f.get("name", "").lower().endswith(".pdf")]
        
        if not pdf_files:
            raise HTTPException(404, f"No PDF files found in folder '{folder_name}'")
        
        docs = []
        
        # Download and process each PDF
        for file_obj in pdf_files:
            file_name = file_obj.get("name")
            if file_name == ".placeholder":
                continue
                
            file_path = f"{folder_path}/{file_name}"
            
            # Download file from Supabase Storage
            file_data = supabase.storage.from_("folders").download(file_path)
            
            # Save temporarily to process with PyPDFLoader
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
                tmp_file.write(file_data)
                tmp_path = tmp_file.name
            
            try:
                # Load PDF
                loader = PyPDFLoader(tmp_path)
                docs += loader.load()
            finally:
                # Clean up temp file
                os.unlink(tmp_path)
        
        if not docs:
            raise HTTPException(400, "No content extracted from PDFs")
        
        # Split documents into chunks
        # Larger chunks = more context but less precise
        # Smaller chunks = more precise but may miss context
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,  # Increased for better context
            chunk_overlap=300,  # Increased overlap to maintain continuity
            separators=["\n\n", "\n", ". ", " ", ""]  # Split on natural boundaries
        )
        chunks = splitter.split_documents(docs)
        
        # Create embeddings and FAISS index (HuggingFace - FREE, no API key needed)
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        vectorstore = FAISS.from_documents(chunks, embeddings)
        
        # Save FAISS index locally
        index_path = os.path.join(INDEX_DIR, user_id)
        os.makedirs(index_path, exist_ok=True)
        vectorstore.save_local(os.path.join(index_path, f"{folder_name}_faiss"))
        
        return {
            "status": "indexed",
            "folder": folder_name,
            "files_processed": len(pdf_files),
            "chunks_created": len(chunks)
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error indexing folder: {str(e)}")

# ----------------- Chat with Folder Documents -----------------
@app.post("/chat")
def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    """
    Chat with documents in a specific folder using RAG
    """
    folder_name = request.folder_name
    query_text = request.query
    
    if not query_text:
        raise HTTPException(400, "Query text is required")
    
    # Check if folder is indexed
    index_path = os.path.join(INDEX_DIR, user_id, f"{folder_name}_faiss")
    if not os.path.exists(index_path):
        raise HTTPException(404, f"Folder '{folder_name}' not indexed yet. Please index it first.")
    
    try:
        # Load FAISS index
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        vectorstore = FAISS.load_local(
            index_path, 
            embeddings,
            allow_dangerous_deserialization=True  # ⚠ Only safe for your own files
        )
        # Retrieve more chunks for better context
        # k=10 means top 10 most relevant chunks will be used
        retriever = vectorstore.as_retriever(
            search_type="similarity",  # or "mmr" for diversity
            search_kwargs={
                "k": 10,  # Increased from 6 to 10 for more context
                "fetch_k": 20  # Fetch 20, then filter to top 10
            }
        )
        
        # Initialize LLM
        llm = ChatGroq(
            model="openai/gpt-oss-20b",
            temperature=0,  # 0 for factual, 0.7 for creative
            max_tokens=None,
            reasoning_format="parsed",
            timeout=None,
            max_retries=2,
        )
        
        # Custom prompt template for better accuracy
        prompt_template = """You are an expert AI tutor helping students understand their study materials. 
Use the following context from the student's documents to answer their question accurately and comprehensively.

Context from documents:
{context}

Student's Question: {question}

Instructions:
1. Answer based ONLY on the provided context
2. If the answer isn't in the context, say "I don't have enough information in your documents to answer this question."
3. Cite specific details from the context when possible
4. Explain concepts clearly and break down complex topics
5. Use examples from the documents if available
6. If relevant, mention which part of the document the information comes from

Answer:"""

        PROMPT = PromptTemplate(
            template=prompt_template,
            input_variables=["context", "question"]
        )
        
        # Create QA chain with custom prompt
        qa = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",  # "stuff" puts all context in one prompt
            retriever=retriever,
            return_source_documents=False,
            chain_type_kwargs={"prompt": PROMPT}
        )
        
        answer = qa.run(query_text)
        
        return {
            "answer": answer,
            "folder": folder_name,
            "user_id": user_id
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error processing chat: {str(e)}")

# ----------------- Get User's Folders -----------------
@app.get("/folders")
def get_folders(user_id: str = Depends(get_current_user)):
    """
    Get list of folders for the current user from Supabase Storage
    """
    try:
        files_list = supabase.storage.from_("folders").list(user_id)
        
        # Filter out files, keep only folders (items with id=None)
        folders = [f.get("name") for f in files_list if f.get("id") is None]
        
        return {"folders": folders, "user_id": user_id}
        
    except Exception as e:
        raise HTTPException(500, f"Error fetching folders: {str(e)}")

# ----------------- Generate MCQs -----------------
@app.post("/generate_mcqs")
def generate_mcqs(request: MCQRequest, user_id: str = Depends(get_current_user)):
    """Generate MCQs from indexed folder content"""
    import json, re
    
    folder_name = request.folder_name
    num_questions = request.num_questions
    
    # Validate
    if num_questions < 5 or num_questions > 15:
        raise HTTPException(400, "Number of questions must be between 5 and 15")
    
    # Check if indexed
    index_path = os.path.join(INDEX_DIR, user_id, f"{folder_name}_faiss")
    if not os.path.exists(index_path):
        raise HTTPException(404, f"Folder '{folder_name}' not indexed. Please index it first.")
    
    try:
        # Load FAISS index (same as chat)
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        
        # Get diverse chunks
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": num_questions * 3, "fetch_k": num_questions * 5}
        )
        docs = retriever.get_relevant_documents(f"Generate diverse questions about {folder_name}")
        
        if not docs:
            raise HTTPException(404, "No content found in indexed folder")
        
        # Combine context
        context = "\n\n".join([doc.page_content for doc in docs])[:8000]
        
        # Initialize LLM
        llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7, max_tokens=4000)
        
        # Prompt
        prompt = f"""You are an expert teacher. Generate EXACTLY {num_questions} multiple-choice questions.

CONTENT:
{context}

FORMAT (JSON only, no extra text):
[
  {{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": 0, "explanation": "..."}}
]

Generate {num_questions} questions with 4 options each."""
        
        # Generate
        response = llm.invoke(prompt)
        
        # Parse JSON
        json_match = re.search(r'\[.*\]', response.content, re.DOTALL)
        mcqs = json.loads(json_match.group(0) if json_match else response.content)
        
        # Validate
        if not isinstance(mcqs, list) or len(mcqs) == 0:
            raise HTTPException(500, "Failed to generate valid MCQs")
        
        mcqs = mcqs[:num_questions]
        
        for mcq in mcqs:
            if not all(k in mcq for k in ["question", "options", "correct_answer", "explanation"]):
                raise HTTPException(500, "Invalid MCQ format")
            if len(mcq["options"]) != 4:
                raise HTTPException(500, "Each question must have 4 options")
        
        return {"questions": mcqs, "folder": folder_name, "total_questions": len(mcqs)}
        
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"Failed to parse MCQ response: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Error generating MCQs: {str(e)}")

# ----------------- Generate Paper -----------------
@app.post("/generate_paper")
def generate_paper(request: PaperRequest, user_id: str = Depends(get_current_user)):
    """Generate exam paper (20 or 60 marks) and store in Supabase"""
    import datetime
    
    folder_name = request.folder_name
    marks = request.marks
    
    # Validate marks
    if marks not in [20, 60]:
        raise HTTPException(400, "Marks must be either 20 or 60")
    
    # Check if indexed
    index_path = os.path.join(INDEX_DIR, user_id, f"{folder_name}_faiss")
    if not os.path.exists(index_path):
        raise HTTPException(404, f"Folder '{folder_name}' not indexed. Please index it first.")
    
    try:
        # Load FAISS index
        embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vectorstore = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
        
        # Get comprehensive chunks for paper generation
        chunk_count = 30 if marks == 20 else 50
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": chunk_count, "fetch_k": chunk_count * 2}
        )
        docs = retriever.get_relevant_documents(f"Generate comprehensive exam questions about {folder_name}")
        
        if not docs:
            raise HTTPException(404, "No content found in indexed folder")
        
        # Combine context - use more for 60 marks paper
        context_limit = 10000 if marks == 20 else 15000
        context = "\n\n".join([doc.page_content for doc in docs])[:context_limit]
        
        # Initialize LLM
        llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7, max_tokens=6000)
        
        # Create paper structure based on marks
        if marks == 20:
            structure = """
**20 MARKS PAPER STRUCTURE:**
- Section A: 5 Multiple Choice Questions (1 mark each = 5 marks)
- Section B: 3 Short Answer Questions (5 marks each = 15 marks)

Total: 20 Marks
Duration: 45 minutes
"""
        else:  # 60 marks
            structure = """
**60 MARKS PAPER STRUCTURE:**
- Section A: 10 Multiple Choice Questions (1 mark each = 10 marks)
- Section B: 5 Short Answer Questions (4 marks each = 20 marks)
- Section C: 3 Long Answer Questions (10 marks each = 30 marks)

Total: 60 Marks
Duration: 2 hours
"""
        
        # Prompt for paper generation
        prompt = f"""You are an expert exam paper creator. Generate a complete, well-structured QUESTION PAPER ONLY (NO ANSWERS).

SUBJECT CONTENT:
{context}

{structure}

CRITICAL INSTRUCTIONS:
1. Generate ONLY the questions - DO NOT include any answers, solutions, or answer keys
2. For MCQs, provide 4 options (A, B, C, D) but DO NOT indicate which is correct
3. Create questions that test understanding, application, and analysis
4. Ensure questions are clear, unambiguous, and answerable from the content
5. Vary difficulty levels appropriately
6. Include proper formatting with section headers (Section A, Section B, Section C)
7. Make questions progressive in difficulty
8. Add blank lines or answer spaces where students would write their answers
9. For short/long answer questions, indicate the marks allocated: [X marks]

FORMAT EXAMPLE:
Section A - Multiple Choice Questions
Q1. What is...?
    A) Option 1
    B) Option 2
    C) Option 3
    D) Option 4

Section B - Short Answer Questions
Q1. Explain... [5 marks]
    _______________________________________
    _______________________________________

Generate the complete QUESTION PAPER only. NO ANSWER GUIDE."""
        
        # Generate paper
        response = llm.invoke(prompt)
        paper_content = response.content
        
        # Create paper header
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        paper_header = f"""
═══════════════════════════════════════════════════════════════
                    EXAMINATION PAPER
                    Subject: {folder_name}
                    Total Marks: {marks}
                    Date: {timestamp}
═══════════════════════════════════════════════════════════════

"""
        
        full_paper = paper_header + paper_content
        
        # Upload to Supabase Storage
        # Path: {user_id}/papers/{folder_name}_{marks}marks_{timestamp}.txt
        safe_timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        paper_filename = f"{folder_name}_{marks}marks_{safe_timestamp}.txt"
        paper_path = f"{user_id}/papers/{paper_filename}"
        
        # Create papers folder if doesn't exist
        try:
            supabase.storage.from_("folders").upload(
                f"{user_id}/papers/.placeholder",
                b"",
                {"content-type": "text/plain"}
            )
        except:
            pass  # Folder might already exist
        
        # Upload paper
        paper_bytes = full_paper.encode('utf-8')
        upload_result = supabase.storage.from_("folders").upload(
            paper_path,
            paper_bytes,
            {"content-type": "text/plain; charset=utf-8"}
        )
        
        # Get public URL
        paper_url = supabase.storage.from_("folders").get_public_url(paper_path)
        
        return {
            "status": "generated",
            "folder": folder_name,
            "marks": marks,
            "filename": paper_filename,
            "path": paper_path,
            "url": paper_url,
            "timestamp": timestamp
        }
        
    except Exception as e:
        raise HTTPException(500, f"Error generating paper: {str(e)}")

# ----------------- Get Generated Papers -----------------
@app.get("/get_papers")
def get_papers(user_id: str = Depends(get_current_user)):
    """Get list of generated papers for the current user"""
    try:
        papers_path = f"{user_id}/papers"
        
        # List all files in papers folder
        files_list = supabase.storage.from_("folders").list(papers_path)
        
        if not files_list:
            return {"papers": [], "user_id": user_id}
        
        # Filter out placeholder and parse paper details
        papers = []
        for file_obj in files_list:
            filename = file_obj.get("name", "")
            if filename == ".placeholder" or not filename.endswith(".txt"):
                continue
            
            # Parse filename: {folder_name}_{marks}marks_{timestamp}.txt
            try:
                parts = filename.replace(".txt", "").split("_")
                # Find marks part
                marks_idx = next(i for i, p in enumerate(parts) if p.endswith("marks"))
                marks = int(parts[marks_idx].replace("marks", ""))
                
                # Folder name is everything before marks
                folder_name = "_".join(parts[:marks_idx])
                
                # Timestamp is after marks
                timestamp_parts = parts[marks_idx + 1:]
                
                papers.append({
                    "filename": filename,
                    "folder": folder_name,
                    "marks": marks,
                    "path": f"{papers_path}/{filename}",
                    "created_at": file_obj.get("created_at"),
                    "updated_at": file_obj.get("updated_at"),
                    "size": file_obj.get("metadata", {}).get("size", 0)
                })
            except:
                # Skip files that don't match expected format
                continue
        
        # Sort by creation date (newest first)
        papers.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        return {"papers": papers, "user_id": user_id}
        
    except Exception as e:
        raise HTTPException(500, f"Error fetching papers: {str(e)}")

# ----------------- Health Check -----------------
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "PadhAI RAG API"}

# ----------------- Debug: List All Files -----------------
@app.get("/debug/list_storage/{user_folder}")
def debug_list_storage(user_folder: str, user_id: str = Depends(get_current_user)):
    """Debug endpoint to see what's in storage"""
    try:
        # Try listing at root
        root_files = supabase.storage.from_("folders").list()
        
        # Try listing user folder
        user_files = supabase.storage.from_("folders").list(user_id)
        
        # Try listing specific folder
        folder_files = supabase.storage.from_("folders").list(f"{user_id}/{user_folder}")
        
        return {
            "user_id": user_id,
            "folder": user_folder,
            "root_files": root_files,
            "user_files": user_files,
            "folder_files": folder_files
        }
    except Exception as e:
        return {"error": str(e)}
