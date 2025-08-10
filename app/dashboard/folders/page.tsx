'use client';

import { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FoldersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const folders = [
    {
      id: 1,
      name: 'Physics',
      description: 'Thermodynamics, Mechanics, and Modern Physics',
      fileCount: 12,
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      lastModified: '2 days ago'
    },
    {
      id: 2,
      name: 'Chemistry',
      description: 'Organic, Inorganic, and Physical Chemistry',
      fileCount: 8,
      color: 'bg-green-100 text-green-700 border-green-200',
      lastModified: '1 week ago'
    },
    {
      id: 3,
      name: 'Mathematics',
      description: 'Calculus, Algebra, and Statistics',
      fileCount: 15,
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      lastModified: '3 days ago'
    },
    {
      id: 4,
      name: 'Biology',
      description: 'Cell Biology, Genetics, and Ecology',
      fileCount: 6,
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      lastModified: '5 days ago'
    },
    {
      id: 5,
      name: 'English Literature',
      description: 'Shakespeare, Poetry, and Modern Literature',
      fileCount: 10,
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      lastModified: '1 day ago'
    },
    {
      id: 6,
      name: 'History',
      description: 'World History, Ancient Civilizations',
      fileCount: 4,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      lastModified: '2 weeks ago'
    }
  ];

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Folders</h1>
          <p className="text-gray-600">Organize your study materials by subject</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
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
                  <Input id="folderName" placeholder="e.g., Advanced Physics" />
                </div>
                <div>
                  <Label htmlFor="folderDescription">Description (Optional)</Label>
                  <Input id="folderDescription" placeholder="Brief description of the folder contents" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-blue-400 hover:bg-blue-500">Create</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search folders..."
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

      {/* Folders Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'space-y-4'
      )}>
        {filteredFolders.map((folder) => (
          <Card 
            key={folder.id} 
            className={cn(
              'cursor-pointer hover:shadow-lg transition-shadow bg-white border border-gray-200',
              viewMode === 'list' && 'p-0'
            )}
          >
            {viewMode === 'grid' ? (
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center border', folder.color)}>
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{folder.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{folder.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {folder.fileCount} files
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.lastModified}
                  </Badge>
                </div>
              </CardContent>
            ) : (
              <div className="flex items-center p-4 space-x-4">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center border', folder.color)}>
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{folder.description}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{folder.fileCount} files</span>
                  <span>{folder.lastModified}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFolders.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No folders found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try adjusting your search terms' : 'Create your first folder to get started organizing your study materials'}
          </p>
          {!searchQuery && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-400 hover:bg-blue-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Folder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="folderName">Folder Name</Label>
                    <Input id="folderName" placeholder="e.g., Advanced Physics" />
                  </div>
                  <div>
                    <Label htmlFor="folderDescription">Description (Optional)</Label>
                    <Input id="folderDescription" placeholder="Brief description of the folder contents" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button className="bg-blue-400 hover:bg-blue-500">Create</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}