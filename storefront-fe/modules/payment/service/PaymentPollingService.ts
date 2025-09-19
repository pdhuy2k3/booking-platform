
// Polls payment status instead of relying on webhooks for demo purposes

import { paymentService } from './index'
import { PaymentIntent } from '../type'

interface PollingOptions {
  maxAttempts?: number
  intervalMs?: number
  onSuccess?: (paymentIntent: PaymentIntent) => void
  onError?: (error: string) => void
  onTimeout?: () => void
}

export class PaymentPollingService {
  private activePolls = new Map<string, NodeJS.Timeout>()

  /**
   * Start polling for payment status
   */
  startPolling(
    transactionId: string, 
    options: PollingOptions = {}
  ): void {
    const {
      maxAttempts = 30, // 30 attempts = 1 minute with 2s intervals
      intervalMs = 2000, // Poll every 2 seconds
      onSuccess,
      onError,
      onTimeout
    } = options

    let attempts = 0

    const poll = async () => {
      try {
        attempts++
        
        const paymentIntent = await paymentService.getPaymentStatus(transactionId)
        
        if (paymentIntent.status === 'succeeded') {
          this.stopPolling(transactionId)
          onSuccess?.(paymentIntent)
          return
        }
        
        if (paymentIntent.status === 'failed' || paymentIntent.status === 'canceled') {
          this.stopPolling(transactionId)
          onError?.(`Payment ${paymentIntent.status}`)
          return
        }
        
        // Continue polling if still pending/processing
        if (attempts < maxAttempts) {
          const timeoutId = setTimeout(poll, intervalMs)
          this.activePolls.set(transactionId, timeoutId)
        } else {
          this.stopPolling(transactionId)
          onTimeout?.()
        }
        
      } catch (error) {
        console.error('Error polling payment status:', error)
        if (attempts < maxAttempts) {
          const timeoutId = setTimeout(poll, intervalMs)
          this.activePolls.set(transactionId, timeoutId)
        } else {
          this.stopPolling(transactionId)
          onError?.(error instanceof Error ? error.message : 'Polling failed')
        }
      }
    }

    // Start polling immediately
    poll()
  }

  /**
   * Stop polling for a specific payment
   */
  stopPolling(paymentIntentId: string): void {
    const timeoutId = this.activePolls.get(paymentIntentId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.activePolls.delete(paymentIntentId)
    }
  }

  /**
   * Stop all active polls
   */
  stopAllPolling(): void {
    this.activePolls.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    this.activePolls.clear()
  }

  /**
   * Check if polling is active for a payment
   */
  isPolling(paymentIntentId: string): boolean {
    return this.activePolls.has(paymentIntentId)
  }

  /**
   * Get active poll count
   */
  getActivePollCount(): number {
    return this.activePolls.size
  }
}

// Export singleton instance
export const paymentPollingService = new PaymentPollingService()
export default paymentPollingService
