'use client'

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && (
        <span className={cn("text-gray-600", textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  children: React.ReactNode
}

export function LoadingOverlay({ isLoading, text = "Đang tải...", children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
  [key: string]: any
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText, 
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  )
}

// Skeleton components for better loading states
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)} />
  )
}

export function SkeletonAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded-full", className)} />
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center space-y-4">
              <SkeletonAvatar className="h-20 w-20 mx-auto" />
              <div className="space-y-2">
                <SkeletonLine className="h-6 w-32 mx-auto" />
                <SkeletonLine className="h-4 w-48 mx-auto" />
              </div>
              <div className="flex justify-center space-x-2">
                <SkeletonLine className="h-5 w-16" />
                <SkeletonLine className="h-5 w-16" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div>
              <SkeletonLine className="h-8 w-64 mb-2" />
              <SkeletonLine className="h-4 w-96" />
            </div>
            
            <div className="space-y-6">
              <SkeletonCard className="h-64 w-full" />
              <SkeletonCard className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-16" />
          <SkeletonLine className="h-10 w-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-10 w-full" />
        </div>
      </div>
      
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-20" />
        <SkeletonLine className="h-20 w-full" />
      </div>
      
      <div className="flex justify-end space-x-2">
        <SkeletonLine className="h-10 w-16" />
        <SkeletonLine className="h-10 w-24" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <SkeletonAvatar className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-48" />
            <SkeletonLine className="h-3 w-64" />
          </div>
          <div className="flex space-x-2">
            <SkeletonLine className="h-6 w-16" />
            <SkeletonLine className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  )
}
