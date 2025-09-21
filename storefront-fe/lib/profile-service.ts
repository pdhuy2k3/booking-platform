import { apiClient } from '@/lib/api-client';
import { 
  ProfileUpdateRequestSchema, 
  PasswordUpdateRequestSchema, 
  PictureUpdateRequestSchema,
  AttributeUpdateRequestSchema,
  SingleAttributeUpdateRequestSchema,
  type ProfileUpdateRequest,
  type PasswordUpdateRequest,
  type PictureUpdateRequest,
  type AttributeUpdateRequest,
  type SingleAttributeUpdateRequest
} from './validation-schemas';
import { z } from 'zod';

export class ProfileService {
  static async updateProfile(profileData: ProfileUpdateRequest): Promise<void> {
    try {
      const validatedData = ProfileUpdateRequestSchema.parse(profileData);
      await apiClient.put("/customers/storefront/profile", validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  static async updatePassword(passwordData: PasswordUpdateRequest): Promise<void> {
    try {
      const validatedData = PasswordUpdateRequestSchema.parse(passwordData);
      await apiClient.put("/customers/storefront/profile/password", validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Password update failed:', error);
      throw error;
    }
  }

  static async updatePicture(pictureData: PictureUpdateRequest): Promise<void> {
    try {
      const validatedData = PictureUpdateRequestSchema.parse(pictureData);
      await apiClient.put("/customers/storefront/profile/picture", validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Picture update failed:', error);
      throw error;
    }
  }

  static async updateAttributes(attributes: Record<string, string | string[]>): Promise<void> {
    try {
      const validatedData = AttributeUpdateRequestSchema.parse({ attributes });
      await apiClient.put("/customers/storefront/profile/attributes", validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Attributes update failed:', error);
      throw error;
    }
  }

  static async updateSingleAttribute(name: string, value: string | string[]): Promise<void> {
    try {
      const validatedData = SingleAttributeUpdateRequestSchema.parse({ value });
      await apiClient.put(`/customers/storefront/profile/attributes/${name}`, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Single attribute update failed:', error);
      throw error;
    }
  }
}
