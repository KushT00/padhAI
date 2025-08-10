'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Download, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  difficulty: string;
  answered?: number;
  isCorrect?: boolean;
}

export default function PracticePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const mcqQuestions: MCQQuestion[] = [
    {
      id: 1,
      question: 'What is the first law of thermodynamics?',
      options: [
        'Energy cannot be created or destroyed, only transformed',
        'Entropy always increases in an isolated system',
        'Heat flows from hot to cold objects',
        'Work is equal to force times distance'
      ],
      correctAnswer: 0,
      explanation: 'The first law of thermodynamics states that energy cannot be created or destroyed, only transformed from one form to another. This is also known as the law of conservation of energy.',
      subject: 'Physics',
      difficulty: 'Medium'
    },
    {
      id: 2,
      question: 'Which of the following is a strong acid?',
      options: [
        'Acetic acid (CH₃COOH)',
        'Hydrochloric acid (HCl)',
        'Carbonic acid (H₂CO₃)',
        'Phosphoric acid (H₃PO₄)'
      ],
      correctAnswer: 1,
      explanation: 'Hydrochloric acid (HCl) is a strong acid because it completely dissociates in water, releasing all of its hydrogen ions.',
      subject: 'Chemistry',
      difficulty: 'Easy'
    },
    {
      id: 3,
      question: 'What is the derivative of f(x) = x³?',
      options: [
        'x²',
        '2x²',
        '3x²',
        '3x³'
      ],
      correctAnswer: 2,
      explanation: 'Using the power rule, the derivative of x³ is 3x². The power rule states that d/dx(xⁿ) = nxⁿ⁻¹.',
      subject: 'Mathematics',
      difficulty: 'Easy'
    },
    {
      id: 4,
      question: 'Which organelle is responsible for cellular respiration?',
      options: [
        'Nucleus',
        'Chloroplast',
        'Mitochondria',
        'Endoplasmic reticulum'
      ],
      correctAnswer: 2,
      explanation: 'Mitochondria are the organelles responsible for cellular respiration, converting glucose and oxygen into ATP (energy) for the cell.',
      subject: 'Biology',
      difficulty: 'Easy'
    },
    {
      id: 5,
      question: 'In which year did World War II end?',
      options: [
        '1944',
        '1945',
        '1946',
        '1947'
      ],
      correctAnswer: 1,
      explanation: 'World War II ended in 1945, with Germany surrendering in May and Japan surrendering in September after the atomic bombings.',
      subject: 'History',
      difficulty: 'Easy'
    }
  ];

  const samplePapers = [
    {
      id: 1,
      title: 'Physics Final Exam 2024',
      description: 'Comprehensive physics exam covering thermodynamics, mechanics, and modern physics',
      subject: 'Physics',
      duration: '3 hours',
      questions: 50,
      marks: 100,
      difficulty: 'High',
      generated: '2 days ago'
    },
    {
      id: 2,
      title: 'Chemistry Midterm Practice',
      description: 'Mid-semester chemistry test focusing on organic and inorganic chemistry',
      subject: 'Chemistry',
      duration: '2 hours',
      questions: 40,
      marks: 80,
      difficulty: 'Medium',
      generated: '1 week ago'
    },
    {
      id: 3,
      title: 'Mathematics Calculus Test',
      description: 'Calculus examination covering derivatives, integrals, and applications',
      subject: 'Mathematics',
      duration: '2.5 hours',
      questions: 35,
      marks: 70,
      difficulty: 'High',
      generated: '3 days ago'
    },
    {
      id: 4,
      title: 'Biology Comprehensive Exam',
      description: 'Full biology exam covering cell biology, genetics, and ecology',
      subject: 'Biology',
      duration: '3 hours',
      questions: 45,
      marks: 90,
      difficulty: 'Medium',
      generated: '5 days ago'
    }
  ];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    mcqQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / mcqQuestions.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
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
      'History': 'bg-yellow-100 text-yellow-700'
    };
    return colors[subject] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Practice Center</h1>
        <p className="text-gray-600">Test your knowledge with AI-generated questions and sample papers</p>
      </div>

      <Tabs defaultValue="mcqs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mcqs">MCQ Practice</TabsTrigger>
          <TabsTrigger value="papers">Sample Papers</TabsTrigger>
        </TabsList>

        {/* MCQ Practice Tab */}
        <TabsContent value="mcqs" className="space-y-6">
          {!quizStarted ? (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center space-x-2">
                  <Target className="w-6 h-6 text-blue-400" />
                  <span>MCQ Practice Quiz</span>
                </CardTitle>
                <CardDescription>
                  Test your knowledge with {mcqQuestions.length} carefully selected questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mcqQuestions.length}</div>
                    <div className="text-sm text-blue-600">Questions</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">Mixed</div>
                    <div className="text-sm text-green-600">Subjects</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">~10min</div>
                    <div className="text-sm text-purple-600">Duration</div>
                  </div>
                </div>
                <div className="text-center">
                  <Button 
                    onClick={() => setQuizStarted(true)}
                    className="bg-blue-400 hover:bg-blue-500"
                    size="lg"
                  >
                    Start Practice Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !showResults ? (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Question {currentQuestion + 1} of {mcqQuestions.length}</CardTitle>
                    <CardDescription>
                      <Badge className={getSubjectColor(mcqQuestions[currentQuestion].subject)}>
                        {mcqQuestions[currentQuestion].subject}
                      </Badge>
                      <Badge className={getDifficultyColor(mcqQuestions[currentQuestion].difficulty)} variant="outline">
                        {mcqQuestions[currentQuestion].difficulty}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time: 10:00
                  </div>
                </div>
                <Progress value={(currentQuestion + 1) / mcqQuestions.length * 100} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {mcqQuestions[currentQuestion].question}
                  </h3>
                  
                  <RadioGroup
                    value={selectedAnswers[currentQuestion]?.toString()}
                    onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
                  >
                    {mcqQuestions[currentQuestion].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-white transition-colors">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </Button>
                  
                  {currentQuestion === mcqQuestions.length - 1 ? (
                    <Button 
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(selectedAnswers).length !== mcqQuestions.length}
                      className="bg-blue-400 hover:bg-blue-500"
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentQuestion(Math.min(mcqQuestions.length - 1, currentQuestion + 1))}
                      disabled={selectedAnswers[currentQuestion] === undefined}
                      className="bg-blue-400 hover:bg-blue-500"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Results Summary */}
              <Card className="bg-white shadow-sm border border-gray-200">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                  <CardDescription>Here's how you performed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className={cn('text-4xl font-bold', getScoreColor(calculateScore()))}>
                      {calculateScore()}%
                    </div>
                    <div className="text-gray-600">
                      {Object.keys(selectedAnswers).filter(key => selectedAnswers[parseInt(key)] === mcqQuestions[parseInt(key)].correctAnswer).length} out of {mcqQuestions.length} correct
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                      <Button 
                        onClick={() => {
                          setQuizStarted(false);
                          setShowResults(false);
                          setCurrentQuestion(0);
                          setSelectedAnswers({});
                        }}
                        className="bg-blue-400 hover:bg-blue-500"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      <Button variant="outline">
                        View Detailed Results
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Review */}
              <div className="space-y-4">
                {mcqQuestions.map((question, index) => {
                  const userAnswer = selectedAnswers[index];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <Card key={index} className="bg-white shadow-sm border border-gray-200">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-gray-900 flex-1">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="flex items-center space-x-2">
                              {isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={cn(
                                  'p-3 rounded-lg border',
                                  optionIndex === question.correctAnswer
                                    ? 'bg-green-50 border-green-200'
                                    : userAnswer === optionIndex && !isCorrect
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50 border-gray-200'
                                )}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && (
                                  <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />
                                )}
                                {userAnswer === optionIndex && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-500 inline ml-2" />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sample Papers Tab */}
        <TabsContent value="papers" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sample Papers</h2>
              <p className="text-gray-600">Download or generate new practice papers</p>
            </div>
            <Button className="bg-blue-400 hover:bg-blue-500">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate New Paper
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {samplePapers.map((paper) => (
              <Card key={paper.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{paper.title}</CardTitle>
                      <CardDescription>{paper.description}</CardDescription>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getSubjectColor(paper.subject)}>
                          {paper.subject}
                        </Badge>
                        <Badge className={getDifficultyColor(paper.difficulty)} variant="outline">
                          {paper.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{paper.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>{paper.questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4" />
                      <span>{paper.marks} marks</span>
                    </div>
                    <div className="text-gray-500">
                      Generated {paper.generated}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button className="flex-1 bg-blue-400 hover:bg-blue-500">
                      Start Online
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}