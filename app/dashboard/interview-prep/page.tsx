'use client';

import { useState } from 'react';
import { Conversation } from './convo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Brain, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (score >= 80) return 'text-emerald-700';
    if (score >= 70) return 'text-amber-700';
    return 'text-rose-700';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Good', variant: 'secondary' as const };
    return { label: 'Needs Work', variant: 'destructive' as const };
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="flex h-screen">
        {/* Left Side - ATS Score Panel (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-1/3 p-6 flex items-center"
        >
        <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden w-full max-h-[90vh] overflow-y-auto">
          <CardHeader className="pb-3 pt-4 px-4 space-y-1 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Brain className="w-4 h-4 text-blue-600" />
              Resume ATS Analyzer
            </CardTitle>
            <p className="text-xs text-gray-600">
              Get instant feedback on your resume's ATS compatibility
            </p>
          </CardHeader>
          
          <CardContent className="space-y-3 p-4">
            {/* Upload Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Upload Resume
              </label>
              
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                className="text-xs cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-colors"
              />
              
              <AnimatePresence mode="wait">
                {resumeFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded border border-gray-300 bg-gray-50 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-[10px] text-gray-600">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress Section */}
            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 p-2 bg-blue-50 rounded border border-blue-200"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 font-medium">
                      Analyzing...
                    </span>
                    <span className="text-gray-900 font-semibold">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Score Display Section */}
            <AnimatePresence mode="wait">
              {atsScore !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`rounded border p-3 ${getScoreBgColor(atsScore)}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Your ATS Score</span>
                      <Badge variant={getScoreBadge(atsScore).variant} className="text-xs font-medium">
                        {getScoreBadge(atsScore).label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
                        {atsScore}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-gray-600">out of 100</div>
                        <Progress value={atsScore} className="h-1.5" />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {atsScore >= 80 
                        ? 'Outstanding! Your resume is highly optimized for ATS systems.'
                        : atsScore >= 70
                        ? 'Good job! Minor improvements could boost your score further.'
                        : 'Tip: Add more relevant keywords and improve formatting.'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <Button
              onClick={generateAtsScore}
              disabled={!resumeFile || isAnalyzing}
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  Generate ATS Score
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        </motion.div>

        {/* Right Side - Voice Assistant (2/3) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-2/3 flex items-center justify-center p-6"
        >
          <div className="scale-[0.85] transform">
            <Conversation />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
