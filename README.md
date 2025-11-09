# 🎓 padhAI - AI-Powered Study Assistant

**padhAI** (Study with AI) is an intelligent learning platform that transforms your PDF study materials into an interactive learning experience using RAG (Retrieval-Augmented Generation) technology.

[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://padh-ai-pro.vercel.app)
[![Deployed on Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://padhai-server.onrender.com/)

---

## ✨ Features

### 📚 Document Management
- **PDF Upload & Storage**: Upload study materials directly to organized folders
- **Supabase Integration**: Secure cloud storage for all your documents
- **Folder Organization**: Keep your study materials organized by subject or topic

### 🤖 AI-Powered Chat
- **RAG-based Q&A**: Ask questions about your uploaded documents and get accurate, context-aware answers
- **Smart Context Retrieval**: Uses FAISS vector search to find relevant information
- **Citation Support**: Responses include references to source documents

### 📝 MCQ Practice Generator
- **AI-Generated Questions**: Create 5-20 multiple-choice questions from any indexed folder
- **Real-time Quiz Interface**: Interactive quiz experience with instant feedback
- **Detailed Explanations**: Get explanations for both correct and incorrect answers
- **Score Tracking**: Monitor your performance and learning progress

### 🎨 Modern UI/UX
- **Beautiful Interface**: Clean, modern design using shadcn/ui components
- **Dark Mode Support**: Eye-friendly dark theme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Polished interactions with Framer Motion

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 13.5.1 (React 18.2.0)
- **Language**: TypeScript
- **Styling**: TailwindCSS 3.3.3
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **Authentication**: Supabase Auth

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Vector Database**: FAISS (CPU)
- **Embeddings**: Google Generative AI (`text-embedding-004`)
- **LLM**: ChatGroq (`deepseek-r1-distill-llama-70b`)
- **RAG Framework**: LangChain
- **PDF Processing**: PyPDF
- **Authentication**: JWT (via Supabase)
- **Storage**: Supabase Storage
- **Monitoring**: LangSmith (optional)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Google AI API key ([Get it here](https://aistudio.google.com/app/apikey))
- Groq API key ([Get it here](https://console.groq.com))

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

#### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
SUPABASE_JWT_SECRET=your_jwt_secret

# Google AI (for embeddings)
GOOGLE_API_KEY=your_google_ai_api_key

# Groq (for LLM)
GROQ_API_KEY=your_groq_api_key

# Optional: LangSmith (for monitoring)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=padhAI

# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3. Install Frontend Dependencies
```bash
npm install
```

#### 4. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### Running Locally

#### Start the Backend Server
```bash
python server.py
```
The API will be available at `http://localhost:8000`

#### Start the Frontend Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`

---

## 📖 Usage

### 1. Upload Documents
- Navigate to the dashboard
- Create a new folder or select an existing one
- Upload PDF files containing your study materials

### 2. Index Your Folder
- Select a folder from your dashboard
- Click "Index Folder" to process documents
- Wait for the indexing to complete (creates FAISS vector embeddings)

### 3. Chat with Your Documents
- Go to the Chat page
- Select an indexed folder
- Ask questions about your study materials
- Get AI-powered answers with source references

### 4. Practice with MCQs
- Navigate to the Practice page
- Select an indexed folder
- Choose the number of questions (5-20)
- Click "Generate & Start Quiz"
- Answer questions and review explanations

---

## 🔧 API Endpoints

### Authentication
All endpoints (except health check) require JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints

#### `GET /`
Health check endpoint

#### `POST /index_folder`
Index PDFs from a user folder in Supabase Storage
```json
{
  "user_folder": "folder_name"
}
```

#### `POST /chat`
Chat with indexed documents using RAG
```json
{
  "question": "Your question here",
  "folder_name": "folder_name"
}
```

#### `POST /generate_mcqs`
Generate multiple-choice questions from indexed documents
```json
{
  "folder_name": "folder_name",
  "num_questions": 10
}
```

#### `GET /folders/{user_id}`
Get list of folders for a user

---

## 📁 Project Structure

```
project/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard pages
│   │   ├── chat/         # Chat interface
│   │   └── practice/     # MCQ practice page
│   ├── login/            # Authentication pages
│   └── signup/
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   └── supabase.ts       # Supabase client
├── data/                  # Backend data storage
│   └── indexes/          # FAISS vector indexes
├── server.py              # FastAPI backend
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── README.md             # This file
```

---

## 🌐 Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel and automatically deploys from the main branch.

**Live URL**: https://padh-ai-pro.vercel.app

### Backend (Render)
The backend is deployed on Render as a Web Service.

**API URL**: https://padhai-server.onrender.com/

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📚 Additional Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Production deployment steps
- [Testing Guide](TESTING_GUIDE.md) - Testing guidelines
- [Chat Implementation](CHAT_IMPLEMENTATION.md) - Chat feature details
- [Accuracy Optimization](ACCURACY_OPTIMIZATION.md) - RAG optimization tips
- [LangSmith Setup](LANGSMITH_SETUP.md) - Monitoring setup

---

## 🔐 Security

- JWT-based authentication via Supabase
- Secure API key management through environment variables
- Row-level security (RLS) on Supabase storage
- CORS protection on backend API
- User isolation for folders and documents

---

## 🐛 Troubleshooting

### Common Issues

**Embedding API Errors**
- Ensure you're using the correct Google AI model: `text-embedding-004`
- Verify your Google AI API key is valid
- Check if you need to delete old FAISS indexes and re-index

**Backend Connection Issues**
- Verify `NEXT_PUBLIC_API_URL` in `.env` is correct
- Check if backend server is running
- Ensure CORS is properly configured

**PDF Upload Failures**
- Verify Supabase storage bucket exists and is accessible
- Check Supabase storage RLS policies
- Ensure file size is within limits

For more troubleshooting tips, see [TESTING_GUIDE.md](TESTING_GUIDE.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is private and proprietary.

---

## 👨‍💻 Author

Built with ❤️ for smarter learning

---

## 🙏 Acknowledgments

- **LangChain** - RAG framework
- **Supabase** - Backend infrastructure
- **Groq** - Fast LLM inference
- **Google AI** - Embeddings API
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **shadcn/ui** - Beautiful UI components

---

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Happy Learning with padhAI! 🎓✨**
