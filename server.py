# main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
import os, shutil
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

STORAGE = "/data/storage"
INDEX_DIR = "/data/indexes"

# Folder alias mapping
def find_folder_id_for_user(user_id, alias):
    mapping = {"ML": "ML", "DWM": "DWM", "PAPERS": "PAPERS","ITC": "ITC"}
    return mapping.get(alias)

# ----------------- Upload -----------------
@app.post("/upload/{folder_id}")
async def upload_file(folder_id: str, file: UploadFile = File(...)):
    user_id = "user123"
    os.makedirs(os.path.join(STORAGE, user_id, folder_id), exist_ok=True)
    out_path = os.path.join(STORAGE, user_id, folder_id, file.filename)
    with open(out_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"status": "ok", "path": out_path}

# ----------------- Index Folder -----------------
@app.post("/index_folder/{folder_id}")
def index_folder(folder_id: str):
    user_id = "user123"
    folder_path = os.path.join(STORAGE, user_id, folder_id)
    if not os.path.exists(folder_path):
        raise HTTPException(404, "No folder")

    docs = []
    for fname in os.listdir(folder_path):
        if fname.lower().endswith(".pdf"):
            loader = PyPDFLoader(os.path.join(folder_path, fname))
            docs += loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    # Gemini embeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    index_path = os.path.join(INDEX_DIR, user_id)
    os.makedirs(index_path, exist_ok=True)
    vectorstore.save_local(os.path.join(index_path, f"{folder_id}_faiss"))

    return {"status": "indexed", "count": len(chunks)}

# ----------------- Chat -----------------
@app.post("/chat")
def chat(query: dict):
    text = query.get("text", "")
    if not text.startswith("@"):
        raise HTTPException(400, "Missing folder mention")

    parts = text.split(maxsplit=1)
    folder_alias = parts[0][1:]
    prompt_text = parts[1] if len(parts) > 1 else ""

    folder_id = find_folder_id_for_user("user123", folder_alias)
    if folder_id is None:
        raise HTTPException(404, f"Folder alias '{folder_alias}' not found")

    index_path = os.path.join(INDEX_DIR, "user123", f"{folder_id}_faiss")
    if not os.path.exists(index_path):
        raise HTTPException(404, "Folder not indexed yet")

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    vectorstore = FAISS.load_local(
    index_path, 
    embeddings,
    allow_dangerous_deserialization=True  # ⚠ Only safe for your own files
)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 6})

    # ChatGroq for Groq LLM
    llm = ChatGroq(
        model="deepseek-r1-distill-llama-70b",
        temperature=0,
        max_tokens=None,
        reasoning_format="parsed",
        timeout=None,
        max_retries=2,
    )
    qa = RetrievalQA.from_chain_type(llm, retriever=retriever)
    answer = qa.run(prompt_text)

    return {"answer": answer}
