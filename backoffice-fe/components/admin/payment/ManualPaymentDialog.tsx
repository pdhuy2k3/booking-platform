'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { User, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PaymentService } from '@/services/payment-service'
import { BookingService } from '@/services/booking-service'
import { Booking, PaymentMethodType, PaymentProvider } from '@/types/api'

interface ManualPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookingId?: string
  onSuccess?: () => void
}

export function ManualPaymentDialog({
  open,
  onOpenChange,
  bookingId,
  onSuccess
}: ManualPaymentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    provider: '' as PaymentProvider,
    methodType: '' as PaymentMethodType,
    description: '',
    notes: ''
  })

  useEffect(() => {
    if (bookingId && open) {
      BookingService.getBooking(bookingId)
        .then(setBooking)
        .catch(console.error)
    }
  }, [bookingId, open])

  useEffect(() => {
    if (booking && open) {
      // Pre-fill amount with total amount (since we don't have paidAmount in the current Booking type)
      setFormData(prev => ({
        ...prev,
        amount: booking.totalAmount.toString()
      }))
    }
  }, [booking, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking) return

    setLoading(true)
    try {
      await PaymentService.processManualPayment({
        bookingId: booking.bookingId,
        amount: parseFloat(formData.amount),
        currency: booking.currency,
        description: formData.description || `Manual payment for booking ${booking.bookingReference}`,
        methodType: formData.methodType,
        provider: formData.provider,
        additionalData: {
          notes: formData.notes,
          processedBy: 'admin'
        }
      })

      toast.success('Manual payment processed successfully')
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        amount: '',
        provider: '' as PaymentProvider,
        methodType: '' as PaymentMethodType,
        description: '',
        notes: ''
      })
    } catch (error) {
      console.error('Failed to process manual payment:', error)
      toast.error('Failed to process manual payment')
    } finally {
      setLoading(false)
    }
  }

  const isValidAmount = parseFloat(formData.amount) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process Manual Payment</DialogTitle>
        </DialogHeader>

        {booking && (
          <div className="space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Booking Reference</Label>
                    <p className="font-medium">{booking.bookingReference}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <div>
                      <Badge variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'CANCELLED' ? 'destructive' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">User ID</Label>
                    <p className="font-medium">{booking.userId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Created Date</Label>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Amount</Label>
                    <p className="font-semibold text-lg">
                      {booking.currency} {booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Booking Type</Label>
                    <p className="font-medium">
                      <Badge variant="outline">{booking.bookingType}</Badge>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Payment Provider *</Label>
                  <Select 
                    value={formData.provider} 
                    onValueChange={(value: PaymentProvider) => setFormData(prev => ({ ...prev, provider: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                      <SelectItem value="VIETQR">VietQR</SelectItem>
                      <SelectItem value="MOMO">MoMo</SelectItem>
                      <SelectItem value="VNPAY">VNPay</SelectItem>
                      <SelectItem value="ZALOPAY">ZaloPay</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="methodType">Payment Method Type *</Label>
                <Select 
                  value={formData.methodType} 
                  onValueChange={(value: PaymentMethodType) => setFormData(prev => ({ ...prev, methodType: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                    <SelectItem value="QR_CODE">QR Code</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Payment description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this payment..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.amount || !formData.provider || !formData.methodType}
                  className="min-w-[120px]"
                >
                  {loading ? 'Processing...' : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Process Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}