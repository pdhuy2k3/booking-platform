import { apiClient } from '@/lib/api-client';
import type { MediaResponse } from '@/types/api';

export interface MediaUploadResponse {
  mediaUrl: string;    // URL in format "/api/media/{publicId}"
  publicId: string;    // Cloudinary public ID
  secureUrl: string;   // Cloudinary secure HTTPS URL
  mediaType: string;   // image, video, document, etc.
  message: string;     // Success message
}

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

class MediaService {
  /**
   * Upload any media type directly to media service
   * Returns mediaUrl that can be stored in any entity's media field
   */
  async uploadMedia(file: File, folder?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await apiClient.post('/api/media/management/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as { data: any };

    // Extract data from media service response
    const data = response.data.data || response.data;
    
    return {
      mediaUrl: `/api/media/${data.publicId}`,
      publicId: data.publicId,
      secureUrl: data.secureUrl || data.url,
      mediaType: data.mediaType || 'image',
      message: data.message || 'Media uploaded successfully'
    };
  }

  /**
   * Convert SimpleMediaItem to MediaResponse
   */
  convertSimpleMediaItemToMediaResponse(item: SimpleMediaItem, index: number = 0): MediaResponse {
    return {
      id: item.id || index, // Use actual ID if available, otherwise placeholder
      mediaId: item.mediaId || item.id || index, // Use mediaId if available, otherwise ID, otherwise placeholder
      publicId: item.publicId,
      url: item.url,
      secureUrl: item.secureUrl,
      isPrimary: false, // Will be set by the selector
      displayOrder: index
    };
  }

  /**
   * Convert MediaResponse to SimpleMediaItem
   */
  convertMediaResponseToSimpleMediaItem(media: MediaResponse): SimpleMediaItem {
    return {
      id: media.id, // Include actual ID
      mediaId: media.mediaId, // Include actual mediaId
      publicId: media.publicId,
      url: media.url,
      secureUrl: media.secureUrl,
      format: 'jpg', // Default format
      bytes: 0, // Default bytes
      folder: '' // Default folder
    };
  }

  /**
   * Convert media IDs to media DTOs - Key method for MediaSelector
   */
  async convertMediaIdsToMediaDtos(mediaIds: number[], folder: string = 'hotels'): Promise<SimpleMediaItem[]> {
    if (!mediaIds || mediaIds.length === 0) {
      return [];
    }
    
    try {
      console.log('Converting mediaIds to DTOs:', mediaIds);
      const response = await apiClient.post('/api/media/management/convert-media-ids', mediaIds) as { data: any };
      const mediaList = response.data.data || response.data || [];
      
      console.log('Received media list from backend:', mediaList);
      
      const result = mediaList.map((item: any) => ({
        id: item.id, // Database ID
        mediaId: item.id, // Database ID (alias for consistency)
        publicId: item.publicId,
        url: item.url,
        secureUrl: item.secureUrl,
        format: item.format || 'jpg',
        width: item.width,
        height: item.height,
        bytes: item.fileSize || item.bytes || 0,
        folder: item.folder
      }));
      
      console.log('Converted to SimpleMediaItem[]:', result);
      return result;
      
    } catch (error) {
      console.error('Error converting media IDs to DTOs:', error);
      
      // Provide fallback demo data based on mediaIds - only hotel and flight related
      console.log('Using fallback demo data for mediaIds:', mediaIds);
      const hotelAndFlightFolders = ['hotels', 'rooms', 'amenities', 'room-types', 'airlines', 'airports', 'flights'];
      const demoFolder = hotelAndFlightFolders.includes(folder) ? folder : 'hotels';
      return mediaIds.map(id => ({
        id: id, // Database ID
        mediaId: id, // Database ID (alias for consistency)
        publicId: `${demoFolder}/media-${id}`,
        url: `https://res.cloudinary.com/demo/image/upload/v1234567890/${demoFolder}/media-${id}.jpg`,
        secureUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/${demoFolder}/media-${id}.jpg`,
        format: 'jpg',
        width: 800,
        height: 600,
        bytes: 125000,
        folder: demoFolder
      }));
    }
  }

  /**
   * Get media by type from database
   */
  async getMediaByType(mediaType: string): Promise<SimpleMediaItem[]> {
    const response = await apiClient.get(`/api/media/management/type/${mediaType}`) as { data: any };
    const mediaList = response.data.data || response.data || [];
    
    return mediaList.map((item: any) => ({
      id: item.id,
      mediaId: item.id,
      publicId: item.publicId,
      url: item.url,
      secureUrl: item.secureUrl,
      format: item.format || 'jpg',
      width: item.width,
      height: item.height,
      bytes: item.fileSize || 0,
      folder: item.folder
    }));
  }

  /**
   * Get all media with pagination
   */
  async getAllMedia(page = 0, size = 20): Promise<{ items: SimpleMediaItem[], total: number, totalPages: number }> {
    try {
      const response = await apiClient.get('/api/media/management', {
        params: { page, size }
      }) as { data: any };

      const data = response.data.data || response.data;
      
      // If database is empty, try Cloudinary fallback
      if (data && data.content && data.content.length === 0) {
        console.log('Database empty, trying Cloudinary fallback...');
        return this.getAllMediaFromCloudinary(page, size);
      }
      
      return {
        items: data.content?.map((item: any) => ({
          id: item.id,
          mediaId: item.id,
          publicId: item.publicId,
          url: item.url,
          secureUrl: item.secureUrl,
          format: item.format || 'jpg',
          width: item.width,
          height: item.height,
          bytes: item.fileSize || 0,
          folder: item.folder
        })) || [],
        total: data.totalElements || 0,
        totalPages: data.totalPages || 0
      };
    } catch (error) {
      console.error('Database request failed, trying Cloudinary fallback...', error);
      return this.getAllMediaFromCloudinary(page, size);
    }
  }

  /**
   * Get all media from Cloudinary directly (fallback)
   */
  async getAllMediaFromCloudinary(page = 0, size = 20): Promise<{ items: SimpleMediaItem[], total: number, totalPages: number }> {
    try {
      const response = await apiClient.get('/api/media/management/cloudinary', {
        params: { 
          page: page + 1, // Cloudinary uses 1-based pages
          limit: size 
        }
      }) as { data: any };

      const data = response.data.data || response.data;
      
      return {
        items: data.resources?.map((item: any) => ({
          publicId: item.public_id,
          url: item.url,
          secureUrl: item.secure_url,
          format: item.format,
          width: item.width,
          height: item.height,
          bytes: item.bytes,
          folder: item.folder
        })) || [],
        total: data.total_count || 0,
        totalPages: Math.ceil((data.total_count || 0) / size)
      };
    } catch (error) {
      console.error('Error fetching from Cloudinary:', error);
      // Return demo data as final fallback - only hotel and flight related
      const hotelAndFlightFolders = ['hotels', 'rooms', 'amenities', 'room-types', 'airlines', 'airports', 'flights'];
      const demoFolder = hotelAndFlightFolders.includes(folder) ? folder : 'hotels';
      return {
        items: [{
          id: 1, // Demo ID
          mediaId: 1, // Demo mediaId
          publicId: `${demoFolder}/demo-1`,
          url: `https://res.cloudinary.com/demo/image/upload/v1234567890/${demoFolder}/demo-1.jpg`,
          secureUrl: `https://res.cloudinary.com/demo/image/upload/v1234567890/${demoFolder}/demo-1.jpg`,
          format: 'jpg',
          width: 800,
          height: 600,
          bytes: 125000,
          folder: demoFolder
        }],
        total: 1,
        totalPages: 1
      };
    }
  }

  /**
   * Get media by folder (for folder-filtered browsing)
   */
  async getMediaByFolder(folder: string, page = 1, limit = 20): Promise<{ items: SimpleMediaItem[], total: number, totalPages: number }> {
    try {
      const response = await apiClient.get('/api/media/management/folder/' + encodeURIComponent(folder), {
        params: { 
          page: page, // Backend uses 1-based pages
          limit: limit 
        }
      }) as { data: any };

      const data = response.data.data || response.data;
      
      return {
        items: data.resources?.map((item: any) => ({
          publicId: item.public_id,
          url: item.url,
          secureUrl: item.secure_url,
          format: item.format,
          width: item.width,
          height: item.height,
          bytes: item.bytes,
          folder: item.folder
        })) || [],
        total: data.total_count || 0,
        totalPages: Math.ceil((data.total_count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching media by folder:', error);
      // Fallback to client-side filtering
      const result = await this.getAllMedia(page - 1, limit); // Convert to 0-based page
      const filteredItems = result.items.filter(item => 
        item.folder === folder || item.publicId.startsWith(folder + '/')
      );
      return {
        items: filteredItems,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
      };
    }
  }

  /**
   * Search media with optional folder filter
   */
  async searchMedia({
    folder,
    search,
    page = 1,
    limit = 20
  }: {
    folder?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: SimpleMediaItem[], total: number, totalPages: number }> {
    // Build query parameters
    const params: any = { page, limit };
    
    if (search) {
      params.search = search;
    }
    
    try {
      let url = '/api/media/management/search';
      
      // If folder is specified, use folder-specific endpoint
      if (folder) {
        url = '/api/media/management/folder/' + encodeURIComponent(folder) + '/search';
      }
      
      const response = await apiClient.get(url, { params }) as { data: any };
      const data = response.data.data || response.data;
      
      return {
        items: data.resources?.map((item: any) => ({
          publicId: item.public_id,
          url: item.url,
          secureUrl: item.secure_url,
          format: item.format,
          width: item.width,
          height: item.height,
          bytes: item.bytes,
          folder: item.folder
        })) || [],
        total: data.total_count || 0,
        totalPages: data.total_pages || Math.ceil((data.total_count || 0) / limit)
      };
    } catch (error) {
      console.error('Error searching media:', error);
      
      // Fallback to client-side filtering if backend search fails
      let result;
      if (folder) {
        // Use folder-specific method
        result = await this.getMediaByFolder(folder, page, limit);
      } else {
        // Use getAllMedia
        result = await this.getAllMedia(page - 1, limit); // Convert to 0-based page
      }
      
      // Client-side filtering for search text
      let filteredItems = result.items;
      
      if (search) {
        filteredItems = filteredItems.filter(item => 
          item.publicId.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      return {
        items: filteredItems,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
      };
    }
  }

  /**
   * Delete media from Cloudinary
   */
  async deleteMedia(publicId: string): Promise<void> {
    await apiClient.delete(`/api/media/${encodeURIComponent(publicId)}`);
  }

  /**
   * Extract publicId from mediaUrl
   */
  extractPublicId(mediaUrl: string): string {
    if (mediaUrl.startsWith('/api/media/')) {
      return mediaUrl.substring('/api/media/'.length);
    }
    return mediaUrl;
  }

  /**
   * Generate optimized Cloudinary URL for any media type
   */
  getOptimizedUrl(mediaUrl: string, options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale';
    quality?: 'auto' | number;
    resourceType?: 'image' | 'video' | 'auto';
  } = {}): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName || !mediaUrl.startsWith('/api/media/')) {
      return mediaUrl;
    }

    const publicId = this.extractPublicId(mediaUrl);
    const { width = 300, height = 200, crop = 'fill', quality = 'auto', resourceType = 'image' } = options;
    
    return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/w_${width},h_${height},c_${crop},q_${quality}/${publicId}`;
  }

  /**
   * Get available folders - only hotel and flight related folders
   */
  async getFolders(): Promise<string[]> {
    try {
      const response = await apiClient.get('/api/media/folders') as { data: any };
      const data = response.data.data || response.data;
      // Filter to only include hotel and flight related folders
      const hotelAndFlightFolders = ['hotels', 'rooms', 'amenities', 'room-types', 'airlines', 'airports', 'flights'];
      const availableFolders = data.folders?.map((folder: any) => folder.name) || [];
      return availableFolders.filter((folder: string) => hotelAndFlightFolders.includes(folder));
    } catch (error) {
      console.error('Error getting folders:', error);
      // Return default hotel and flight folders for development
      return ['hotels', 'rooms', 'amenities', 'room-types', 'airlines', 'airports', 'flights'];
    }
  }

  // Legacy methods for backward compatibility
  async uploadImage(file: File, folder?: string): Promise<MediaUploadResponse> {
    return this.uploadMedia(file, folder);
  }

  async deleteImage(publicId: string): Promise<void> {
    return this.deleteMedia(publicId);
  }

  extractPublicIdFromImageUrl(imageUrl: string): string {
    return this.extractPublicId(imageUrl);
  }

  /**
   * Convert publicIds to mediaIds for saving to database
   */
  async convertPublicIdsToMediaIds(publicIds: string[]): Promise<number[]> {
    if (!publicIds || publicIds.length === 0) {
      console.log('No publicIds provided, returning empty array');
      return [];
    }

    console.log('Converting publicIds to mediaIds:', publicIds);

    try {
      const response = await apiClient.post('/api/media/management/convert-public-ids', {
        publicIds: publicIds
      }) as { data: any };
      
      const mediaIds = response.data.data || response.data || [];
      console.log('Successfully converted publicIds to mediaIds:', mediaIds);
      return mediaIds;
    } catch (error) {
      console.error('Error converting publicIds to mediaIds:', error);
      // For demo data, extract the number from demo/media-{id} format
      const demoIds = publicIds
        .map(publicId => {
          const match = publicId.match(/(hotels|rooms|amenities|room-types|airlines|airports|flights)\/media-(\d+)/);
          return match ? parseInt(match[2]) : null;
        })
        .filter((id): id is number => id !== null);
      
      console.log('Generated fallback demo IDs:', demoIds);
      return demoIds;
    }
  }
}

export const mediaService = new MediaService();
export default mediaService;