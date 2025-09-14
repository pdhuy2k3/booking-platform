// Placeholder media service. Wire to media-service when endpoints are confirmed.

export const mediaService = {
  // Example: generate a CDN or proxy URL for a media ID
  url(id: string) {
    return `/api/media/${encodeURIComponent(id)}`
  },
}

