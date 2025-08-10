'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Upload,
  Target,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const recentActivity = [
    {
      type: 'upload',
      title: 'Uploaded Physics Notes Chapter 5',
      time: '2 hours ago',
      icon: Upload
    },
    {
      type: 'chat',
      title: 'Asked about Thermodynamics',
      time: '1 day ago',
      icon: MessageCircle
    },
    {
      type: 'practice',
      title: 'Completed Chemistry MCQs',
      time: '2 days ago',
      icon: CheckCircle
    },
    {
      type: 'prediction',
      title: 'Generated Math predictions',
      time: '3 days ago',
      icon: Target
    }
  ];

  const quickStats = [
    {
      title: 'Study Sessions',
      value: '12',
      change: '+2 this week',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Questions Practiced',
      value: '248',
      change: '+45 this week',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'AI Interactions',
      value: '34',
      change: '+8 this week',
      icon: MessageCircle,
      color: 'text-purple-600'
    },
    {
      title: 'Success Rate',
      value: '87%',
      change: '+5% improvement',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, John!</h1>
        <p className="text-gray-600">Ready to continue your learning journey? Let's make today productive.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center', stat.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Quick Actions</CardTitle>
          <CardDescription>Jump into your most common activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/dashboard/folders">
              <Button className="w-full h-20 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 flex-col space-y-2">
                <Upload className="w-6 h-6" />
                <span>Upload Notes</span>
              </Button>
            </Link>
            <Link href="/dashboard/chat">
              <Button className="w-full h-20 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 flex-col space-y-2">
                <MessageCircle className="w-6 h-6" />
                <span>Start AI Chat</span>
              </Button>
            </Link>
            <Link href="/dashboard/practice">
              <Button className="w-full h-20 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 flex-col space-y-2">
                <FileText className="w-6 h-6" />
                <span>Generate Paper</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Recent Activity</CardTitle>
            <CardDescription>Your latest study sessions and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Upcoming</CardTitle>
            <CardDescription>Don't miss these important dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-red-800">Physics Exam</span>
              </div>
              <p className="text-xs text-red-600">March 15, 2024</p>
              <Badge variant="destructive" className="mt-2">3 days left</Badge>
            </div>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-800">Chemistry Quiz</span>
              </div>
              <p className="text-xs text-yellow-600">March 20, 2024</p>
              <Badge variant="secondary" className="mt-2">8 days left</Badge>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Math Assignment</span>
              </div>
              <p className="text-xs text-blue-600">March 25, 2024</p>
              <Badge variant="outline" className="mt-2">13 days left</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}