'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  FileText,
  Upload,
  Mic,
  Square,
  PlayCircle,
  StopCircle,
  Bot,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TranscriptEntry = {
  id: string;
  speaker: 'agent' | 'candidate';
  text: string;
  timestamp: number;
};

export default function InterviewPrepPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [roleDescription, setRoleDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const recognitionRef = useRef<any | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const exampleQuestions = useMemo(() => {
    const base = [
      'Tell me about yourself and your background relevant to this role.',
      'Describe a challenging problem you solved. What was your approach?',
      'Walk me through a project on your resume you are most proud of.',
      'How do you handle tight deadlines and conflicting priorities?',
      'Why are you interested in this role and company?',
    ];
    // Crude tailoring based on description keywords
    if (roleDescription.toLowerCase().includes('frontend')) {
      base.unshift('What tradeoffs do you consider when choosing a state management approach in React?');
    } else if (roleDescription.toLowerCase().includes('backend')) {
      base.unshift('How do you design and scale a REST API for high throughput?');
    } else if (roleDescription.toLowerCase().includes('data')) {
      base.unshift('Explain bias-variance tradeoff and how you mitigate overfitting.');
    }
    return base;
  }, [roleDescription]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    const total = 100;
    const step = 8 + Math.random() * 8;
    const interval = window.setInterval(() => {
      setUploadProgress((p) => {
        const next = Math.min(total, p + step);
        if (next >= total) {
          window.clearInterval(interval);
          setIsUploading(false);
        }
        return next;
      });
    }, 200);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    if (file) simulateUpload(file);
  };

  const speak = (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      // no-op when not supported
    }
  };

  const startRecognition = () => {
    try {
      const SpeechRecognition: any =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Try Chrome.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.continuous = true;

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript.trim();
            setTranscript((t) => [
              ...t,
              {
                id: `${Date.now()}-candidate`,
                speaker: 'candidate',
                text,
                timestamp: Date.now(),
              },
            ]);
            // Move to next question automatically after candidate speaks
            setTimeout(() => askNextQuestion(), 600);
          }
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch {
      // swallow
    }
  };

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } finally {
      setIsRecording(false);
    }
  };

  const askNextQuestion = () => {
    setCurrentQuestionIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= exampleQuestions.length) {
        // End interview
        setIsInterviewActive(false);
        speak('Thank you. This concludes the interview.');
        setTranscript((t) => [
          ...t,
          {
            id: `${Date.now()}-agent-end`,
            speaker: 'agent',
            text: 'Thank you. This concludes the interview.',
            timestamp: Date.now(),
          },
        ]);
        stopRecognition();
        return prev;
      }
      const q = exampleQuestions[nextIndex];
      speak(q);
      setTranscript((t) => [
        ...t,
        {
          id: `${Date.now()}-agent-q${nextIndex}`,
          speaker: 'agent',
          text: q,
          timestamp: Date.now(),
        },
      ]);
      return nextIndex;
    });
  };

  const startInterview = () => {
    if (!resumeFile && roleDescription.trim().length === 0) {
      alert('Please upload a resume or add a role description.');
      return;
    }
    setTranscript([]);
    setIsInterviewActive(true);
    setCurrentQuestionIndex(0);
    const first = exampleQuestions[0];
    setTranscript([
      {
        id: `${Date.now()}-agent-intro`,
        speaker: 'agent',
        text: 'Starting your mock interview now.',
        timestamp: Date.now(),
      },
      {
        id: `${Date.now()}-agent-q0`,
        speaker: 'agent',
        text: first,
        timestamp: Date.now(),
      },
    ]);
    speak('Starting your mock interview now. ' + first);
    startRecognition();
  };

  const stopInterview = () => {
    setIsInterviewActive(false);
    stopRecognition();
    speak('Interview stopped.');
    setTranscript((t) => [
      ...t,
      {
        id: `${Date.now()}-agent-stop`,
        speaker: 'agent',
        text: 'Interview stopped.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Interview Prep</h1>
        <p className="text-gray-600">Upload your resume, describe the role, and practice with a voice agent.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Your Materials</CardTitle>
            <CardDescription>Resume and role context</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Upload Resume (PDF/DOC/DOCX)</label>
              <Input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} />
              {isUploading ? (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-xs text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              ) : resumeFile ? (
                <div className="flex items-center justify-between rounded-md border border-gray-200 p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role Description / Job Details</label>
              <Textarea
                placeholder="Describe the role, stack, seniority, and expectations..."
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <Separator />
            <div className="flex items-center gap-2">
              <Badge variant="outline">Questions queued: {exampleQuestions.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Voice Interview</CardTitle>
            <CardDescription>Agent asks questions out loud and captures your responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {!isInterviewActive ? (
                <Button onClick={startInterview} className="bg-blue-400 hover:bg-blue-500">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start Interview
                </Button>
              ) : (
                <Button onClick={stopInterview} variant="destructive">
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Interview
                </Button>
              )}
              <Separator className="mx-2" />
              {!isRecording ? (
                <Button onClick={startRecognition} variant="outline" disabled={!isInterviewActive}>
                  <Mic className="w-4 h-4 mr-2" />
                  Mic On
                </Button>
              ) : (
                <Button onClick={stopRecognition} variant="outline">
                  <Square className="w-4 h-4 mr-2" />
                  Mic Off
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
              Tip: Use a Chromium-based browser for best voice support. Ensure your mic permission is allowed.
            </div>

            <div className="h-[420px] overflow-y-auto rounded-lg border border-gray-200 p-4 bg-white">
              <div className="space-y-4">
                {transcript.map((entry) => (
                  <div key={entry.id} className={cn('flex', entry.speaker === 'candidate' ? 'justify-end' : 'justify-start')}>
                    <div className={cn('flex max-w-[80%] items-start gap-3', entry.speaker === 'candidate' ? 'flex-row-reverse' : 'flex-row')}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', entry.speaker === 'candidate' ? 'bg-blue-500' : 'bg-purple-500') }>
                        {entry.speaker === 'candidate' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={cn('rounded-lg p-3 text-sm', entry.speaker === 'candidate' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900 border border-gray-200')}>
                        {entry.text}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


