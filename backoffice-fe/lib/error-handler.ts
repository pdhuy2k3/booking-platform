/**
 * Error handling utilities for the BookingSmart backoffice application
 */

export interface ErrorInfo {
  statusCode: number
  message?: string
  details?: string
}

/**
 * Redirect to appropriate error page based on status code
 */
export function redirectToErrorPage(error: ErrorInfo) {
  const { statusCode, message } = error
  
  // Build query parameters
  const params = new URLSearchParams({
    code: statusCode.toString()
  })
  
  if (message) {
    params.append('message', message)
  }
  
  // Determine which error page to redirect to
  let errorPath = '/error'
  
  switch (statusCode) {
    case 401:
      errorPath = '/unauthorized'
      break
    case 403:
      errorPath = '/access-denied'
      break
    case 404:
      errorPath = '/not-found'
      break
    case 500:
    case 502:
    case 503:
    case 504:
    default:
      errorPath = '/error'
      break
  }
  
  // Redirect with parameters
  window.location.href = `${errorPath}?${params.toString()}`
}

/**
 * Handle API errors and redirect appropriately
 */
export function handleApiError(error: any) {
  console.error('API Error:', error)
  
  let statusCode = 500
  let message = 'Đã xảy ra lỗi không xác định'
  
  if (error?.response?.status) {
    statusCode = error.response.status
    message = error.response.data?.message || getDefaultErrorMessage(statusCode)
  } else if (error?.code === 'NETWORK_ERROR') {
    statusCode = 503
    message = 'Không thể kết nối đến máy chủ'
  }
  
  redirectToErrorPage({ statusCode, message })
}

/**
 * Get default error message for status code
 */
function getDefaultErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Yêu cầu không hợp lệ'
    case 401:
      return 'Phiên đăng nhập đã hết hạn'
    case 403:
      return 'Không có quyền truy cập'
    case 404:
      return 'Tài nguyên không tìm thấy'
    case 500:
      return 'Lỗi máy chủ nội bộ'
    case 502:
      return 'Lỗi cổng kết nối'
    case 503:
      return 'Dịch vụ không khả dụng'
    case 504:
      return 'Hết thời gian chờ kết nối'
    default:
      return 'Đã xảy ra lỗi không xác định'
  }
}

/**
 * Check if current user has required role
 */
export function checkUserRole(requiredRole: string, userRoles: string[]): boolean {
  return userRoles.some(role => 
    role === requiredRole || 
    role === 'ADMIN' || 
    role === 'SUPER_ADMIN'
  )
}

/**
 * Handle authorization errors
 */
export function handleUnauthorized() {
  redirectToErrorPage({
    statusCode: 401,
    message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
  })
}

/**
 * Handle access denied errors
 */
export function handleAccessDenied() {
  redirectToErrorPage({
    statusCode: 403,
    message: 'Bạn không có quyền truy cập vào tài nguyên này.'
  })
}
