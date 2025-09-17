import { apiClient } from '@/lib/api-client';
import { MediaUploadResponse, MediaUploadRequest } from '../type';

export const mediaService = {
  async uploadImage(file: File, folder?: string): Promise<MediaUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await apiClient.post<{ success: boolean; data: MediaUploadResponse; message?: string }>(
        '/media/management/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.success) {
        throw new Error(response.message || 'Upload failed');
      }

      return response.data;
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  },

  async deleteImage(publicId: string): Promise<void> {
    try {
      await apiClient.delete(`/media/upload/${publicId}`);
    } catch (error) {
      console.error('Media deletion failed:', error);
      throw error;
    }
  },

  getImageUrl(publicId: string, transformations?: string): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('Cloudinary cloud name not configured');
    }
    
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    const transformString = transformations ? `/${transformations}` : '';
    
    return `${baseUrl}${transformString}/${publicId}`;
  },

  getAvatarUrl(publicId: string): string {
    // Transform image to 200x200 circle for avatar
    return this.getImageUrl(publicId, 'w_200,h_200,c_fill,g_face,r_max');
  },

  // Legacy method for backward compatibility
  url(id: string) {
    return `/media/${encodeURIComponent(id)}`
  },
}

