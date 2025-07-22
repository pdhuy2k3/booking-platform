import { getApiErrorMessage } from './api-errors'

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

export const createLoadingState = () => {
  return {
    loading: false,
    error: null as string | null,
    setLoading: (loading: boolean) => ({ loading, error: null }),
    setError: (error: string) => ({ loading: false, error }),
    setSuccess: () => ({ loading: false, error: null }),
  }
}

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

export const focusFirstError = (formRef: React.RefObject<HTMLFormElement>) => {
  if (!formRef.current) return
  
  const firstErrorField = formRef.current.querySelector('[aria-invalid="true"]') as HTMLElement
  if (firstErrorField) {
    firstErrorField.focus()
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}
