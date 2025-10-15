import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreamingIndicatorProps {
    className?: string
    show?: boolean
    text?: string
}

/**
 * Shows a subtle indicator when content is streaming
 */
export function StreamingIndicator({
                                       className,
                                       show = true,
                                       text = 'Đang xử lý...'
                                   }: StreamingIndicatorProps) {
    if (!show) return null

    return (
        <div className={cn('flex items-center gap-2 text-sm text-gray-500', className)}>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="streaming-indicator font-medium">{text}</span>
        </div>
    )
}

interface TypingIndicatorProps {
    className?: string
}

/**
 * Shows animated dots for typing effect
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    )
}

interface StreamingMessageWrapperProps {
    children: React.ReactNode
    isStreaming: boolean
    className?: string
}

/**
 * Wraps message content and adds streaming visual effects
 */
export function StreamingMessageWrapper({
                                            children,
                                            isStreaming,
                                            className
                                        }: StreamingMessageWrapperProps) {
    return (
        <div className={cn('relative', className)}>
            {children}
            {isStreaming && (
                <span className="inline-block w-0.5 h-5 ml-1 bg-blue-500 animate-pulse align-middle" />
            )}
        </div>
    )
}

interface ProgressiveLoadingProps {
    items: any[]
    isLoading: boolean
    renderItem: (item: any, index: number) => React.ReactNode
    loadingComponent?: React.ReactNode
    className?: string
    staggerDelay?: number
}

/**
 * Renders items progressively with staggered animation
 */
export function ProgressiveLoading({
                                       items,
                                       isLoading,
                                       renderItem,
                                       loadingComponent,
                                       className,
                                       staggerDelay = 100
                                   }: ProgressiveLoadingProps) {
    return (
        <div className={className}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="card-fade-in"
                    style={{
                        animationDelay: `${index * staggerDelay}ms`,
                        opacity: 0,
                        animationFillMode: 'forwards'
                    }}
                >
                    {renderItem(item, index)}
                </div>
            ))}
            {isLoading && loadingComponent}
        </div>
    )
}

interface StreamingTextProps {
    text: string
    isComplete: boolean
    className?: string
    showCursor?: boolean
}

/**
 * Renders text with streaming effect
 */
export function StreamingText({
                                  text,
                                  isComplete,
                                  className,
                                  showCursor = true
                              }: StreamingTextProps) {
    return (
        <div className={cn('whitespace-pre-wrap', className)}>
            {text}
            {!isComplete && showCursor && (
                <span className="inline-block w-0.5 h-4 ml-1 bg-blue-500 animate-pulse" />
            )}
        </div>
    )
}

/**
 * Skeleton loader for cards during streaming
 */
export function CardSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('bg-white border border-gray-200 rounded-lg p-4 shadow-sm', className)}>
            <div className="skeleton-loading h-40 w-full rounded mb-4" />
            <div className="space-y-3">
                <div className="skeleton-loading h-4 w-3/4 rounded" />
                <div className="skeleton-loading h-4 w-1/2 rounded" />
                <div className="skeleton-loading h-4 w-2/3 rounded" />
            </div>
        </div>
    )
}

/**
 * Loading state for entire result section
 */
export function ResultsSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            <div className="skeleton-loading h-6 w-48 rounded mb-3" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}