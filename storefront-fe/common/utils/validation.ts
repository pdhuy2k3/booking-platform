import * as z from 'zod'

// Common validation patterns
export const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
export const passportRegex = /^[A-Z0-9]{6,9}$/
export const postalCodeRegex = /^[0-9]{5,6}$/

// Custom validation messages in Vietnamese
export const validationMessages = {
  required: 'Trường này không được để trống',
  email: 'Email không hợp lệ',
  phone: 'Số điện thoại không hợp lệ (VD: +84123456789)',
  passport: 'Số hộ chiếu không hợp lệ (6-9 ký tự, chỉ chữ và số)',
  postalCode: 'Mã bưu điện không hợp lệ (5-6 số)',
  minLength: (min: number) => `Tối thiểu ${min} ký tự`,
  maxLength: (max: number) => `Tối đa ${max} ký tự`,
  dateInPast: 'Ngày phải trong quá khứ',
  dateInFuture: 'Ngày phải trong tương lai',
  passwordMismatch: 'Mật khẩu xác nhận không khớp',
  fileSize: 'Kích thước file không được vượt quá 5MB',
  fileType: 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF)',
}

// Reusable validation schemas
export const emailSchema = z.string()
  .min(1, validationMessages.required)
  .email(validationMessages.email)

export const phoneSchema = z.string()
  .optional()
  .refine((val) => !val || phoneRegex.test(val), {
    message: validationMessages.phone,
  })

export const passportSchema = z.string()
  .optional()
  .refine((val) => !val || passportRegex.test(val), {
    message: validationMessages.passport,
  })

export const postalCodeSchema = z.string()
  .optional()
  .refine((val) => !val || postalCodeRegex.test(val), {
    message: validationMessages.postalCode,
  })

export const dateOfBirthSchema = z.string()
  .optional()
  .refine((val) => {
    if (!val) return true
    const date = new Date(val)
    const today = new Date()
    return date < today
  }, {
    message: validationMessages.dateInPast,
  })

export const passportExpirySchema = z.string()
  .optional()
  .refine((val) => {
    if (!val) return true
    const date = new Date(val)
    const today = new Date()
    return date > today
  }, {
    message: validationMessages.dateInFuture,
  })

export const passwordSchema = z.string()
  .min(8, validationMessages.minLength(8))
  .max(128, validationMessages.maxLength(128))
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 số')

// File validation utilities
export const validateImageFile = (file: File): string | null => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return validationMessages.fileType
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return validationMessages.fileSize
  }

  return null
}

export const validateDocumentFile = (file: File): string | null => {
  // Check file type (images and PDF)
  const allowedTypes = ['image/', 'application/pdf']
  const isValidType = allowedTypes.some(type => file.type.startsWith(type))
  
  if (!isValidType) {
    return 'Chỉ chấp nhận file ảnh hoặc PDF'
  }

  // Check file size (10MB for documents)
  if (file.size > 10 * 1024 * 1024) {
    return 'Kích thước file không được vượt quá 10MB'
  }

  return null
}
