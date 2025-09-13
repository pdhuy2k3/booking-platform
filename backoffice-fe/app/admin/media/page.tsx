'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaSelector } from '@/components/ui/media-selector';
import { toast } from 'sonner';

export default function MediaPage() {
  const [selectedFolder, setSelectedFolder] = useState<'hotels' | 'rooms' | 'amenities' | 'room-types' | 'airlines' | 'airports' | 'flights' | 'general'>('general');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  const folders = ['hotels', 'rooms', 'amenities', 'airlines', 'airports', 'flights', 'general'];

  const handleMediaSelection = (media: string[]) => {
    setSelectedMedia(media);
    toast.success(`Selected ${media.length} media items`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Media Management</h1>
        <p className="text-gray-600 mt-2">
          Browse and manage media files organized by folders. Use the media selector below to test folder-based media selection.
        </p>
      </div>

      {/* Folder Selection Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Media Selector Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder">Select Folder</Label>
                <Select value={selectedFolder} onValueChange={(value) => setSelectedFolder(value as typeof selectedFolder)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map(folder => (
                      <SelectItem key={folder} value={folder}>
                        {folder.charAt(0).toUpperCase() + folder.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Media Selection</Label>
                <MediaSelector
                  value={selectedMedia}
                  onChange={handleMediaSelection}
                  folder={selectedFolder}
                  maxSelection={10}
                  allowUpload={true}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Selected Media IDs</Label>
                <div className="bg-gray-50 p-4 rounded-md min-h-[100px]">
                  {selectedMedia.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedMedia.map((id, index) => (
                        <li key={index} className="text-sm font-mono text-gray-700">
                          {id}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No media selected</p>
                  )}
                </div>
              </div>
              
              <Button 
                onClick={() => {
                  console.log('Selected media:', selectedMedia);
                  toast.success('Check console for selected media data');
                }}
                disabled={selectedMedia.length === 0}
                className="w-full"
              >
                Log Selected Media
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage in Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              The MediaSelector component can be easily integrated into any form. Here's how to use it:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm">
{`import { MediaSelector } from '@/components/ui/media-selector';

// In your form component:
const [hotelImages, setHotelImages] = useState<string[]>([]);

<MediaSelector
  value={hotelImages}
  onChange={setHotelImages}
  folder="hotels"
  maxSelection={5}
  allowUpload={true}
/>`}
              </pre>
            </div>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Folder-based media filtering (hotels, rooms, flights, etc.)</li>
                <li>Upload new media directly to specific folders</li>
                <li>Multi-select with configurable limits</li>
                <li>Preview selected media before confirmation</li>
                <li>Search within folder contents</li>
                <li>Cloudinary optimization and responsive images</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
