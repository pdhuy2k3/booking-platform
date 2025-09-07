import { apiClient } from '@/lib/api-client';

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

    const response = await apiClient.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }) as { data: any };

    // Extract data from media service response
    const data = response.data.data || response.data;
    
    return {
      mediaUrl: `/api/media/${data.public_id || data.publicId}`,
      publicId: data.public_id || data.publicId,
      secureUrl: data.secure_url || data.secureUrl || data.url,
      mediaType: data.resource_type || data.resourceType || 'image',
      message: data.message || 'Media uploaded successfully'
    };
  }

  /**
   * Get media by folder (for folder-filtered browsing)
   */
  async getMediaByFolder(folder: string, page = 1, limit = 20): Promise<{ items: SimpleMediaItem[], total: number }> {
    const response = await apiClient.get('/api/media/browse', {
      params: { folder, page, limit }
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
      total: data.total_count || 0
    };
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
    const response = await apiClient.get('/api/media/browse', {
      params: {
        folder: folder || undefined,
        search: search || undefined,
        page,
        limit
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
      totalPages: data.totalPages || 1
    };
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
   * Get available folders
   */
  async getFolders(): Promise<string[]> {
    try {
      const response = await apiClient.get('/api/media/folders') as { data: any };
      const data = response.data.data || response.data;
      return data.folders?.map((folder: any) => folder.name) || [];
    } catch (error) {
      console.error('Error getting folders:', error);
      // Return default folders for development
      return ['hotels', 'rooms', 'amenities', 'airlines', 'airports', 'flights', 'general'];
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
}

export const mediaService = new MediaService();
export default mediaService;