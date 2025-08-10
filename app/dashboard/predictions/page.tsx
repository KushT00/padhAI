'use client';

import { useState } from 'react';
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
  FileText
} from 'lucide-react';

export default function PredictionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

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
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Question Predictions</h1>
        <p className="text-gray-600">AI-powered predictions based on past exam patterns and your study materials</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Predictions</p>
                <p className="text-2xl font-bold text-gray-900">{predictions.length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Probability</p>
                <p className="text-2xl font-bold text-red-600">
                  {predictions.filter(p => p.probability >= 85).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects Covered</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Probability</p>
                <p className="text-2xl font-bold text-purple-600">83%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search predictions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Predictions List */}
      <div className="space-y-4">
        {filteredPredictions.map((prediction) => (
          <Card key={prediction.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <Badge className={getProbabilityColor(prediction.probability)}>
                        {prediction.probability}% likely
                      </Badge>
                      <Badge className={getSubjectColor(prediction.subject)}>
                        {prediction.subject}
                      </Badge>
                      <Badge className={getDifficultyColor(prediction.difficulty)}>
                        {prediction.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {prediction.marks} marks
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{prediction.topic} • {prediction.type}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Last seen: {prediction.lastSeen}</span>
                    </div>
                  </div>
                </div>

                {/* Question */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{prediction.question}</p>
                </div>

                {/* Sources */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Found in past papers:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.sources.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Priority: {prediction.probability >= 85 ? 'High' : prediction.probability >= 70 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Practice Similar
                    </Button>
                    <Button size="sm" className="bg-blue-400 hover:bg-blue-500">
                      Study This Topic
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPredictions.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedSubject !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your filters to see more predictions'
              : 'Upload more study materials to generate predictions'
            }
          </p>
        </div>
      )}
    </div>
  );
}