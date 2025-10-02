'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Home, 
  FolderOpen, 
  MessageCircle, 
  Target, 
  FileText,
  Mic,
  Timer as TimerIcon,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DashboardSidebar({ className, isMobile = false, isOpen = false, onOpenChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home
    },
    {
      name: 'My Folders',
      href: '/dashboard/folders',
      icon: FolderOpen
    },
    {
      name: 'AI Chat',
      href: '/dashboard/chat',
      icon: MessageCircle
    },
    {
      name: 'Practice',
      href: '/dashboard/practice',
      icon: FileText
    },
    {
      name: 'Interview Prep',
      href: '/dashboard/interview-prep',
      icon: Mic
    },
    {
      name: 'Study Session',
      href: '/dashboard/study-session',
      icon: TimerIcon
    },
    {
      name: 'Predictions',
      href: '/dashboard/predictions',
      icon: Target
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r border-gray-200',
        isMobile && 'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200',
        isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : '',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900">PadhAI</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isMobile && onOpenChange) {
              onOpenChange(!isOpen);
            } else {
              setIsCollapsed(!isCollapsed);
            }
          }}
          className="md:hidden"
        >
          {isMobile ? (
            isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />
          ) : isCollapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href} onClick={() => isMobile && onOpenChange?.(false)}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start px-3 py-6 text-left font-medium transition-colors',
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-blue-200' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
                    isCollapsed && 'justify-center px-3'
                  )}
                >
                  <Icon className={cn('w-5 h-5', !isCollapsed && 'mr-3')} />
                  {!isCollapsed && item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <Separator className="mb-3" />
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">JS</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
              <p className="text-xs text-gray-500 truncate">john@example.com</p>
            </div>
          )}
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
