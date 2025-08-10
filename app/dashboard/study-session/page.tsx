'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Timer,
  Plus,
  Trash2,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Target,
  BookOpen,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Todo = {
  id: string;
  title: string;
  notes?: string;
  done: boolean;
  estimateMin?: number;
};

export default function StudySessionPage() {
  const [minutesInput, setMinutesInput] = useState<string>('25');
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [autoContinue, setAutoContinue] = useState(true);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoTitle, setTodoTitle] = useState('');
  const [todoNotes, setTodoNotes] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(3);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearTimer();
          notify(`${isBreak ? 'Break' : 'Focus'} timer finished`);
          if (autoContinue) togglePhase();
          return 0;
        }
        return s - 1;
      });
    }, 1000) as unknown as number;
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const totalSeconds = useMemo(() => {
    const m = parseInt(minutesInput || '0', 10);
    return isNaN(m) ? 0 : m * 60;
  }, [minutesInput]);

  const progress = totalSeconds === 0 ? 0 : ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const startTimer = () => {
    const m = parseInt(minutesInput || '0', 10);
    if (!m || m <= 0) return;
    setSecondsLeft(m * 60);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);
  const resumeTimer = () => setIsRunning(true);
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(0);
  };

  const togglePhase = () => {
    setIsBreak((b) => !b);
    setSecondsLeft((parseInt(minutesInput || '0', 10) || 0) * 60);
    setIsRunning(true);
  };

  const addTodo = () => {
    if (!todoTitle.trim()) return;
    setTodos((t) => [
      ...t,
      { id: `${Date.now()}`, title: todoTitle.trim(), notes: todoNotes.trim() || undefined, done: false },
    ]);
    setTodoTitle('');
    setTodoNotes('');
  };

  const toggleTodo = (id: string) => {
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  const deleteTodo = (id: string) => setTodos((t) => t.filter((x) => x.id !== id));

  const completedCount = todos.filter((t) => t.done).length;
  const goalProgress = Math.min(100, Math.round((completedCount / Math.max(1, dailyGoal)) * 100));

  const notify = (message: string) => {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(message);
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch {
      // ignore
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const r = (s % 60).toString().padStart(2, '0');
    return `${m}:${r}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Study Session</h1>
        <p className="text-gray-600">Focus timer, goals, and a to-do list to structure your study.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="bg-white shadow-sm border border-gray-200 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Focus Timer
            </CardTitle>
            <CardDescription>Simple Pomodoro-style focus timer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Minutes</label>
                <Input value={minutesInput} onChange={(e) => setMinutesInput(e.target.value)} placeholder="25" />
              </div>
              {!isRunning && secondsLeft === 0 && (
                <Button onClick={startTimer} className="bg-blue-400 hover:bg-blue-500">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
              {isRunning && (
                <Button onClick={pauseTimer} variant="outline">
                  <PauseCircle className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              {!isRunning && secondsLeft > 0 && (
                <Button onClick={resumeTimer} className="bg-blue-400 hover:bg-blue-500">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              {(secondsLeft > 0 || isRunning) && (
                <Button onClick={resetTimer} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
            <div className={cn('text-5xl font-bold tracking-tight', isBreak ? 'text-green-600' : 'text-blue-600')}>
              {formatTime(secondsLeft || totalSeconds)}
            </div>
            <Progress value={progress} />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Phase: {isBreak ? 'Break' : 'Focus'}</div>
              <Button onClick={togglePhase} variant="outline" size="sm">
                Switch Phase
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell className="w-4 h-4" />
                Auto-continue
              </div>
              <Switch checked={autoContinue} onCheckedChange={setAutoContinue} />
            </div>
          </CardContent>
        </Card>

        {/* Goals & To-do */}
        <Card className="bg-white shadow-sm border border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals & Tasks
            </CardTitle>
            <CardDescription>Set your goals and track tasks during this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a task (e.g., Read chapter 3)"
                    value={todoTitle}
                    onChange={(e) => setTodoTitle(e.target.value)}
                  />
                  <Button onClick={addTodo} className="bg-blue-400 hover:bg-blue-500">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  placeholder="Notes (optional)"
                  value={todoNotes}
                  onChange={(e) => setTodoNotes(e.target.value)}
                />
                <div className="space-y-2">
                  {todos.length === 0 && (
                    <div className="text-sm text-gray-500">No tasks yet. Add your first task to begin.</div>
                  )}
                  <div className="space-y-2">
                    {todos.map((t) => (
                      <div key={t.id} className="flex items-start justify-between rounded-lg border border-gray-200 p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <button
                              className={cn('w-5 h-5 rounded-full border', t.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300')}
                              onClick={() => toggleTodo(t.id)}
                              aria-label="toggle task"
                            />
                            <span className={cn('font-medium text-gray-900 truncate', t.done && 'line-through text-gray-500')}>{t.title}</span>
                            {t.done && (
                              <Badge className="ml-2 bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" /> Done
                              </Badge>
                            )}
                          </div>
                          {t.notes && <div className="text-xs text-gray-600 mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => deleteTodo(t.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Daily Goal (tasks)</label>
                <Input
                  type="number"
                  min={1}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{completedCount} / {dailyGoal} completed</span>
                    <span>{goalProgress}%</span>
                  </div>
                  <Progress value={goalProgress} />
                </div>
                <div className="rounded-md border border-gray-200 p-3 bg-gray-50 text-sm text-gray-600">
                  Tip: Keep tasks small and achievable. Celebrate quick wins to stay motivated.
                </div>
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="plan" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plan">Study Plan</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="log">Session Log</TabsTrigger>
              </TabsList>
              <TabsContent value="plan" className="space-y-2">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Suggested: 25m focus + 5m break cycles. Try 3 cycles for this session.
                </div>
              </TabsContent>
              <TabsContent value="notes">
                <Textarea placeholder="Jot quick notes during your session..." className="min-h-[140px]" />
              </TabsContent>
              <TabsContent value="log" className="space-y-2 text-sm text-gray-600">
                <div>Completed tasks: {completedCount}</div>
                <div>Total tasks: {todos.length}</div>
                <div>Auto-continue: {autoContinue ? 'On' : 'Off'}</div>
                <div>Phase: {isBreak ? 'Break' : 'Focus'}; Minutes setting: {minutesInput}</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


