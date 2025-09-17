import { ImgHTMLAttributes } from 'react'
import logoPngUrl from '../login/assets/logo.png'

interface BookingSmartLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function BookingSmartLogo({ size = 'md', className = '', ...props }: BookingSmartLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-48 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className="flex justify-center items-center">
      <img 
        src={logoPngUrl}
        alt="BookingSmart Logo"
        className={`${sizeClasses[size]} ${className}`}
        {...props}
      />
    </div>
  )
}

export default BookingSmartLogo