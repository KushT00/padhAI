'use client';

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <DashboardSidebar />
      </div>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <DashboardSidebar isMobile isOpen={mobileOpen} onOpenChange={setMobileOpen} />
      </div>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-40 bg-gray-50/80 backdrop-blur border-b border-gray-200 p-3 flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <div />
        </div>
        {children}
      </div>
    </div>
  );
}