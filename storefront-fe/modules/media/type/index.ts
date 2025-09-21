export type MediaId = string

export interface MediaUploadResponse {
  id: number;
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  altText?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadRequest {
  file: File;
  folder?: string;
}

