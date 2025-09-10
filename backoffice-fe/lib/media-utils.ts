import { mediaService } from '@/services/media-service';

/**
 * Utility functions for handling media conversion between frontend and backend
 */

/**
 * Convert publicIds to mediaIds for saving to database
 * This is the reverse of convertMediaIdsToMediaDtos
 */
export async function convertPublicIdsToMediaIds(publicIds: string[]): Promise<number[]> {
  if (!publicIds || publicIds.length === 0) {
    return [];
  }

  try {
    console.log('Converting publicIds to mediaIds:', publicIds);
    const mediaIds = await mediaService.convertPublicIdsToMediaIds(publicIds);
    console.log('Converted to mediaIds:', mediaIds);
    return mediaIds;
  } catch (error) {
    console.error('Error converting publicIds to mediaIds:', error);
    // Return empty array on error - better than crashing
    return [];
  }
}

/**
 * Convert mediaIds to publicIds for display in MediaSelector
 */
export async function convertMediaIdsToPublicIds(mediaIds: number[]): Promise<string[]> {
  if (!mediaIds || mediaIds.length === 0) {
    return [];
  }

  try {
    console.log('Converting mediaIds to publicIds:', mediaIds);
    const mediaDtos = await mediaService.convertMediaIdsToMediaDtos(mediaIds);
    const publicIds = mediaDtos.map(dto => dto.publicId);
    console.log('Converted to publicIds:', publicIds);
    return publicIds;
  } catch (error) {
    console.error('Error converting mediaIds to publicIds:', error);
    // Return demo publicIds as fallback
    return mediaIds.map(id => `demo/media-${id}`);
  }
}

/**
 * Extract primary image publicId from a list of selected publicIds
 */
export function extractPrimaryImage(publicIds: string[], primaryImage: string | null): {
  mediaPublicIds: string[];
  primaryImagePublicId: string | null;
} {
  return {
    mediaPublicIds: publicIds,
    primaryImagePublicId: primaryImage && publicIds.includes(primaryImage) ? primaryImage : null
  };
}

/**
 * Format media data for form submission
 * Converts publicIds to mediaIds and handles primary image
 */
export async function formatMediaForSubmission(
  publicIds: string[], 
  primaryImage: string | null
): Promise<{
  mediaIds: number[];
  primaryImageId: number | null;
}> {
  if (!publicIds || publicIds.length === 0) {
    return {
      mediaIds: [],
      primaryImageId: null
    };
  }

  try {
    // Convert all publicIds to mediaIds
    const allMediaIds = await convertPublicIdsToMediaIds(publicIds);
    
    // Find primary image mediaId
    let primaryImageId: number | null = null;
    if (primaryImage && publicIds.includes(primaryImage)) {
      const primaryIndex = publicIds.indexOf(primaryImage);
      primaryImageId = allMediaIds[primaryIndex] || null;
    }

    return {
      mediaIds: allMediaIds,
      primaryImageId
    };
  } catch (error) {
    console.error('Error formatting media for submission:', error);
    return {
      mediaIds: [],
      primaryImageId: null
    };
  }
}

/**
 * Format media data for form loading
 * Converts mediaIds to publicIds for MediaSelector
 */
export async function formatMediaForDisplay(
  mediaIds: number[], 
  primaryImageId: number | null
): Promise<{
  publicIds: string[];
  primaryImage: string | null;
}> {
  if (!mediaIds || mediaIds.length === 0) {
    return {
      publicIds: [],
      primaryImage: null
    };
  }

  try {
    // Convert all mediaIds to publicIds
    const allPublicIds = await convertMediaIdsToPublicIds(mediaIds);
    
    // Find primary image publicId
    let primaryImage: string | null = null;
    if (primaryImageId) {
      const primaryIndex = mediaIds.indexOf(primaryImageId);
      primaryImage = allPublicIds[primaryIndex] || null;
    }

    return {
      publicIds: allPublicIds,
      primaryImage
    };
  } catch (error) {
    console.error('Error formatting media for display:', error);
    return {
      publicIds: [],
      primaryImage: null
    };
  }
}
