'use client';

import { useState } from 'react';
import { Conversation } from './convo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InterviewPrepPage() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
    setAtsScore(null);
    setUploadProgress(0);
  };

  const generateAtsScore = () => {
    if (!resumeFile) return;
    
    setIsAnalyzing(true);
    setUploadProgress(0);
    
    // Simulate upload and analysis
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Generate random ATS score between 65-95
          const score = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
          setAtsScore(score);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Needs Work', variant: 'destructive' as const };
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 gap-6">
      <Conversation />
      
      {/* ATS Score Panel */}
      <Card className="w-full max-w-[480px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Resume ATS Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Upload Resume (PDF/DOC/DOCX)
            </label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="flex-1"
              />
            </div>
            
            {resumeFile && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isAnalyzing && !atsScore && (
                  <Badge variant="outline" className="bg-white">
                    Ready
                  </Badge>
                )}
              </div>
            )}
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Analyzing resume...</span>
                <span className="text-gray-900 font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {atsScore !== null && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ATS Score</span>
                <Badge {...getScoreBadge(atsScore)}>
                  {getScoreBadge(atsScore).label}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-4xl font-bold ${getScoreColor(atsScore)}`}>
                  {atsScore}
                </div>
                <div className="text-sm text-gray-600 flex-1">
                  out of 100
                </div>
                {atsScore >= 80 ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
              </div>
              <Progress value={atsScore} className="h-2" />
              <p className="text-xs text-gray-600 italic">
                {atsScore >= 80 
                  ? 'Your resume is well-optimized for ATS systems!'
                  : atsScore >= 70
                  ? 'Your resume is good but could use some improvements.'
                  : 'Consider optimizing your resume with more relevant keywords.'}
              </p>
            </div>
          )}

          <Button
            onClick={generateAtsScore}
            disabled={!resumeFile || isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate ATS Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
