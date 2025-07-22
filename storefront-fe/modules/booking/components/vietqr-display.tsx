"use client"

import { useState, useEffect } from "react"
import { QrCode, Copy, CheckCircle, ExternalLink } from "lucide-react"
import { Button } from "@/common/components/ui/button"
import { Card, CardContent } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"

import { PaymentIntentResponse } from "@/modules/payment/types"

interface VietQRDisplayProps {
  qrData: PaymentIntentResponse
}

export function VietQRDisplay({ qrData }: VietQRDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              <QrCode className="w-3 h-3 mr-1" />
              VietQR Payment
            </Badge>
          </div>
          
          {qrData.qrCodeUrl ? (
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-200 inline-block">
              <img 
                src={qrData.qrCodeUrl} 
                alt="VietQR Code" 
                className="mx-auto"
                width={200}
                height={200}
              />
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-200">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">QR Code will appear here</p>
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Scan with your banking app</p>
            <p className="text-xs text-gray-500">
              Or open your banking app and scan this QR code to pay instantly
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 text-sm">Payment Details</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-lg">
                {formatAmount(qrData.amount, qrData.currency)}
              </span>
            </div>
            
            {qrData.transferInfo && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Transfer to</span>
                <div className="text-right flex-1 ml-2">
                  <div className="font-medium">{qrData.transferInfo}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-blue-600 hover:text-blue-700"
                    onClick={() => copyToClipboard(qrData.transferInfo || "")}
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            )}
            
            {qrData.description && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">Description</span>
                <div className="text-right flex-1 ml-2">
                  <div className="font-medium break-words">{qrData.description}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-blue-600 hover:text-blue-700"
                    onClick={() => copyToClipboard(qrData.description || "")}
                  >
                    {copied ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 text-sm text-blue-900">How to pay:</h4>
          <ol className="text-xs text-blue-800 space-y-1">
            <li>1. Open your banking app (Vietcombank, BIDV, TPBank, etc.)</li>
            <li>2. Select "QR Payment" or "Scan QR"</li>
            <li>3. Scan the QR code above</li>
            <li>4. Verify the amount and description</li>
            <li>5. Complete the payment in your banking app</li>
            <li>6. Return here and click "I've Made the Payment"</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
