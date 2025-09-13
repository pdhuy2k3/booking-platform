"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"

interface AdminPageLayoutProps {
  title: string
  description: string
  children: ReactNode
  onAddClick?: () => void
  addButtonText?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  stats?: Array<{
    title: string
    value: number | string
    description: string
    icon: ReactNode
  }>
  filters?: ReactNode
}

export function AdminPageLayout({
  title,
  description,
  children,
  onAddClick,
  addButtonText = "Thêm mới",
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Tìm kiếm...",
  stats = [],
  filters
}: AdminPageLayoutProps) {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">{description}</p>
        </div>
        {onAddClick && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
            onClick={onAddClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            {addButtonText}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách {title.toLowerCase()}</CardTitle>
              <CardDescription className="text-sm">
                Quản lý tất cả {title.toLowerCase()} trong hệ thống
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {onSearchChange && (
                <div className="relative w-full lg:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              {filters}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
