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
