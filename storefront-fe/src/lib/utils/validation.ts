import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Please enter a valid email address");

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

// Travel-specific validation schemas
export const passengerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  passportNumber: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
});

export const searchFormSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  passengers: z.object({
    adults: z.number().min(1, "At least 1 adult is required").max(9),
    children: z.number().min(0).max(9),
    infants: z.number().min(0).max(9),
  }),
  tripType: z.enum(["one-way", "round-trip"]),
  class: z.enum(["economy", "premium-economy", "business", "first"]),
});

export const contactInfoSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const billingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

// Utility functions
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePhone(phone: string): boolean {
  return phoneSchema.safeParse(phone).success;
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}
