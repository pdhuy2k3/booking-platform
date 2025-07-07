"use client"

import { AuthClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

interface ErrorDetails {
  [key: string]: {
    title: string
    description: string
    color: string
    bgColor: string
    suggestion: string
  }
}

const errorDetails: ErrorDetails = {
  "500": {
    title: "Lỗi máy chủ nội bộ",
    description: "Đã xảy ra lỗi không mong muốn trên máy chủ",
    color: "text-red-700",
    bgColor: "from-red-50 to-orange-50",
    suggestion: "Vui lòng thử lại sau vài phút hoặc liên hệ với bộ phận kỹ thuật."
  },
  "502": {
    title: "Lỗi cổng kết nối",
    description: "Máy chủ không thể kết nối đến dịch vụ backend",
    color: "text-orange-700",
    bgColor: "from-orange-50 to-yellow-50",
    suggestion: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."
  },
  "503": {
    title: "Dịch vụ không khả dụng",
    description: "Máy chủ tạm thời không thể xử lý yêu cầu",
    color: "text-yellow-700",
    bgColor: "from-yellow-50 to-amber-50",
    suggestion: "Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau."
  },
  "504": {
    title: "Hết thời gian chờ",
    description: "Máy chủ không nhận được phản hồi kịp thời",
    color: "text-purple-700",
    bgColor: "from-purple-50 to-pink-50",
    suggestion: "Kết nối mạng chậm hoặc máy chủ quá tải. Vui lòng thử lại."
  }
}

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const statusCode = searchParams.get("code") || "500"
  const customMessage = searchParams.get("message")
  
  const error = errorDetails[statusCode] || errorDetails["500"]

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/admin"
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${error.bgColor} flex items-center justify-center p-4`}>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className={`text-2xl font-bold ${error.color}`}>
            {error.title}
          </CardTitle>
          <CardDescription className={error.color}>
            {customMessage || error.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 text-sm font-medium">
              Mã lỗi: {statusCode}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              Thời gian: {new Date().toLocaleString("vi-VN")}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              💡 <strong>Gợi ý:</strong> {error.suggestion}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRefresh} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleGoBack}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={() => AuthClient.logout()}
            >
              Đăng xuất
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ:{" "}
              <a 
                href="mailto:support@bookingsmart.com" 
                className="text-blue-600 hover:underline"
              >
                support@bookingsmart.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ErrorPageContent />
    </Suspense>
  )
}
