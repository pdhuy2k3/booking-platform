"use client"

import { Badge } from "@/components/ui/badge"
import { AdminTable, renderBadge, renderDate } from "@/components/admin/shared/admin-table"
import type { Airline } from "@/types/api"

interface AirlineTableProps {
  data: Airline[]
  loading: boolean
  onEdit: (airline: Airline) => void
  onDelete: (airline: Airline) => void
}

export function AirlineTable({ data, loading, onEdit, onDelete }: AirlineTableProps) {
  const columns = [
    {
      key: 'iataCode',
      title: 'Mã IATA',
      className: 'font-medium'
    },
    {
      key: 'name',
      title: 'Tên hãng'
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value: boolean) => renderBadge(value, "Hoạt động", "Tạm ngừng")
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (value: string) => renderDate(value)
    }
  ]

  return (
    <AdminTable
      data={data}
      columns={columns}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có hãng hàng không nào"
      keyField="airlineId"
      minWidth="600px"
    />
  )
}
