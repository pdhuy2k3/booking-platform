'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Image, Trash2, Eye, Search, Check } from 'lucide-react';
import { toast } from 'sonner';
import { mediaService } from '@/services/media-service';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage, lazyload, responsive, accessibility, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { quality, format } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

export interface SimpleMediaItem {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  folder?: string;
}

interface MediaSelectorProps {
  value?: string[]; // Array of publicIds
  onChange?: (selectedMedia: string[]) => void;
  folder?: string; // Folder to filter by (e.g., 'hotels', 'flights', 'rooms')
  maxSelection?: number;
  allowUpload?: boolean;
  className?: string;
}

export function MediaSelector({
  value = [],
  onChange,
  folder = 'general',
  maxSelection = 5,
  allowUpload = true,
  className = ''
}: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<SimpleMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>(value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Initialize Cloudinary instance
  const cld = new Cloudinary({
    cloud: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    }
  });

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      
      const result = await mediaService.searchMedia({
        folder: folder || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: pageSize
      });
      
      setMediaItems(result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('Error fetching media:', error);
      // Show demo data for development
      const demoData: SimpleMediaItem[] = [
        {
          publicId: `${folder}/demo-1`,
          url: `https://res.cloudinary.com/demo/image/upload/v1234567890/${folder}/demo-1.jpg`,
          secureUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/${folder}/demo-1.jpg`,
          format: 'jpg',
          width: 800,
          height: 600,
          bytes: 125000,
          folder: folder
        }
      ];
      setMediaItems(demoData);
      
      if (!error?.toString().includes('404')) {
        toast.error('Media service unavailable - showing demo data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
    }
  }, [isOpen, searchQuery, currentPage, folder]);

  useEffect(() => {
    setSelectedMedia(value);
  }, [value]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      
      const result = await mediaService.uploadMedia(selectedFile, folder);

      toast.success(result.message || 'Media uploaded successfully');
      setSelectedFile(null);
      fetchMediaItems();
      setCurrentPage(1);
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const toggleMediaSelection = (publicId: string) => {
    const newSelection = selectedMedia.includes(publicId)
      ? selectedMedia.filter(id => id !== publicId)
      : selectedMedia.length < maxSelection
        ? [...selectedMedia, publicId]
        : selectedMedia;
    
    setSelectedMedia(newSelection);
  };

  const handleConfirmSelection = () => {
    onChange?.(selectedMedia);
    setIsOpen(false);
  };

  const CloudinaryImageComponent = ({ publicId, className }: { publicId: string; className?: string }) => {
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      const myImage = cld.image(publicId)
        .resize(fill().width(200).height(150))
        .delivery(quality(auto()))
        .delivery(format(autoFormat()));
      
      return (
        <AdvancedImage
          cldImg={myImage}
          alt="Media"
          className={className}
          plugins={[lazyload(), responsive(), accessibility(), placeholder()]}
        />
      );
    }
    
    // Use the media service to get optimized URL
    const optimizedUrl = mediaService.getOptimizedUrl(`/api/media/${publicId}`, {
      width: 200,
      height: 150,
      crop: 'fill',
      quality: 'auto'
    });
    
    return (
      <img
        src={optimizedUrl}
        alt="Media"
        className={className}
      />
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Selected Media Preview */}
      {selectedMedia.length > 0 && (
        <div className="mb-4">
          <Label className="text-sm font-medium">Selected Media ({selectedMedia.length}/{maxSelection})</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {selectedMedia.map((publicId) => (
              <div key={publicId} className="relative group">
                <CloudinaryImageComponent 
                  publicId={publicId}
                  className="w-full h-20 object-cover rounded-md"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => toggleMediaSelection(publicId)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media Selector Button */}
      <Button 
        type="button"
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <Image className="h-4 w-4 mr-2" />
        {selectedMedia.length > 0 ? `${selectedMedia.length} selected` : 'Select Media'}
        {folder && <Badge variant="secondary" className="ml-2">{folder}</Badge>}
      </Button>

      {/* Media Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Select Media - {folder.charAt(0).toUpperCase() + folder.slice(1)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {allowUpload && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="upload">Upload New</Label>
                    <Input
                      id="upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-auto">
              <Card>
                <CardContent className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                      <span className="ml-2">Loading media...</span>
                    </div>
                  ) : mediaItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">No media found in {folder} folder</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaItems.map((media) => (
                        <div
                          key={media.publicId}
                          className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            selectedMedia.includes(media.publicId)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => {
                            if (selectedMedia.length < maxSelection || selectedMedia.includes(media.publicId)) {
                              toggleMediaSelection(media.publicId);
                            } else {
                              toast.warning(`Maximum ${maxSelection} media can be selected`);
                            }
                          }}
                        >
                          <CloudinaryImageComponent
                            publicId={media.publicId}
                            className="w-full h-32 object-cover"
                          />
                          
                          {/* Selection indicator */}
                          {selectedMedia.includes(media.publicId) && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}

                          {/* Media info */}
                          <div className="p-2 bg-white">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="text-xs">
                                {media.format.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-gray-600 truncate">
                              {media.publicId.split('/').pop()}
                            </p>
                            
                            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                              <span>{formatFileSize(media.bytes)}</span>
                              {media.width && media.height && (
                                <span>{media.width}×{media.height}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedMedia.length} of {maxSelection} selected
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmSelection}>
                  Confirm Selection
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}