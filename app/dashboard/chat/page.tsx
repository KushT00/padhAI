'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  MessageCircle,
  Bot,
  User,
  FileText,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  context?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI tutor. I can help you understand concepts from your uploaded notes, answer questions, and explain complex topics. What would you like to learn about today?',
      sender: 'ai',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contextFiles = [
    'Physics Notes - Chapter 5.pdf',
    '2023 Chemistry Past Paper.pdf'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date(),
        context: contextFiles
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const responses = [
      "Based on your Physics notes from Chapter 5, I can help explain this concept. Thermodynamics deals with the relationships between heat, work, temperature, and energy. The first law states that energy cannot be created or destroyed, only transformed from one form to another.",
      "Looking at your Chemistry past paper, this is a common question type. Let me break down the solution step by step. First, we need to identify the reaction type, then balance the equation, and finally calculate the stoichiometry.",
      "This is an interesting question! From your uploaded materials, I can see similar problems have been covered. Let me provide a detailed explanation with examples to help you understand the underlying principles.",
      "Great question! This topic appears frequently in exams based on the patterns I've analyzed from your past papers. Here's a comprehensive explanation that will help you tackle similar questions."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
              <p className="text-sm text-gray-500">Always ready to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              {contextFiles.length} files active
            </Badge>
          </div>
        </div>
      </div>

      {/* Context Files */}
      {contextFiles.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Using context from:</span>
            <div className="flex flex-wrap gap-2">
              {contextFiles.map((file, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-white border-blue-200">
                  {file}
                </Badge>
              ))}
            </div>
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                    {message.context && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Referenced:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.context.map((file, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {file}
                            </Badge>
                          ))}
                        </div>
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
                placeholder="Ask me anything about your study materials..."
                className="pr-12 py-3 resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                disabled={isTyping}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-blue-400 hover:bg-blue-500 px-4 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift + Enter for new line</span>
            <span>Powered by AI • Responses may not be perfect</span>
          </div>
        </div>
      </div>
    </div>
  );
}