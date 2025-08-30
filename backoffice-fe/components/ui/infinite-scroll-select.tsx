"use client"

import * as React from "react"
import { ChevronDown, Search, Loader2 } from "lucide-react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const InfiniteScrollSelect = SelectPrimitive.Root

const InfiniteScrollSelectGroup = SelectPrimitive.Group

const InfiniteScrollSelectValue = SelectPrimitive.Value

interface InfiniteScrollSelectTriggerProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {}

const InfiniteScrollSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  InfiniteScrollSelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
InfiniteScrollSelectTrigger.displayName = SelectPrimitive.Trigger.displayName

interface InfiniteScrollSelectContentProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  searchValue?: string
}

const InfiniteScrollSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  InfiniteScrollSelectContentProps
>(({ className, children, position = "popper", searchPlaceholder, onSearchChange, onLoadMore, hasMore, loading, searchValue, ...props }, ref) => {
  const [searchTerm, setSearchTerm] = React.useState(searchValue || "")
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const loadingRef = React.useRef<HTMLDivElement>(null)

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  // Handle scroll to load more
  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    
    // Load more when user scrolls near the bottom (within 100px)
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  // Intersection Observer for loading trigger
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading && onLoadMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        {/* Search Input */}
        {onSearchChange && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder || "Tìm kiếm..."}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>
        )}

        <SelectPrimitive.Viewport className="p-1">
          <ScrollArea 
            className="h-[200px] w-full" 
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
          >
            {children}
            
            {/* Loading indicator */}
            {(hasMore || loading) && (
              <div 
                ref={loadingRef}
                className="flex items-center justify-center py-2"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Đang tải...</span>
                  </div>
                ) : hasMore ? (
                  <span className="text-sm text-muted-foreground">Cuộn để tải thêm</span>
                ) : null}
              </div>
            )}
          </ScrollArea>
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
InfiniteScrollSelectContent.displayName = SelectPrimitive.Content.displayName

const InfiniteScrollSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
InfiniteScrollSelectLabel.displayName = SelectPrimitive.Label.displayName

const InfiniteScrollSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <div className="h-2 w-2 rounded-full bg-current" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
InfiniteScrollSelectItem.displayName = SelectPrimitive.Item.displayName

const InfiniteScrollSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
InfiniteScrollSelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  InfiniteScrollSelect,
  InfiniteScrollSelectGroup,
  InfiniteScrollSelectValue,
  InfiniteScrollSelectTrigger,
  InfiniteScrollSelectContent,
  InfiniteScrollSelectLabel,
  InfiniteScrollSelectItem,
  InfiniteScrollSelectSeparator,
}
