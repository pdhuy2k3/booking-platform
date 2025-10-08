"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Plus, Trash2, Edit3, Loader2, CheckCircle } from "lucide-react"
import { paymentMethodService, PaymentMethodResponse } from "@/modules/payment/service/payment-method"
import { Elements } from '@stripe/react-stripe-js'
import { getStripe, createSetupElementsOptions } from "@/modules/payment/config/stripe"
import { AddPaymentMethodDialogV2 } from "./AddPaymentMethodDialogV2"

export function PaymentMethodsTab() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null)
  const [editDisplayName, setEditDisplayName] = useState("")
  const { toast } = useToast()
  
  // Initialize Stripe with setup mode for saving payment methods
  const stripePromise = getStripe()
  const elementsOptions = createSetupElementsOptions() as any

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const methods = await paymentMethodService.getPaymentMethods()
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Failed to load payment methods:', error)
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCardIcon = (brand?: string) => {
    const brandLower = brand?.toLowerCase() || ''
    if (brandLower.includes('visa')) return "💳"
    if (brandLower.includes('mastercard')) return "💳"
    if (brandLower.includes('amex')) return "💳"
    return "💳"
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      await paymentMethodService.setDefaultPaymentMethod(methodId)
      toast({
        title: "Success",
        description: "Default payment method updated",
      })
      await loadPaymentMethods()
    } catch (error) {
      console.error('Failed to set default:', error)
      toast({
        title: "Error",
        description: "Failed to update default payment method",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (methodId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      await paymentMethodService.deletePaymentMethod(methodId)
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      })
      await loadPaymentMethods()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      })
    }
  }

  const handleAddSuccess = async () => {
    await loadPaymentMethods()
  }

  const handleUpdateMethod = async (methodId: string) => {
    try {
      await paymentMethodService.updatePaymentMethod(methodId, { displayName: editDisplayName })
      toast({
        title: "Success",
        description: "Payment method updated successfully",
      })
      setEditingMethodId(null)
      setEditDisplayName("")
      await loadPaymentMethods()
    } catch (error) {
      console.error('Failed to update:', error)
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      })
    }
  }

  const formatExpiry = (method: PaymentMethodResponse) => {
    if (method.cardExpiryMonth && method.cardExpiryYear) {
      return `${String(method.cardExpiryMonth).padStart(2, '0')}/${method.cardExpiryYear}`
    }
    return 'N/A'
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods for bookings</CardDescription>
          </div>
          <Button 
            className="bg-cyan-500 hover:bg-cyan-600"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading payment methods...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">No Payment Methods</h3>
              <p className="text-gray-400 mb-4">Add a payment method to make bookings easier</p>
              <Button 
                className="bg-cyan-500 hover:bg-cyan-600"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.methodId}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getCardIcon(method.cardBrand)}</div>
                    <div className="flex-1">
                      {editingMethodId === method.methodId ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editDisplayName}
                            onChange={(e) => setEditDisplayName(e.target.value)}
                            className="max-w-xs"
                            placeholder="Display name"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateMethod(method.methodId)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingMethodId(null)
                              setEditDisplayName("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              {method.displayName || `${method.cardBrand} •••• ${method.cardLastFour}`}
                            </span>
                            {method.isDefault && (
                              <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-600">
                                Default
                              </Badge>
                            )}
                            {method.isVerified && (
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {!method.isActive && (
                              <Badge variant="secondary" className="bg-gray-500/10 text-gray-600">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {method.cardBrand} •••• {method.cardLastFour} • Expires {formatExpiry(method)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.methodId)}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMethodId(method.methodId)
                        setEditDisplayName(method.displayName)
                      }}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.methodId)}
                      className="border-red-500/50 hover:bg-red-500/10 text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Elements wrapped Add Payment Method Dialog with Apple Pay & Google Pay */}
      <Elements stripe={stripePromise} options={elementsOptions}>
        <AddPaymentMethodDialogV2
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={handleAddSuccess}
        />
      </Elements>
    </div>
  )
}
