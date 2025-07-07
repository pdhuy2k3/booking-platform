"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bug className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-900">
                Đã xảy ra lỗi không mong muốn
              </CardTitle>
              <CardDescription className="text-red-700">
                Ứng dụng gặp sự cố và không thể tiếp tục
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm font-medium">
                  Mã lỗi: GLOBAL_ERROR
                </p>
                <p className="text-red-600 text-xs mt-1">
                  {error.digest && `Digest: ${error.digest}`}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Thời gian: {new Date().toLocaleString("vi-VN")}
                </p>
              </div>

              {process.env.NODE_ENV === "development" && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
                  <p className="text-gray-800 text-sm font-medium mb-2">
                    Chi tiết lỗi (Development):
                  </p>
                  <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Gợi ý:</strong> Thử tải lại trang hoặc quay lại trang chủ. 
                  Nếu lỗi vẫn tiếp tục, vui lòng liên hệ bộ phận kỹ thuật.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={reset} 
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin">
                    <Home className="w-4 h-4 mr-2" />
                    Về Dashboard
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700"
                  onClick={() => (window.location.href = "/api/auth/logout")}
                >
                  Đăng xuất
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Báo cáo lỗi:{" "}
                  <a 
                    href="mailto:dev@bookingsmart.com" 
                    className="text-blue-600 hover:underline"
                  >
                    dev@bookingsmart.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
