import { apiClient } from '@/lib/api-client';
import { UserInfo } from './auth-client';
import { AttributeUpdateRequestSchema, SingleAttributeUpdateRequestSchema } from './validation-schemas';
import { z } from 'zod';

export interface UserAttribute {
  name: string;
  displayName: string;
  value: string | string[];
  type: 'text' | 'select' | 'date' | 'textarea';
  required: boolean;
  editable: boolean;
  options?: string[];
  hint?: string;
}

export class AttributeService {
  static async updateUserAttributes(attributes: Record<string, string | string[]>): Promise<void> {
    try {
      // Validate the request using Zod
      const validatedRequest = AttributeUpdateRequestSchema.parse({ attributes });
      await apiClient.put('/customers/storefront/profile/attributes', validatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Attribute update failed:', error);
      throw error;
    }
  }

  static async updateSingleAttribute(name: string, value: string | string[]): Promise<void> {
    try {
      // Validate the request using Zod
      const validatedRequest = SingleAttributeUpdateRequestSchema.parse({ value });
      await apiClient.put(`/customers/storefront/profile/attributes/${name}`, validatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      console.error('Single attribute update failed:', error);
      throw error;
    }
  }

  static getAttributeDefinitions(): UserAttribute[] {
    return [
      // Basic Info
      {
        name: 'firstName',
        displayName: 'First Name',
        value: '',
        type: 'text',
        required: true,
        editable: true
      },
      {
        name: 'lastName',
        displayName: 'Last Name',
        value: '',
        type: 'text',
        required: true,
        editable: true
      },
      {
        name: 'email',
        displayName: 'Email Address',
        value: '',
        type: 'text',
        required: true,
        editable: true
      },
      {
        name: 'phone',
        displayName: 'Phone Number',
        value: '',
        type: 'text',
        required: false,
        editable: true,
        hint: 'Enter your phone number with country code (e.g., +84123456789)'
      },
      {
        name: 'dateOfBirth',
        displayName: 'Date of Birth',
        value: '',
        type: 'date',
        required: false,
        editable: true,
        hint: 'Enter your date of birth (YYYY-MM-DD)'
      },

      // Preferences
      {
        name: 'language',
        displayName: 'Preferred Language',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'Select your preferred language for the interface',
        options: ['en', 'en-US', 'vi', 'vi-VN', 'fr', 'fr-FR', 'de', 'de-DE', 'es', 'es-ES', 'ja', 'ja-JP', 'ko', 'ko-KR', 'zh', 'zh-CN']
      },
      {
        name: 'currency',
        displayName: 'Preferred Currency',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'Select your preferred currency for pricing',
        options: ['USD', 'EUR', 'VND', 'GBP', 'JPY', 'CNY', 'KRW', 'THB', 'SGD', 'MYR', 'IDR', 'INR', 'AUD', 'CAD', 'CHF', 'NZD']
      },
      {
        name: 'theme',
        displayName: 'UI Theme',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'Choose your preferred interface theme',
        options: ['light', 'dark', 'auto']
      },
      {
        name: 'density',
        displayName: 'UI Density',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'Choose how dense you want the interface to be',
        options: ['compact', 'comfortable', 'spacious']
      },
      {
        name: 'notifications',
        displayName: 'Notification Preferences',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'How would you like to receive notifications?',
        options: ['email', 'sms', 'push', 'all', 'none']
      },

      // Address
      {
        name: 'address.street',
        displayName: 'Street Address',
        value: '',
        type: 'text',
        required: false,
        editable: true,
        hint: 'Enter your street address (e.g., 123 Main Street, Apt 4B)'
      },
      {
        name: 'address.city',
        displayName: 'City',
        value: '',
        type: 'text',
        required: false,
        editable: true,
        hint: 'Enter your city name'
      },
      {
        name: 'address.state',
        displayName: 'State/Province',
        value: '',
        type: 'text',
        required: false,
        editable: true,
        hint: 'Enter your state or province (optional)'
      },
      {
        name: 'address.country',
        displayName: 'Country',
        value: '',
        type: 'select',
        required: false,
        editable: true,
        hint: 'Select your country',
        options: [
          'Vietnam', 'United States', 'United Kingdom', 'Canada', 'Australia',
          'Germany', 'France', 'Japan', 'South Korea', 'China', 'Thailand',
          'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'India',
          'Brazil', 'Mexico', 'Argentina', 'Chile', 'Colombia', 'Peru',
          'South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Russia',
          'Ukraine', 'Poland', 'Czech Republic', 'Hungary', 'Romania',
          'Bulgaria', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium',
          'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
          'Ireland', 'New Zealand'
        ]
      },
      {
        name: 'address.postalCode',
        displayName: 'Postal Code',
        value: '',
        type: 'text',
        required: false,
        editable: true,
        hint: 'Enter your postal/zip code (optional)'
      }
    ];
  }

  static populateAttributesFromUser(user: UserInfo): UserAttribute[] {
    const definitions = this.getAttributeDefinitions();
    
    return definitions.map(def => ({
      ...def,
      value: this.getAttributeValue(user, def.name) || ''
    }));
  }

  private static getAttributeValue(user: UserInfo, attributeName: string): string | string[] | undefined {
    const parts = attributeName.split('.');
    
    if (parts.length === 1) {
      // Direct attribute
      return (user as any)[attributeName];
    } else if (parts.length === 2) {
      // Nested attribute (e.g., preferences.language)
      const [parent, child] = parts;
      return (user as any)[parent]?.[child];
    }
    
    return undefined;
  }

  // Validation is now handled by Zod schemas in validation-schemas.ts
  // This method is kept for backward compatibility but should not be used
  static validateAttribute(attribute: UserAttribute, value: string): string | null {
    if (attribute.required && (!value || value.trim() === '')) {
      return `${attribute.displayName} is required`;
    }
    return null; // All other validation is handled by Zod
  }
}