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

// Form validation helpers
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  const fieldPath = fieldName.split('.')
  let error = errors
  
  for (const path of fieldPath) {
    error = error?.[path]
  }
  
  return error?.message
}

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!getFieldError(errors, fieldName)
}

// Date formatting utilities
export const formatDate = (dateString: string, locale: string = 'vi-VN'): string => {
  try {
    return new Date(dateString).toLocaleDateString(locale)
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString: string, locale: string = 'vi-VN'): string => {
  try {
    return new Date(dateString).toLocaleString(locale)
  } catch {
    return dateString
  }
}

// API error handling utilities
export const getApiErrorMessage = (error: any): string => {
  // Handle different error formats
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error?.message) {
    return error.message
  }
  
  // Default error messages based on status code
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      case 403:
        return 'Bạn không có quyền thực hiện hành động này.'
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.'
      case 409:
        return 'Dữ liệu đã tồn tại hoặc xung đột.'
      case 422:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
      case 500:
        return 'Lỗi hệ thống. Vui lòng thử lại sau.'
      case 502:
      case 503:
      case 504:
        return 'Hệ thống đang bảo trì. Vui lòng thử lại sau.'
      default:
        return 'Có lỗi xảy ra. Vui lòng thử lại.'
    }
  }
  
  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}

// Loading state utilities
export const createLoadingState = () => {
  return {
    loading: false,
    error: null as string | null,
    setLoading: (loading: boolean) => ({ loading, error: null }),
    setError: (error: string) => ({ loading: false, error }),
    setSuccess: () => ({ loading: false, error: null }),
  }
}

// Form submission wrapper with error handling
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  onSuccess?: (result: T) => void,
  onError?: (error: string) => void
): Promise<T | null> => {
  try {
    const result = await asyncFn()
    onSuccess?.(result)
    return result
  } catch (error) {
    const errorMessage = getApiErrorMessage(error)
    onError?.(errorMessage)
    return null
  }
}

// Debounce utility for search/validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Local storage utilities with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },
}

// Form field focus utilities
export const focusFirstError = (formRef: React.RefObject<HTMLFormElement>) => {
  if (!formRef.current) return
  
  const firstErrorField = formRef.current.querySelector('[aria-invalid="true"]') as HTMLElement
  if (firstErrorField) {
    firstErrorField.focus()
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
