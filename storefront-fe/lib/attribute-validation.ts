import { z } from 'zod';
import { UserPreferencesSchema, UserAddressSchema } from './validation-schemas';

// Create individual field schemas for validation
const FieldSchemas = {
  // Basic Info
  'firstName': z.string().min(1, 'First name is required').max(255, 'First name must be no more than 255 characters'),
  'lastName': z.string().min(1, 'Last name is required').max(255, 'Last name must be no more than 255 characters'),
  'email': z.string().email('Must be a valid email address').max(255, 'Email must be no more than 255 characters'),
  'phone': z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Must be a valid phone number with country code').optional().or(z.literal('')),
  'dateOfBirth': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format').optional().or(z.literal('')),

  // Preferences
  'language': z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Must be a valid language code (e.g., "en", "en-US")').optional().or(z.literal('')),
  'currency': z.string().regex(/^[A-Z]{3}$/, 'Must be a valid 3-letter currency code').optional().or(z.literal('')),
  'theme': z.enum(['light', 'dark', 'auto']).optional().or(z.literal('')),
  'density': z.enum(['compact', 'comfortable', 'spacious']).optional().or(z.literal('')),
  'notifications': z.enum(['email', 'sms', 'push', 'all', 'none']).optional().or(z.literal('')),

  // Address
  'street': z.string().min(5, 'Street address must be at least 5 characters').max(200, 'Street address must be no more than 200 characters').optional().or(z.literal('')),
  'city': z.string().min(2, 'City must be at least 2 characters').max(50, 'City must be no more than 50 characters').optional().or(z.literal('')),
  'state': z.string().min(2, 'State must be at least 2 characters').max(50, 'State must be no more than 50 characters').optional().or(z.literal('')),
  'country': z.string().min(2, 'Country must be at least 2 characters').max(50, 'Country must be no more than 50 characters').optional().or(z.literal('')),
  'postalCode': z.string().min(3, 'Postal code must be at least 3 characters').max(20, 'Postal code must be no more than 20 characters').optional().or(z.literal('')),
} as const;

export class AttributeValidator {
  static validateField(fieldName: string, value: string): string | null {
    const schema = FieldSchemas[fieldName as keyof typeof FieldSchemas];
    
    if (!schema) {
      return null; // No validation schema for this field
    }

    try {
      schema.parse(value);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || `${fieldName} is invalid`;
      }
      return `${fieldName} is invalid`;
    }
  }

  static validatePreferences(preferences: Partial<Record<string, string>>): string | null {
    try {
      UserPreferencesSchema.parse(preferences);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Preferences validation failed';
      }
      return 'Preferences validation failed';
    }
  }

  static validateAddress(address: Partial<Record<string, string>>): string | null {
    try {
      UserAddressSchema.parse(address);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message || 'Address validation failed';
      }
      return 'Address validation failed';
    }
  }
}
