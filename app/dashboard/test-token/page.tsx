'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/client';
import { Copy, Check } from 'lucide-react';

export default function TestTokenPage() {
  const [token, setToken] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setToken(session.access_token);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>JWT Token for API Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Use this token in Postman's Authorization header as: <code className="bg-gray-100 px-2 py-1 rounded">Bearer {'{token}'}</code>
          </p>
          
          {token ? (
            <div className="space-y-2">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-all font-mono text-xs">
                {token}
              </div>
              <Button onClick={copyToken} className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Token
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className="text-red-600">Not logged in. Please login first.</p>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Test Commands</h3>
            <div className="space-y-2 text-sm">
              <p className="font-mono bg-white p-2 rounded">
                POST http://localhost:8000/index_folder
              </p>
              <p className="font-mono bg-white p-2 rounded">
                POST http://localhost:8000/chat
              </p>
              <p className="font-mono bg-white p-2 rounded">
                GET http://localhost:8000/folders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
