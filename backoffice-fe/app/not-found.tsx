"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, ArrowLeft, Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-blue-900">
            404
          </CardTitle>
          <CardDescription className="text-blue-700 text-lg">
            Trang không tìm thấy
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              💡 <strong>Gợi ý:</strong> Kiểm tra lại URL hoặc sử dụng menu điều hướng 
              để tìm trang bạn cần.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/admin">
                <Home className="w-4 h-4 mr-2" />
                Về Dashboard
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/search">
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Các trang phổ biến:
            </h3>
            <div className="space-y-1">
              <Link 
                href="/admin/bookings" 
                className="block text-sm text-blue-600 hover:underline"
              >
                📅 Quản lý đặt phòng
              </Link>
              <Link 
                href="/admin/customers" 
                className="block text-sm text-blue-600 hover:underline"
              >
                👥 Quản lý khách hàng
              </Link>
              <Link 
                href="/admin/hotels" 
                className="block text-sm text-blue-600 hover:underline"
              >
                🏨 Quản lý khách sạn
              </Link>
              <Link 
                href="/admin/reports" 
                className="block text-sm text-blue-600 hover:underline"
              >
                📊 Báo cáo
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
