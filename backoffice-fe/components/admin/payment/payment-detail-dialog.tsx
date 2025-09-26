"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreditCard, User, Calendar, ExternalLink, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { PaymentService } from "@/services/payment-service"
import type { Payment, PaymentTransaction, PaymentSagaLog } from "@/types/api"
import { toast } from "@/hooks/use-toast"

interface PaymentDetailDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentDetailDialog({ payment, open, onOpenChange }: PaymentDetailDialogProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [sagaLogs, setSagaLogs] = useState<PaymentSagaLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (payment && open) {
      loadPaymentDetails()
    }
  }, [payment, open])

  const loadPaymentDetails = async () => {
    if (!payment) return

    try {
      setLoading(true)
      const [transactionsData, sagaLogsData] = await Promise.all([
        PaymentService.getPaymentTransactions(payment.paymentId),
        PaymentService.getPaymentSagaLogs(payment.paymentId)
      ])
      
      setTransactions(transactionsData)
      setSagaLogs(sagaLogsData)
    } catch (error) {
      console.error("Failed to load payment details:", error)
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!payment) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Thành công</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>
      case "FAILED":
      case "DECLINED":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Thất bại</Badge>
      case "CANCELLED":
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>
      case "REFUND_COMPLETED":
        return <Badge className="bg-purple-100 text-purple-800">Đã hoàn tiền</Badge>
      case "REFUND_PENDING":
        return <Badge className="bg-orange-100 text-orange-800">Chờ hoàn tiền</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "STRIPE":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Stripe</Badge>
      case "VIETQR":
        return <Badge variant="outline" className="text-green-600 border-green-200">VietQR</Badge>
      case "MOMO":
        return <Badge variant="outline" className="text-pink-600 border-pink-200">MoMo</Badge>
      case "ZALOPAY":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">ZaloPay</Badge>
      case "VNPAY":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">VNPay</Badge>
      case "MANUAL":
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Thủ công</Badge>
      default:
        return <Badge variant="outline">{provider}</Badge>
    }
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "PAYMENT":
        return <Badge variant="outline" className="text-green-600">Thanh toán</Badge>
      case "REFUND":
        return <Badge variant="outline" className="text-orange-600">Hoàn tiền</Badge>
      case "CHARGEBACK":
        return <Badge variant="outline" className="text-red-600">Chargeback</Badge>
      case "COMPENSATION":
        return <Badge variant="outline" className="text-purple-600">Bồi thường</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Chi tiết giao dịch #{payment.paymentReference}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về giao dịch thanh toán và lịch sử xử lý
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="transactions">Giao dịch ({transactions.length})</TabsTrigger>
            <TabsTrigger value="saga">Saga Logs ({sagaLogs.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[600px] mt-4">
            <TabsContent value="overview" className="space-y-6">
              {/* Status and Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getStatusBadge(payment.status)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nhà cung cấp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getProviderBadge(payment.provider)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Phương thức</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline">{payment.methodType}</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Thông tin thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Số tiền</div>
                      <div className="text-2xl font-bold">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-muted-foreground">{payment.currency}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Booking ID</div>
                      <div className="text-sm text-muted-foreground font-mono">{payment.bookingId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Mã thanh toán</div>
                      <div className="text-sm text-muted-foreground font-mono">{payment.paymentReference}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Gateway Transaction ID</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {payment.gatewayTransactionId || "N/A"}
                        {payment.gatewayTransactionId && (
                          <Button variant="ghost" size="sm" className="ml-2 h-6 w-6 p-0">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {payment.description && (
                    <div>
                      <div className="text-sm font-medium">Mô tả</div>
                      <div className="text-sm text-muted-foreground">{payment.description}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Saga Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Thông tin Saga
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Saga ID</div>
                      <div className="text-sm text-muted-foreground font-mono">{payment.sagaId}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Saga Step</div>
                      <div className="text-sm text-muted-foreground">{payment.sagaStep || "N/A"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin người dùng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">User ID</div>
                      <div className="text-sm text-muted-foreground">{payment.userId}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Customer ID</div>
                      <div className="text-sm text-muted-foreground">{payment.customerId || "N/A"}</div>
                    </div>
                  </div>

                  {payment.ipAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">IP Address</div>
                        <div className="text-sm text-muted-foreground font-mono">{payment.ipAddress}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">User Agent</div>
                        <div className="text-sm text-muted-foreground truncate" title={payment.userAgent}>
                          {payment.userAgent || "N/A"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thông tin thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Ngày tạo</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.createdAt * 1000).toLocaleString("vi-VN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Cập nhật lần cuối</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(payment.updatedAt * 1000).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Người tạo</div>
                      <div className="text-sm text-muted-foreground">{payment.createdBy}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Người cập nhật</div>
                      <div className="text-sm text-muted-foreground">{payment.updatedBy}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gateway Response */}
              {payment.gatewayResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle>Gateway Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-x-auto">
                      {JSON.stringify(JSON.parse(payment.gatewayResponse), null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có giao dịch nào
                </div>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.transactionId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {transaction.transactionReference}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getTransactionTypeBadge(transaction.transactionType)}
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Số tiền</div>
                          <div className="text-muted-foreground">
                            {formatCurrency(transaction.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Nhà cung cấp</div>
                          <div className="text-muted-foreground">{transaction.provider}</div>
                        </div>
                        <div>
                          <div className="font-medium">Ngày tạo</div>
                          <div className="text-muted-foreground">
                            {new Date(transaction.createdAt * 1000).toLocaleString("vi-VN")}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Gateway ID</div>
                          <div className="text-muted-foreground font-mono text-xs">
                            {transaction.gatewayTransactionId || "N/A"}
                          </div>
                        </div>
                      </div>

                      {transaction.description && (
                        <div className="text-sm">
                          <div className="font-medium">Mô tả</div>
                          <div className="text-muted-foreground">{transaction.description}</div>
                        </div>
                      )}

                      {transaction.gatewayResponse && (
                        <details className="text-sm">
                          <summary className="font-medium cursor-pointer">Gateway Response</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(JSON.parse(transaction.gatewayResponse), null, 2)}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="saga" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : sagaLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không có saga logs
                </div>
              ) : (
                sagaLogs.map((log) => (
                  <Card key={log.logId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{log.step}</CardTitle>
                        <Badge variant={log.status === "SUCCESS" ? "default" : "destructive"}>
                          {log.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Retry Count</div>
                          <div className="text-muted-foreground">{log.retryCount}</div>
                        </div>
                        <div>
                          <div className="font-medium">Thời gian</div>
                          <div className="text-muted-foreground">
                            {new Date(log.createdAt * 1000).toLocaleString("vi-VN")}
                          </div>
                        </div>
                      </div>

                      {log.request && (
                        <details className="text-sm">
                          <summary className="font-medium cursor-pointer">Request</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.request), null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.response && (
                        <details className="text-sm">
                          <summary className="font-medium cursor-pointer">Response</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.response), null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.errorMessage && (
                        <div className="text-sm">
                          <div className="font-medium text-red-600">Error</div>
                          <div className="text-red-600 bg-red-50 p-2 rounded">{log.errorMessage}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}