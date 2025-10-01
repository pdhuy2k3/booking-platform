"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, RefreshCw, Save, AlertTriangle, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { RoomAvailabilityService } from "@/services/room-availability-service"
import type { RoomAvailabilityDay, RoomAvailabilityResponse, RoomAvailabilityUpdate } from "@/types/api"
import { toast } from "sonner"

interface RoomAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotelId: number
  roomTypeId: number
  roomTypeName: string
  onSaved?: () => void
}

const DEFAULT_RANGE_DAYS = 30

const formatDate = (date: Date | string) => {
  if (typeof date === "string") return date
  return format(date, "yyyy-MM-dd")
}

export function RoomAvailabilityDialog({
  open,
  onOpenChange,
  hotelId,
  roomTypeId,
  roomTypeName,
  onSaved
}: RoomAvailabilityDialogProps) {
  const today = useMemo(() => new Date(), [])
  const [startDate, setStartDate] = useState<string>(formatDate(today))
  const [endDate, setEndDate] = useState<string>(
    formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + DEFAULT_RANGE_DAYS - 1))
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<RoomAvailabilityDay[]>([])
  const [activeRoomCount, setActiveRoomCount] = useState<number>(0)
  const [isDirty, setIsDirty] = useState(false)

  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RoomAvailabilityService.getAvailability(hotelId, roomTypeId, {
        startDate,
        endDate,
      })
      setAvailability(data.availability)
      setActiveRoomCount(data.activeRoomCount)
      setIsDirty(false)
    } catch (err: any) {
      console.error("Failed to load room availability", err)
      setError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu tồn kho phòng")
    } finally {
      setLoading(false)
    }
  }, [hotelId, roomTypeId, startDate, endDate])

  useEffect(() => {
    if (open) {
      loadAvailability()
    }
  }, [open, loadAvailability])

  const handleValueChange = (index: number, field: "totalInventory" | "totalReserved", value: number) => {
    setAvailability(prev => {
      const next = [...prev]
      const target = { ...next[index] }
      if (field === "totalInventory") {
        target.totalInventory = Math.max(0, value)
        if (target.totalReserved > target.totalInventory) {
          target.totalReserved = target.totalInventory
        }
      } else {
        target.totalReserved = Math.max(0, Math.min(value, target.totalInventory))
      }
      target.remaining = Math.max(target.totalInventory - target.totalReserved, 0)
      target.autoCalculated = false
      next[index] = target
      return next
    })
    setIsDirty(true)
  }

  const hasValidationError = availability.some(day => day.totalReserved > day.totalInventory)

  const handleSave = async () => {
    if (saving || hasValidationError) {
      return
    }

    const payload: RoomAvailabilityUpdate[] = availability.map(day => ({
      date: day.date,
      totalInventory: day.totalInventory,
      totalReserved: day.totalReserved,
    }))

    try {
      setSaving(true)
      setError(null)
      const updated = await RoomAvailabilityService.updateAvailability(hotelId, roomTypeId, payload)
      setAvailability(updated.availability)
      setActiveRoomCount(updated.activeRoomCount)
      setIsDirty(false)
      toast.success("Tồn kho phòng đã được cập nhật")
      onSaved?.()
    } catch (err: any) {
      console.error("Failed to update room availability", err)
      setError(err?.response?.data?.message || err?.message || "Không thể cập nhật tồn kho phòng")
      toast.error("Không thể cập nhật tồn kho phòng")
    } finally {
      setSaving(false)
    }
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && isDirty) {
      if (!confirm("Bạn có muốn đóng cửa sổ mà không lưu thay đổi?")) {
        return
      }
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Tồn kho loại phòng: {roomTypeName}</DialogTitle>
          <DialogDescription>
            Quản lý số lượng phòng khả dụng cho từng ngày. Tổng số phòng hoạt động hiện tại: {activeRoomCount}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                max={endDate}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                min={startDate}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={loadAvailability} disabled={loading || generating} className="w-full md:w-auto">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Làm mới dữ liệu
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    setGenerating(true)
                    setError(null)
                    const response = await RoomAvailabilityService.generateRandomAvailability(hotelId, roomTypeId, {
                      startDate,
                      endDate,
                    })
                    setAvailability(response.availability)
                    setActiveRoomCount(response.activeRoomCount)
                    setIsDirty(false)
                    toast.success("Đã sinh dữ liệu tồn kho ngẫu nhiên")
                  } catch (err: any) {
                    console.error("Failed to generate availability", err)
                    const message = err?.response?.data?.message || err?.message || "Không thể sinh dữ liệu tồn kho"
                    setError(message)
                    toast.error(message)
                  } finally {
                    setGenerating(false)
                  }
                }}
                disabled={loading || generating}
                className="w-full md:w-auto"
              >
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Tạo dữ liệu mẫu
              </Button>
            </div>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="border rounded-md">
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Ngày</TableHead>
                    <TableHead>Số phòng tổng</TableHead>
                    <TableHead>Đã giữ chỗ</TableHead>
                    <TableHead>Còn lại</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" /> Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : availability.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        Không có dữ liệu tồn kho cho khoảng thời gian đã chọn
                      </TableCell>
                    </TableRow>
                  ) : (
                    availability.map((day, index) => {
                      const reservedExceedsInventory = day.totalReserved > day.totalInventory
                      return (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium whitespace-nowrap">{day.date}</TableCell>
                          <TableCell className="max-w-[150px]">
                            <Input
                              type="number"
                              min={0}
                              value={day.totalInventory}
                              onChange={(event) => handleValueChange(index, "totalInventory", Number(event.target.value))}
                            />
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            <Input
                              type="number"
                              min={0}
                              value={day.totalReserved}
                              onChange={(event) => handleValueChange(index, "totalReserved", Number(event.target.value))}
                            />
                            {reservedExceedsInventory ? (
                              <p className="mt-1 text-xs text-destructive">
                                Số phòng giữ chỗ không được vượt quá tổng số phòng
                              </p>
                            ) : null}
                          </TableCell>
                          <TableCell>{day.remaining}</TableCell>
                          <TableCell>
                            {day.autoCalculated ? (
                              <span className="text-xs text-muted-foreground">Tự động dựa trên số phòng hoạt động</span>
                            ) : (
                              <span className="text-xs text-emerald-600">Đã chỉnh sửa</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="justify-end space-x-2">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Đóng
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading || availability.length === 0 || hasValidationError || !isDirty}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
