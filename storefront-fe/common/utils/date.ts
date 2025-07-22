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
