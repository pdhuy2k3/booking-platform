"use client"

import { useEffect, useMemo, useState } from 'react'
import { useBooking } from '@/contexts/booking-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PaymentPage } from '@/modules/payment'
import { formatCurrency } from '@/lib/currency'
import { Loader2, CheckCircle2, AlertCircle, Clock3, CreditCard } from 'lucide-react'
import { useDateFormatter } from '@/hooks/use-date-formatter'

interface BookingPaymentStepProps {
  onPaymentSuccess: () => void
  onBack: () => void
  onCancel: () => void
}

const PENDING_STATUSES = new Set(['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'])
const PAYMENT_READY_STATUSES = new Set(['PENDING', 'PAYMENT_PENDING'])
const SUCCESS_STATUSES = new Set(['CONFIRMED', 'PAID'])
const FAILURE_STATUSES = new Set(['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'CANCELED', 'VALIDATION_FAILED', 'REJECTED'])

export function BookingPaymentStep({ onPaymentSuccess, onBack, onCancel }: BookingPaymentStepProps) {
  const { formatDateTime } = useDateFormatter()
  const {
    step,
    isLoading,
    bookingData,
    bookingResponse,
    bookingStatus,
    refreshBookingStatus,
  } = useBooking()
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const amount = bookingData.totalAmount || 0
  const currency = (bookingData.currency || 'VND').toUpperCase()
  const bookingId = bookingResponse?.bookingId

  const status = (bookingStatus?.status || bookingResponse?.status || (isLoading ? 'VALIDATION_PENDING' : 'UNKNOWN')).toUpperCase()
  const message = bookingStatus?.message || bookingResponse?.message || 'Đang xử lý đặt chỗ...'
  const lastUpdated = bookingStatus?.lastUpdated
  const estimatedCompletion = bookingStatus?.estimatedCompletion
  const reservationLockedAt = bookingStatus?.reservationLockedAt ?? bookingResponse?.reservationLockedAt
  const reservationExpiresAt = bookingStatus?.reservationExpiresAt ?? bookingResponse?.reservationExpiresAt

  useEffect(() => {
    if (!reservationExpiresAt) {
      return
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [reservationExpiresAt])

  const reservationCountdown = useMemo(() => {
    if (!reservationExpiresAt) return null
    const target = new Date(reservationExpiresAt).getTime()
    if (Number.isNaN(target)) return null
    const remaining = target - now
    if (remaining <= 0) {
      return { text: '00:00', expired: true }
    }
    const totalSeconds = Math.floor(remaining / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return {
      text: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      expired: false,
    }
  }, [reservationExpiresAt, now])

  const shouldShowCountdown = reservationCountdown !== null && PENDING_STATUSES.has(status)

  const statusMeta = useMemo(() => {
    if (SUCCESS_STATUSES.has(status)) {
      return {
        icon: CheckCircle2,
        tone: 'text-green-600',
        bg: 'bg-green-50 border-green-200',
        title: 'Đặt chỗ thành công',
        description: message || 'Đặt chỗ đã được xác nhận.',
      }
    }

    if (FAILURE_STATUSES.has(status)) {
      return {
        icon: AlertCircle,
        tone: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        title: 'Có lỗi với đơn đặt chỗ',
        description: message || 'Có sự cố khi xử lý đơn đặt chỗ của bạn.',
      }
    }

    if (PAYMENT_READY_STATUSES.has(status)) {
      return {
        icon: CreditCard,
        tone: 'text-amber-600',
        bg: 'bg-amber-50 border-amber-200',
        title: 'Sẵn sàng thanh toán',
        description: message || 'Đã giữ chỗ thành công, hãy tiến hành thanh toán.',
      }
    }

    if (status === 'VALIDATION_PENDING') {
      return {
        icon: Clock3,
        tone: 'text-blue-600',
        bg: 'bg-blue-50 border-blue-200',
        title: 'Đang kiểm tra',
        description: message || 'Đang kiểm tra tình trạng chỗ trống...',
      }
    }

    return {
      icon: Loader2,
      tone: 'text-muted-foreground',
      bg: 'bg-muted/40 border-muted',
      title: 'Đang xử lý',
      description: message || 'Đang xử lý đơn đặt chỗ của bạn...',
    }
  }, [message, status])

  const StatusIcon = statusMeta.icon

  useEffect(() => {
    if (step === 'payment' && SUCCESS_STATUSES.has(status)) {
      onPaymentSuccess()
    }
  }, [step, status, onPaymentSuccess])

  const handlePaymentSuccess = async () => {
    try {
      setPaymentError(null)
      await refreshBookingStatus()
      onPaymentSuccess()
    } catch (error) {
      console.error('Error refreshing booking status after payment:', error)
      setPaymentError('Payment succeeded but we could not update the booking status. Please refresh or contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
  }

  const isPaymentReady = PAYMENT_READY_STATUSES.has(status)
  const isFailure = FAILURE_STATUSES.has(status)
  const isSuccess = SUCCESS_STATUSES.has(status)

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>Hoàn tất thanh toán</CardTitle>
        <p className="text-sm text-muted-foreground">
          Chúng tôi đang hoàn tất đặt chỗ. Bạn có thể thanh toán ngay khi hệ thống giữ chỗ thành công.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${statusMeta.bg}`}>
          <StatusIcon className={`h-6 w-6 shrink-0 ${statusMeta.tone}`} />
          <div>
            <p className="font-medium">{statusMeta.title}</p>
            <p className="text-sm text-muted-foreground">{statusMeta.description}</p>
            {shouldShowCountdown && (
              <p
                className={`mt-2 flex items-center gap-2 text-xs ${reservationCountdown?.expired ? 'text-red-500' : 'text-amber-600'}`}
              >
                <Clock3 className="h-4 w-4" />
                {reservationCountdown?.expired
                  ? 'Giữ chỗ đã hết hạn'
                  : `Giữ chỗ sẽ hết hạn trong ${reservationCountdown.text}`}
              </p>
            )}
            {reservationExpiresAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Hết hạn lúc: {formatDateTime(reservationExpiresAt)}
              </p>
            )}
            {reservationLockedAt && (
              <p className="text-xs text-muted-foreground">
                Giữ chỗ từ: {formatDateTime(reservationLockedAt)}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="uppercase tracking-wide">
                {status}
              </Badge>
              {lastUpdated && <span>Updated: {formatDateTime(lastUpdated)}</span>}
              {estimatedCompletion && <span>ETA: {formatDateTime(estimatedCompletion)}</span>}
            </div>
          </div>
        </div>

        <Separator />

        {!bookingId && !isLoading && (
          <Alert variant="destructive">
            <AlertTitle>Thiếu thông tin đặt chỗ</AlertTitle>
            <AlertDescription>
              Không tìm thấy mã đặt chỗ cho yêu cầu này. Vui lòng quay lại bước trước và gửi lại đơn đặt chỗ.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Đang khởi tạo yêu cầu đặt chỗ...</span>
          </div>
        )}

        {paymentError && (
          <Alert variant="destructive">
            <AlertTitle>Thanh toán thất bại</AlertTitle>
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {isFailure && (
          <div className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm">
            <p className="font-medium text-destructive">
              {statusMeta.description || 'Không thể hoàn tất đơn đặt chỗ.'}
            </p>
            <p className="text-muted-foreground">
              Bạn có thể quay lại bước trước để kiểm tra hoặc bắt đầu lại quy trình.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={onBack}>
                Xem lại đơn đặt chỗ
              </Button>
              <Button variant="destructive" onClick={onCancel}>
                Bắt đầu lại
              </Button>
            </div>
          </div>
        )}

        {isSuccess && !isLoading && (
          <div className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-6 text-sm">
            <p className="font-medium text-green-700">
              Thanh toán thành công. Đang chuyển tới trang xác nhận...
            </p>
            <Button onClick={onPaymentSuccess}>Tiếp tục</Button>
          </div>
        )}

            {bookingId && !isLoading && isPaymentReady && !isSuccess && !isFailure && (
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-medium">Mã đặt chỗ</p>
                  <p className="text-muted-foreground">
                    {bookingResponse?.bookingReference || bookingId}
                  </p>
                  <p className="mt-3 font-medium">Số tiền cần thanh toán</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(amount, currency)}
                  </p>
                </div>

                {amount > 0 ? (
                  <PaymentPage
                    bookingId={bookingId}
                    sagaId={bookingResponse?.sagaId}
                    amount={amount}
                    currency={currency}
                    description={`Thanh toán đặt chỗ ${bookingResponse?.bookingReference || ''}`.trim()}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                onBack={onBack}
              />
            ) : (
              <div className="space-y-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                <p>Đơn đặt chỗ này không cần thanh toán.</p>
                <Button onClick={handlePaymentSuccess}>Tiếp tục</Button>
              </div>
            )}
          </div>
        )}

        {!isPaymentReady && !isSuccess && !isFailure && !isLoading && bookingId && PENDING_STATUSES.has(status) && (
          <div className="space-y-4 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            <p>
              Chúng tôi đang kiểm tra lại tình trạng chỗ trống cho đơn đặt chỗ. Quá trình này thường chỉ mất vài giây.
              Bạn sẽ có thể thanh toán ngay khi hệ thống giữ chỗ xong.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button variant="outline" onClick={onBack}>
            Quay lại bước xem lại
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Hủy đơn đặt chỗ
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingPaymentStep
