'use client'

import { useState } from 'react'
import { customerService } from '@/modules/profile/api'
import { Button } from '@/common/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card'
import { toast } from 'sonner'
import { Shield, Mail, KeyRound, Smartphone } from 'lucide-react'
import QRCode from 'react-qr-code'

export function AccountSecurity() {
  const [loading, setLoading] = useState<string | null>(null)
  const [totpSecret, setTotpSecret] = useState<string | null>(null)

  const handleSendVerification = async () => {
    setLoading('verify')
    try {
      await customerService.sendVerificationEmail()
      toast.success('Verification email sent!', { description: 'Please check your inbox to verify your email address.' })
    } catch (error) {
      toast.error('Failed to send verification email.')
    } finally {
      setLoading(null)
    }
  }

  const handleChangePassword = async () => {
    setLoading('password')
    try {
      await customerService.sendUpdatePasswordEmail()
      toast.success('Password reset email sent!', { description: 'Please check your inbox to continue.' })
    } catch (error) {
      toast.error('Failed to send password reset email.')
    } finally {
      setLoading(null)
    }
  }

  const handleSetup2FA = async () => {
    setLoading('2fa')
    try {
      const secret = await customerService.configureTotp()
      setTotpSecret(secret)
      toast.info('Scan the QR code with your authenticator app.')
    } catch (error) {
      toast.error('Failed to set up 2FA.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield />
          Account Security
        </CardTitle>
        <CardDescription>
          Manage your password, two-factor authentication, and other security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium flex items-center gap-2"><Mail /> Email Verification</h3>
            <p className="text-sm text-gray-500">Ensure your email address is verified for full account functionality.</p>
          </div>
          <Button onClick={handleSendVerification} disabled={loading === 'verify'} variant="outline">
            {loading === 'verify' ? 'Sending...' : 'Send Verification Email'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium flex items-center gap-2"><KeyRound /> Password</h3>
            <p className="text-sm text-gray-500">Change your password regularly to keep your account secure.</p>
          </div>
          <Button onClick={handleChangePassword} disabled={loading === 'password'} variant="outline">
            {loading === 'password' ? 'Sending...' : 'Change Password'}
          </Button>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium flex items-center gap-2"><Smartphone /> Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
            </div>
            {!totpSecret && (
              <Button onClick={handleSetup2FA} disabled={loading === '2fa'} variant="outline">
                {loading === '2fa' ? 'Loading...' : 'Set Up 2FA'}
              </Button>
            )}
          </div>
          {totpSecret && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-center">
              <h4 className="font-semibold">Scan this QR Code</h4>
              <p className="text-sm text-gray-600 mb-4">Use an authenticator app like Google Authenticator or Authy.</p>
              <div className="p-4 bg-white inline-block rounded-lg">
                <QRCode value={`otpauth://totp/BookingSmart?secret=${totpSecret}`} size={160} />
              </div>
              <p className="mt-4 text-xs text-gray-500">After scanning, enter the code from your app in Keycloak to complete the setup.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}