import streamlit as st
import os
from langchain_groq import ChatGroq
from langchain.document_loaders import PyPDFLoader  # Use PDF loader
from langchain_google_genai.embeddings import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.vectorstores import FAISS
import time
import requests
from dotenv import load_dotenv

load_dotenv()

embedding = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-exp-03-07")
groq_api_key = os.environ['GROQ_API_KEY']

# Download PDF from Supabase bucket to local file
pdf_url = "https://totdxfarhoqeqodfmytb.supabase.co/storage/v1/object/public/test/ML_QB_TT1.pdf"
pdf_file = "ML_QB_TT1.pdf"
if not os.path.exists(pdf_file):
    r = requests.get(pdf_url)
    with open(pdf_file, "wb") as f:
        f.write(r.content)

if "vector" not in st.session_state:
    st.session_state.embeddings = embedding
    st.session_state.loader = PyPDFLoader(pdf_file)
    st.session_state.docs = st.session_state.loader.load()
    st.session_state.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    st.session_state.final_docs = st.session_state.text_splitter.split_documents(st.session_state.docs)
    st.session_state.vectors = FAISS.from_documents(st.session_state.final_docs, st.session_state.embeddings)

st.title("ChatGroq PDF Demo")
llm = ChatGroq(groq_api_key=groq_api_key,
               model_name="llama-3.1-8b-instant")

prompt_template = ChatPromptTemplate.from_template("""
Answer the questions based on the provided context only.
Please provide the most accurate response based on the question.
<context>
{context}
<context>
Question: {input}
""")

document_chain = create_stuff_documents_chain(llm, prompt_template)
retriever = st.session_state.vectors.as_retriever()
retrieval_chain = create_retrieval_chain(retriever, document_chain)

user_prompt = st.text_input("Input your prompt here")

if user_prompt:
    start = time.process_time()
    response = retrieval_chain.invoke({"input": user_prompt})
    st.write(response['answer'])
    st.write(f"Response time: {time.process_time() - start:.2f}s")

    with st.expander("Document Similarity Search"):
        for i, doc in enumerate(response["context"]):
            st.write(doc.page_content)
            st.write("--------------------------------")
    