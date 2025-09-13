"use client"

import { Badge } from "@/components/ui/badge"
import { AdminTable } from "@/components/admin/shared/admin-table"
import type { Airport } from "@/types/api"

interface AirportTableProps {
  data: Airport[]
  loading: boolean
  onEdit: (airport: Airport) => void
  onDelete: (airport: Airport) => void
}

export function AirportTable({ data, loading, onEdit, onDelete }: AirportTableProps) {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Tạm ngừng</Badge>
    )
  }

  const columns = [
    {
      key: 'iataCode',
      title: 'Mã IATA',
      className: 'font-medium'
    },
    {
      key: 'name',
      title: 'Tên sân bay'
    },
    {
      key: 'city',
      title: 'Thành phố'
    },
    {
      key: 'country',
      title: 'Quốc gia'
    },
    {
      key: 'timezone',
      title: 'Múi giờ',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value: boolean) => getStatusBadge(value)
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (value: string) => new Date(value).toLocaleDateString('vi-VN')
    }
  ]

  return (
    <AdminTable
      data={data}
      columns={columns}
      loading={loading}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có dữ liệu"
      keyField="airportId"
      minWidth="800px"
    />
  )
}
