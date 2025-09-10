"use client"

import { ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"

interface Column<T> {
  key: keyof T | string
  title: string
  render?: (value: any, item: T) => ReactNode
  className?: string
}

interface AdminTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  emptyMessage?: string
  keyField?: keyof T
  minWidth?: string
}

export function AdminTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
  emptyMessage = "Không có dữ liệu",
  keyField = 'id' as keyof T,
  minWidth = "800px"
}: AdminTableProps<T>) {
  const getValue = (item: T, key: string): any => {
    if (key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item)
    }
    return item[key as keyof T]
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table className={`min-w-[${minWidth}]`}>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.title}
              </TableHead>
            ))}
            {(onEdit || onDelete) && <TableHead className="w-[100px]">Thao tác</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={String(item[keyField])}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex} className={column.className}>
                    {column.render 
                      ? column.render(getValue(item, column.key as string), item)
                      : getValue(item, column.key as string)
                    }
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Helper functions for common renderers
export const renderBadge = (value: boolean, trueText: string = "Hoạt động", falseText: string = "Không hoạt động") => {
  return value ? (
    <Badge className="bg-green-100 text-green-800">{trueText}</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-800">{falseText}</Badge>
  )
}

export const renderDate = (dateString: string) => {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("vi-VN")
}

export const renderImage = (imageUrl: string, alt: string = "", fallbackText?: string) => {
  if (!imageUrl) {
    return fallbackText ? (
      <div className="bg-gray-200 border-2 border-dashed rounded-md w-8 h-8 flex items-center justify-center text-xs">
        {fallbackText}
      </div>
    ) : (
      <div className="bg-gray-200 border-2 border-dashed rounded-md w-8 h-8" />
    )
  }
  
  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className="w-8 h-8 object-cover rounded-md"
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3C/svg%3E"
      }}
    />
  )
}
