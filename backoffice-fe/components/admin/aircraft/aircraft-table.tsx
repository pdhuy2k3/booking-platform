"use client"

import { Badge } from "@/components/ui/badge"
import { AdminTable, renderBadge } from "@/components/admin/shared/admin-table"
import type { Aircraft } from "@/types/api"

interface AircraftTableProps {
  data: Aircraft[]
  loading: boolean
  onEdit: (aircraft: Aircraft) => void
  onDelete: (aircraft: Aircraft) => void
}

export function AircraftTable({ data, loading, onEdit, onDelete }: AircraftTableProps) {
  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>
    )
  }

  const columns = [
    {
      key: 'model',
      title: 'Model',
      className: 'font-medium'
    },
    {
      key: 'manufacturer',
      title: 'Nhà sản xuất',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'registrationNumber',
      title: 'Số đăng ký',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'totalCapacity',
      title: 'Sức chứa',
      render: (value: number) => value ? `${value} chỗ` : 'N/A'
    },
    {
      key: 'isActive',
      title: 'Hoạt động',
      render: (value: boolean) => getStatusBadge(value)
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
      keyField="aircraftId"
      minWidth="800px"
    />
  )
}
