'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Paperclip, 
  MessageCircle,
  Bot,
  User,
  FileText,
  BookOpen,
  Loader2,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithFolder, getUserFolders } from '@/lib/api';
import { supabase } from '@/lib/client';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  folder?: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI tutor. Select a folder from the dropdown above to start chatting with your documents. I can help you understand concepts, answer questions, and explain complex topics.',
      sender: 'ai',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkUserAndLoadFolders();
  }, []);

  const checkUserAndLoadFolders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    await loadFolders();
  };

  const loadFolders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getUserFolders();
      setFolders(result.folders);
      
      if (result.folders.length > 0) {
        setSelectedFolder(result.folders[0]);
      }
    } catch (err: any) {
      console.error('Error loading folders:', err);
      setError(err.message || 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedFolder) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      folder: selectedFolder
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      // Call backend API
      const response = await chatWithFolder(selectedFolder, currentQuery);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer,
        sender: 'ai',
        timestamp: new Date(),
        folder: selectedFolder
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Error getting AI response:', err);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${err.message}. ${err.message.includes('not indexed') ? 'Please make sure to index this folder first from the Folders page.' : 'Please try again.'}`,
        sender: 'ai',
        timestamp: new Date(),
        folder: selectedFolder
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">AI Tutor</h1>
              <p className="text-sm text-gray-500">Chat with your documents</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {folders.length > 0 && (
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="w-4 h-4" />
                        <span>{folder}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedFolder && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {selectedFolder}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center space-x-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading folders...</span>
          </div>
        </div>
      )}

      {/* No Folders Warning */}
      {!loading && folders.length === 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center space-x-2 text-sm text-yellow-700">
            <AlertCircle className="w-4 h-4" />
            <span>No folders found. Please create a folder and upload documents first.</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'flex space-x-3 max-w-3xl',
                  message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  message.sender === 'user' 
                    ? 'bg-blue-400' 
                    : 'bg-gradient-to-br from-purple-400 to-purple-500'
                )}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <Card className={cn(
                    'p-4',
                    message.sender === 'user'
                      ? 'bg-blue-400 text-white border-blue-400'
                      : 'bg-white border-gray-200'
                  )}>
                    {message.sender === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeHighlight as any]}
                          components={{
                            code: ({node, inline, className, children, ...props}: any) => {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline ? (
                                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              ) : (
                                <code className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            h1: ({children}) => <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-bold mb-1 mt-2">{children}</h3>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {message.folder && message.sender === 'ai' && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <FolderOpen className="w-3 h-3 inline mr-1" />
                          Source: {message.folder}
                        </p>
                      </div>
                    )}
                  </Card>
                  <p className="text-xs text-gray-500 px-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Card className="p-4 bg-white border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedFolder 
                    ? `Ask about ${selectedFolder}...` 
                    : "Select a folder to start chatting..."
                }
                className="pr-12 py-3 resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                disabled={isTyping || !selectedFolder}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping || !selectedFolder}
              className="bg-blue-400 hover:bg-blue-500 px-4 py-3"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>
              {selectedFolder 
                ? "Press Enter to send, Shift + Enter for new line" 
                : "Select a folder from the dropdown above to start"}
            </span>
            <span>Powered by Groq & Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}