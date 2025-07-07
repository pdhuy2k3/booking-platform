"use client"

import { AuthClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">Không có quyền truy cập</CardTitle>
          <CardDescription className="text-red-700">Bạn không có quyền truy cập vào tài nguyên này</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Vui lòng liên hệ quản trị viên để được cấp quyền truy cập hoặc đăng nhập với tài khoản khác.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại Dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => AuthClient.logout()}
            >
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
