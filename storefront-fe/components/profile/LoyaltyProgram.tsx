'use client'

import { useState, useEffect } from 'react'
import { customerService, CustomerProfile, LoyaltyTransaction } from '@/lib/customer-service'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'
import { 
  Gift, 
  Crown, 
  Star, 
  TrendingUp, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Clock,
  Award,
  Coins,
  ShoppingCart,
  Plane,
  Hotel
} from 'lucide-react'

interface LoyaltyProgramProps {
  profile: CustomerProfile
}

export function LoyaltyProgram({ profile }: LoyaltyProgramProps) {
  const [loyaltyBalance, setLoyaltyBalance] = useState<any>(null)
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false)
  const [redeemPoints, setRedeemPoints] = useState('')
  const [redeemType, setRedeemType] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    loadLoyaltyData()
  }, [])

  const loadLoyaltyData = async () => {
    try {
      setLoading(true)
      const [balanceData, transactionData] = await Promise.all([
        customerService.getLoyaltyBalance(),
        customerService.getLoyaltyHistory(1, 10)
      ])
      
      setLoyaltyBalance(balanceData)
      setTransactions(transactionData.transactions)
      setHasMore(transactionData.hasMore)
    } catch (error) {
      console.error('Failed to load loyalty data:', error)
      toast.error('Không thể tải thông tin điểm thưởng')
    } finally {
      setLoading(false)
    }
  }

  const loadMoreTransactions = async () => {
    if (loadingTransactions || !hasMore) return

    try {
      setLoadingTransactions(true)
      const data = await customerService.getLoyaltyHistory(page + 1, 10)
      setTransactions([...transactions, ...data.transactions])
      setPage(page + 1)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Failed to load more transactions:', error)
      toast.error('Không thể tải thêm lịch sử giao dịch')
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleRedeem = async () => {
    if (!redeemPoints || !redeemType) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    const points = parseInt(redeemPoints)
    if (points <= 0 || points > (loyaltyBalance?.currentPoints || 0)) {
      toast.error('Số điểm không hợp lệ')
      return
    }

    try {
      setRedeeming(true)
      await customerService.redeemPoints({
        points,
        type: redeemType as 'DISCOUNT' | 'UPGRADE' | 'VOUCHER',
        description: `Đổi ${points} điểm lấy ${getRedeemTypeLabel(redeemType)}`
      })
      
      toast.success('Đổi điểm thành công!')
      setIsRedeemDialogOpen(false)
      setRedeemPoints('')
      setRedeemType('')
      loadLoyaltyData() // Reload data
    } catch (error) {
      console.error('Failed to redeem points:', error)
      toast.error('Không thể đổi điểm. Vui lòng thử lại.')
    } finally {
      setRedeeming(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'GOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SILVER': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return <Crown className="h-4 w-4" />
      case 'GOLD': return <Star className="h-4 w-4" />
      case 'SILVER': return <Award className="h-4 w-4" />
      default: return <Coins className="h-4 w-4" />
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'EARNED': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'REDEEMED': return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'EXPIRED': return <Clock className="h-4 w-4 text-gray-600" />
      default: return <TrendingUp className="h-4 w-4 text-blue-600" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'EARNED': return 'text-green-600'
      case 'REDEEMED': return 'text-red-600'
      case 'EXPIRED': return 'text-gray-600'
      default: return 'text-blue-600'
    }
  }

  const getRedeemTypeLabel = (type: string) => {
    switch (type) {
      case 'DISCOUNT': return 'Giảm giá'
      case 'UPGRADE': return 'Nâng cấp'
      case 'VOUCHER': return 'Voucher'
      default: return type
    }
  }

  const redeemOptions = [
    { value: 'DISCOUNT', label: 'Giảm giá đặt chỗ', rate: '100 điểm = 10,000₫' },
    { value: 'UPGRADE', label: 'Nâng cấp dịch vụ', rate: '500 điểm = 1 lần nâng cấp' },
    { value: 'VOUCHER', label: 'Voucher ưu đãi', rate: '1000 điểm = 1 voucher' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Chương trình khách hàng thân thiết</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile.loyaltyProgram) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>Chương trình khách hàng thân thiết</span>
            </CardTitle>
            <CardDescription>
              Tham gia chương trình để tích lũy điểm và nhận ưu đãi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa tham gia chương trình
              </h3>
              <p className="text-gray-500 mb-4">
                Đăng ký ngay để bắt đầu tích lũy điểm thưởng
              </p>
              <Button>
                Tham gia ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progressPercentage = loyaltyBalance 
    ? (loyaltyBalance.currentPoints / loyaltyBalance.nextTierPoints) * 100
    : (profile.loyaltyProgram.points / profile.loyaltyProgram.nextTierPoints) * 100

  return (
    <div className="space-y-6">
      {/* Loyalty Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Chương trình khách hàng thân thiết</span>
          </CardTitle>
          <CardDescription>
            Tích lũy điểm và nhận ưu đãi đặc biệt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Tier */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Badge className={`${getTierColor(profile.loyaltyProgram.tier)} text-lg px-4 py-2`}>
                  {getTierIcon(profile.loyaltyProgram.tier)}
                  <span className="ml-2">{profile.loyaltyProgram.tier}</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Hạng hiện tại</p>
            </div>

            {/* Current Points */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {loyaltyBalance?.currentPoints?.toLocaleString() || profile.loyaltyProgram.points.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Điểm hiện tại</p>
            </div>

            {/* Lifetime Points */}
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {loyaltyBalance?.lifetimePoints?.toLocaleString() || 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Tổng điểm tích lũy</p>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Tiến độ lên hạng {loyaltyBalance?.nextTierName || 'cao hơn'}</span>
              <span className="text-sm text-gray-600">
                {loyaltyBalance?.nextTierPoints - loyaltyBalance?.currentPoints || 
                 profile.loyaltyProgram.nextTierPoints - profile.loyaltyProgram.points} điểm nữa
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Expiring Points */}
          {loyaltyBalance?.expiringPoints && loyaltyBalance.expiringPoints.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Điểm sắp hết hạn
                </span>
              </div>
              <div className="mt-1 text-sm text-yellow-700">
                {loyaltyBalance.expiringPoints[0].points.toLocaleString()} điểm sẽ hết hạn vào{' '}
                {new Date(loyaltyBalance.expiringPoints[0].expiryDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          )}

          {/* Redeem Points Button */}
          <div className="mt-6 text-center">
            <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Coins className="h-4 w-4 mr-2" />
                  Đổi điểm thưởng
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Đổi điểm thưởng</DialogTitle>
                  <DialogDescription>
                    Sử dụng điểm tích lũy để nhận ưu đãi
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="points">Số điểm muốn đổi</Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="Nhập số điểm"
                      value={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.value)}
                      max={loyaltyBalance?.currentPoints || profile.loyaltyProgram.points}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tối đa: {loyaltyBalance?.currentPoints?.toLocaleString() || profile.loyaltyProgram.points.toLocaleString()} điểm
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Loại ưu đãi</Label>
                    <Select value={redeemType} onValueChange={setRedeemType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại ưu đãi" />
                      </SelectTrigger>
                      <SelectContent>
                        {redeemOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-gray-500">{option.rate}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRedeemDialogOpen(false)
                        setRedeemPoints('')
                        setRedeemType('')
                      }}
                    >
                      Hủy
                    </Button>
                    <Button onClick={handleRedeem} disabled={redeeming}>
                      {redeeming ? 'Đang xử lý...' : 'Đổi điểm'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
          <CardDescription>
            Theo dõi các giao dịch điểm thưởng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</span>
                        {transaction.bookingReference && (
                          <>
                            <span>•</span>
                            <span>#{transaction.bookingReference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'EARNED' ? '+' : '-'}{transaction.points.toLocaleString()}
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreTransactions}
                    disabled={loadingTransactions}
                  >
                    {loadingTransactions ? 'Đang tải...' : 'Xem thêm'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
