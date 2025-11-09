'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Search, 
  Filter,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { getUserFolders, generatePaper, getPapers } from '@/lib/api';
import { supabase } from '@/lib/client';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface GeneratedPaper {
  filename: string;
  folder: string;
  marks: number;
  path: string;
  created_at: string;
  updated_at: string;
  size: number;
}

export default function PredictionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Paper generation states
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [selectedMarks, setSelectedMarks] = useState<number>(20);
  const [papers, setPapers] = useState<GeneratedPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  // Load folders and papers on mount
  useEffect(() => {
    loadFolders();
    loadPapers();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await getUserFolders();
      setFolders(data.folders);
      if (data.folders.length > 0) {
        setSelectedFolder(data.folders[0]);
      }
    } catch (err: any) {
      console.error('Error loading folders:', err);
      setError('Failed to load folders');
    }
  };

  const loadPapers = async () => {
    try {
      setLoadingPapers(true);
      const data = await getPapers();
      setPapers(data.papers);
    } catch (err: any) {
      console.error('Error loading papers:', err);
    } finally {
      setLoadingPapers(false);
    }
  };

  const handleGeneratePaper = async () => {
    if (!selectedFolder) {
      setError('Please select a folder');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const result = await generatePaper(selectedFolder, selectedMarks);
      
      setSuccessMessage(`Paper generated successfully! (${result.marks} marks)`);
      setIsGenerateDialogOpen(false);
      
      // Reload papers list
      await loadPapers();
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error generating paper:', err);
      setError(err.message || 'Failed to generate paper. Make sure the folder is indexed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPaper = async (paper: GeneratedPaper) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('folders')
        .download(paper.path);

      if (downloadError) throw downloadError;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = paper.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading paper:', err);
      setError('Failed to download paper');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const predictions = [
    {
      id: 1,
      question: 'Explain the first law of thermodynamics and provide a real-world example of energy conservation.',
      subject: 'Physics',
      topic: 'Thermodynamics',
      difficulty: 'Medium',
      probability: 85,
      sources: ['2022 Final Exam', '2021 Midterm', '2020 Final Exam'],
      type: 'Long Answer',
      marks: 10,
      lastSeen: '2022'
    },
    {
      id: 2,
      question: 'Calculate the pH of a 0.1M solution of acetic acid (Ka = 1.8 × 10⁻⁵)',
      subject: 'Chemistry',
      topic: 'Acid-Base Equilibrium',
      difficulty: 'High',
      probability: 92,
      sources: ['2023 Final Exam', '2022 Practice Paper', '2021 Final Exam'],
      type: 'Calculation',
      marks: 8,
      lastSeen: '2023'
    },
    {
      id: 3,
      question: 'Differentiate between mitosis and meiosis, highlighting their significance in reproduction.',
      subject: 'Biology',
      topic: 'Cell Division',
      difficulty: 'Medium',
      probability: 78,
      sources: ['2022 Final Exam', '2021 Midterm'],
      type: 'Compare & Contrast',
      marks: 12,
      lastSeen: '2022'
    },
    {
      id: 4,
      question: 'Find the derivative of f(x) = x³ ln(x) using the product rule.',
      subject: 'Mathematics',
      topic: 'Calculus',
      difficulty: 'Medium',
      probability: 88,
      sources: ['2023 Midterm', '2022 Final Exam', '2021 Practice Paper'],
      type: 'Calculation',
      marks: 6,
      lastSeen: '2023'
    },
    {
      id: 5,
      question: 'Analyze the themes of isolation and alienation in Kafka\'s "The Metamorphosis".',
      subject: 'Literature',
      topic: 'Modern Literature',
      difficulty: 'High',
      probability: 73,
      sources: ['2022 Final Exam', '2021 Final Exam'],
      type: 'Essay',
      marks: 15,
      lastSeen: '2022'
    },
    {
      id: 6,
      question: 'What were the main causes and consequences of World War I?',
      subject: 'History',
      topic: '20th Century History',
      difficulty: 'Medium',
      probability: 81,
      sources: ['2023 Final Exam', '2022 Midterm', '2021 Final Exam'],
      type: 'Long Answer',
      marks: 12,
      lastSeen: '2023'
    }
  ];

  const subjects = ['all', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Literature', 'History'];
  const difficulties = ['all', 'Low', 'Medium', 'High'];

  const filteredPredictions = predictions.filter(prediction => {
    const matchesSearch = prediction.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prediction.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || prediction.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'all' || prediction.difficulty === selectedDifficulty;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const getProbabilityColor = (probability: number) => {
    if (probability >= 85) return 'bg-red-100 text-red-700 border-red-200';
    if (probability >= 70) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'High': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Physics': 'bg-blue-100 text-blue-700',
      'Chemistry': 'bg-green-100 text-green-700',
      'Biology': 'bg-orange-100 text-orange-700',
      'Mathematics': 'bg-purple-100 text-purple-700',
      'Literature': 'bg-pink-100 text-pink-700',
      'History': 'bg-yellow-100 text-yellow-700'
    };
    return colors[subject] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </Button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuccessMessage('')}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Exam Paper Generation</h1>
          <p className="text-gray-600">Generate AI-powered exam papers from your indexed study materials</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-400 hover:bg-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Generate New Paper
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Exam Paper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="folder-select">Select Folder</Label>
                <Select 
                  value={selectedFolder} 
                  onValueChange={setSelectedFolder}
                  disabled={loading}
                >
                  <SelectTrigger id="folder-select">
                    <SelectValue placeholder="Choose a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.length === 0 ? (
                      <SelectItem value="none" disabled>No folders found</SelectItem>
                    ) : (
                      folders.map((folder) => (
                        <SelectItem key={folder} value={folder}>
                          {folder}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks-select">Paper Marks</Label>
                <Select 
                  value={selectedMarks.toString()} 
                  onValueChange={(val) => setSelectedMarks(parseInt(val))}
                  disabled={loading}
                >
                  <SelectTrigger id="marks-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 Marks (Short Paper)</SelectItem>
                    <SelectItem value="60">60 Marks (Full Paper)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {selectedMarks === 20 
                    ? '5 MCQs + 3 Short Answer Questions (45 min)' 
                    : '10 MCQs + 5 Short + 3 Long Answer Questions (2 hours)'}
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsGenerateDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-blue-400 hover:bg-blue-500"
                  onClick={handleGeneratePaper}
                  disabled={loading || !selectedFolder}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Generate Paper
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Papers</p>
                <p className="text-2xl font-bold text-gray-900">{papers.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">20 Marks Papers</p>
                <p className="text-2xl font-bold text-green-600">
                  {papers.filter(p => p.marks === 20).length}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">60 Marks Papers</p>
                <p className="text-2xl font-bold text-purple-600">
                  {papers.filter(p => p.marks === 60).length}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Papers List */}
      {loadingPapers ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : papers.length === 0 ? (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No papers generated yet</h3>
            <p className="text-gray-600 mb-6">
              Generate your first exam paper from your indexed study materials
            </p>
            <Button 
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Your First Paper
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {papers.map((paper) => (
            <Card key={paper.filename} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">{paper.folder}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={paper.marks === 20 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}>
                        {paper.marks} Marks
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {formatDate(paper.created_at)}
                      </Badge>
                    </div>
                  </div>
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{paper.marks === 20 ? '45 minutes' : '2 hours'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>{paper.marks === 20 ? '8 questions' : '18 questions'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{formatFileSize(paper.size)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{paper.marks === 20 ? 'Short Paper' : 'Full Paper'}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Structure:</strong> {paper.marks === 20 
                      ? 'MCQs (5) + Short Answer (3)' 
                      : 'MCQs (10) + Short Answer (5) + Long Answer (3)'}
                  </p>
                  <Button 
                    className="w-full bg-blue-400 hover:bg-blue-500"
                    onClick={() => downloadPaper(paper)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Paper
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}