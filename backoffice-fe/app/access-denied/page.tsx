"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldX, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useAuth } from '@/hooks/use-auth';
export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Truy cập bị từ chối</CardTitle>
          <CardDescription className="text-red-700">
            Bạn không có đủ quyền để truy cập vào trang này
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">
              Mã lỗi: 403 - Forbidden
            </p>
          </div>
          <p className="text-gray-600">
            Tài khoản của bạn không có quyền truy cập vào tài nguyên này. 
            Vui lòng liên hệ quản trị viên hệ thống để được hỗ trợ.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent border-red-300 text-red-700 hover:bg-red-50"
              onClick={() => (useAuth().logout())}
            >
              Đăng xuất và đăng nhập lại
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
