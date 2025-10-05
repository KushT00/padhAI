'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  FolderOpen, 
  Plus, 
  Upload,
  FileText,
  Search,
  Grid3X3,
  List,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/client';
import { useRouter } from 'next/navigation';

interface Folder {
  name: string;
  path: string;
  fileCount: number;
  lastModified: Date;
}

interface FileItem {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
}

export default function FoldersPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Dialog states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadFoldersAndFiles();
    }
  }, [userId, currentFolder]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);
  };

  const loadFoldersAndFiles = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const prefix = currentFolder ? `${userId}/${currentFolder}/` : `${userId}/`;
      
      const { data, error: listError } = await supabase.storage
        .from('folders')
        .list(prefix, {
          limit: 100,
          offset: 0,
        });

      if (listError) throw listError;

      if (data) {
        // Separate folders and files
        const folderItems: Folder[] = [];
        const fileItems: FileItem[] = [];

        for (const item of data) {
          if (item.id === null) {
            // It's a folder
            folderItems.push({
              name: item.name,
              path: currentFolder ? `${currentFolder}/${item.name}` : item.name,
              fileCount: 0, // We'll need to count files separately if needed
              lastModified: new Date(item.updated_at || item.created_at)
            });
          } else {
            // It's a file
            fileItems.push({
              name: item.name,
              path: `${prefix}${item.name}`,
              size: item.metadata?.size || 0,
              lastModified: new Date(item.updated_at || item.created_at)
            });
          }
        }

        setFolders(folderItems);
        setFiles(fileItems);
      }
    } catch (err: any) {
      console.error('Error loading folders:', err);
      setError(err.message || 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!userId || !newFolderName.trim()) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Create a placeholder file to establish the folder structure
      const folderPath = currentFolder 
        ? `${userId}/${currentFolder}/${newFolderName.trim()}/.placeholder`
        : `${userId}/${newFolderName.trim()}/.placeholder`;
      
      const { error: uploadError } = await supabase.storage
        .from('folders')
        .upload(folderPath, new Blob([''], { type: 'text/plain' }), {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setNewFolderName('');
      setIsCreateFolderOpen(false);
      await loadFoldersAndFiles();
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Failed to create folder');
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async () => {
    if (!userId || !selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const filePath = currentFolder 
        ? `${userId}/${currentFolder}/${selectedFile.name}`
        : `${userId}/${selectedFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('folders')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setSelectedFile(null);
      setIsUploadFileOpen(false);
      await loadFoldersAndFiles();
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    setError(null);
    
    try {
      const { error: deleteError } = await supabase.storage
        .from('folders')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      await loadFoldersAndFiles();
    } catch (err: any) {
      console.error('Error deleting file:', err);
      setError(err.message || 'Failed to delete file');
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from('folders')
        .download(filePath);

      if (downloadError) throw downloadError;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      setError(err.message || 'Failed to download file');
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    file.name !== '.placeholder'
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getRandomColor = () => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-yellow-100 text-yellow-700 border-yellow-200'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            {currentFolder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentFolder ? currentFolder : 'My Folders'}
              </h1>
              <p className="text-gray-600">
                {currentFolder ? 'Files in this folder' : 'Organize your study materials by subject'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!currentFolder && (
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-400 hover:bg-blue-500">
                  <Plus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input
                      id="folderName"
                      placeholder="e.g., Advanced Physics"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !uploading) {
                          createFolder();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateFolderOpen(false);
                        setNewFolderName('');
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-400 hover:bg-blue-500"
                      onClick={createFolder}
                      disabled={uploading || !newFolderName.trim()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {currentFolder && (
            <Dialog open={isUploadFileOpen} onOpenChange={setIsUploadFileOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-400 hover:bg-blue-500">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File to {currentFolder}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsUploadFileOpen(false);
                        setSelectedFile(null);
                      }}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-400 hover:bg-blue-500"
                      onClick={uploadFile}
                      disabled={uploading || !selectedFile}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={currentFolder ? "Search files..." : "Search folders..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-blue-400 hover:bg-blue-500' : ''}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-blue-400 hover:bg-blue-500' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      )}

      {/* Folders Grid/List */}
      {!loading && !currentFolder && (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredFolders.map((folder) => (
            <Card 
              key={folder.path} 
              className={cn(
                'cursor-pointer hover:shadow-lg transition-shadow bg-white border border-gray-200',
                viewMode === 'list' && 'p-0'
              )}
              onClick={() => setCurrentFolder(folder.path)}
            >
              {viewMode === 'grid' ? (
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center border', getRandomColor())}>
                      <FolderOpen className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{folder.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {folder.fileCount} files
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(folder.lastModified)}
                    </Badge>
                  </div>
                </CardContent>
              ) : (
                <div className="flex items-center p-4 space-x-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', getRandomColor())}>
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{formatDate(folder.lastModified)}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{folder.fileCount} files</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Files Grid/List */}
      {!loading && currentFolder && (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredFiles.map((file) => (
            <Card 
              key={file.path} 
              className={cn(
                'hover:shadow-lg transition-shadow bg-white border border-gray-200',
                viewMode === 'list' && 'p-0'
              )}
            >
              {viewMode === 'grid' ? (
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center border bg-gray-100 text-gray-700 border-gray-200">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file.path, file.name)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.path)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(file.lastModified)}
                    </Badge>
                  </div>
                </CardContent>
              ) : (
                <div className="flex items-center p-4 space-x-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center border bg-gray-100 text-gray-700 border-gray-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatDate(file.lastModified)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(file.path, file.name)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFile(file.path)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFolders.length === 0 && filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentFolder ? 'No files found' : 'No folders found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : currentFolder
                ? 'Upload your first file to this folder'
                : 'Create your first folder to get started organizing your study materials'
            }
          </p>
          {!searchQuery && !currentFolder && (
            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Folder
            </Button>
          )}
          {!searchQuery && currentFolder && (
            <Button
              className="bg-blue-400 hover:bg-blue-500"
              onClick={() => setIsUploadFileOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First File
            </Button>
          )}
        </div>
      )}
    </div>
  );
}