// API client for backend communication
import { supabase } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get auth token for API requests
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Index a folder (trigger backend to download PDFs from Supabase and create FAISS index)
export async function indexFolder(folderName: string): Promise<{
  status: string;
  folder: string;
  files_processed: number;
  chunks_created: number;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/index_folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ folder_name: folderName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to index folder');
  }

  return response.json();
}

// Chat with folder documents
export async function chatWithFolder(folderName: string, query: string): Promise<{
  answer: string;
  folder: string;
  user_id: string;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      folder_name: folderName,
      query: query 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to chat with folder');
  }

  return response.json();
}

// Get user's folders from backend
export async function getUserFolders(): Promise<{
  folders: string[];
  user_id: string;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/folders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch folders');
  }

  return response.json();
}

// Generate MCQs from indexed folder
export async function generateMCQs(folderName: string, numQuestions: number): Promise<{
  questions: Array<{
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
  }>;
  folder: string;
  total_questions: number;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/generate_mcqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      folder_name: folderName,
      num_questions: numQuestions
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate MCQs');
  }

  return response.json();
}

// Generate paper (20 or 60 marks) from indexed folder
export async function generatePaper(folderName: string, marks: number): Promise<{
  status: string;
  folder: string;
  marks: number;
  filename: string;
  path: string;
  url: string;
  timestamp: string;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/generate_paper`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      folder_name: folderName,
      marks: marks
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate paper');
  }

  return response.json();
}

// Get list of generated papers
export async function getPapers(): Promise<{
  papers: Array<{
    filename: string;
    folder: string;
    marks: number;
    path: string;
    created_at: string;
    updated_at: string;
    size: number;
  }>;
  user_id: string;
}> {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/get_papers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch papers');
  }

  return response.json();
}
