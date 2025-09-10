'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaSelector } from '@/components/ui/media-selector';

/**
 * Test component to demonstrate MediaSelector usage with different modes
 */
export function MediaSelectorTestPage() {
  // Test with publicIds (string array) - normal mode
  const [publicIds, setPublicIds] = useState<string[]>([]);
  const [primaryPublicId, setPrimaryPublicId] = useState<string | null>(null);

  // Test with mediaIds (number array) - database mode
  const [mediaIds, setMediaIds] = useState<number[]>([6, 7, 8]); // Example media IDs from database
  const [primaryMediaId, setPrimaryMediaId] = useState<string | null>(null);

  // Test with mixed mode (auto-detection)
  const [mixedValues, setMixedValues] = useState<any[]>([1, 2, 3]); // Numbers that should be auto-converted

  const handlePublicIdsChange = (selectedIds: string[]) => {
    console.log('PublicIds changed:', selectedIds);
    setPublicIds(selectedIds);
  };

  const handleMediaIdsChange = (selectedIds: string[]) => {
    console.log('MediaIds mode - converted publicIds:', selectedIds);
    // In real implementation, you might want to convert back to mediaIds for saving
    // For now, just log the conversion
  };

  const handleMixedChange = (selectedIds: string[]) => {
    console.log('Mixed mode - auto-converted publicIds:', selectedIds);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">MediaSelector Test Page</h1>

      {/* Test 1: Normal PublicIds Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Test 1: PublicIds Mode (Normal)</CardTitle>
          <p className="text-sm text-gray-600">
            Standard mode where you work with Cloudinary publicIds directly
          </p>
        </CardHeader>
        <CardContent>
          <MediaSelector
            value={publicIds}
            onChange={handlePublicIdsChange}
            onPrimaryChange={setPrimaryPublicId}
            primaryImage={primaryPublicId}
            folder="hotels"
            maxSelection={5}
            allowUpload={true}
            mode="publicIds"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm"><strong>Selected PublicIds:</strong> {JSON.stringify(publicIds)}</p>
            <p className="text-sm"><strong>Primary Image:</strong> {primaryPublicId || 'None'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test 2: MediaIds Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Test 2: MediaIds Mode (Database Integration)</CardTitle>
          <p className="text-sm text-gray-600">
            Mode for when you have database mediaIds that need to be converted to publicIds for display
          </p>
        </CardHeader>
        <CardContent>
          <MediaSelector
            value={mediaIds}
            onChange={handleMediaIdsChange}
            onPrimaryChange={setPrimaryMediaId}
            primaryImage={primaryMediaId}
            folder="hotels"
            maxSelection={5}
            allowUpload={true}
            mode="mediaIds"
          />
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm"><strong>Original MediaIds:</strong> {JSON.stringify(mediaIds)}</p>
            <p className="text-sm"><strong>Primary Image:</strong> {primaryMediaId || 'None'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Test 3: Auto-Detection Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Test 3: Auto-Detection Mode</CardTitle>
          <p className="text-sm text-gray-600">
            MediaSelector automatically detects if values are numbers and converts them
          </p>
        </CardHeader>
        <CardContent>
          <MediaSelector
            value={mixedValues}
            onChange={handleMixedChange}
            folder="hotels"
            maxSelection={5}
            allowUpload={true}
            mode="publicIds" // Will auto-detect numbers and switch to mediaIds mode
          />
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p className="text-sm"><strong>Original Values:</strong> {JSON.stringify(mixedValues)}</p>
            <p className="text-sm text-orange-600">
              Note: These numbers will be auto-detected and converted to publicIds
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button 
              onClick={() => setMediaIds([1, 2, 3])}
              className="mr-2"
            >
              Set MediaIds to [1,2,3]
            </Button>
            <Button 
              onClick={() => setMediaIds([6, 7, 8])}
              className="mr-2"
            >
              Set MediaIds to [6,7,8]
            </Button>
            <Button 
              onClick={() => setMediaIds([])}
              variant="outline"
            >
              Clear MediaIds
            </Button>
          </div>
          
          <div>
            <Button 
              onClick={() => setPublicIds(['hotels/demo-1', 'hotels/demo-2'])}
              className="mr-2"
            >
              Set PublicIds to Demo
            </Button>
            <Button 
              onClick={() => setPublicIds([])}
              variant="outline"
            >
              Clear PublicIds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>For Hotel Forms (publicIds):</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<MediaSelector
  value={imagePublicIds}
  onChange={setImagePublicIds}
  onPrimaryChange={setPrimaryImage}
  primaryImage={primaryImage}
  folder="hotels"
  mode="publicIds"
/>`}
            </pre>

            <p><strong>For Database Integration (mediaIds):</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`<MediaSelector
  value={mediaIds}
  onChange={handleConvertedPublicIds}
  folder="hotels"
  mode="mediaIds"
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
