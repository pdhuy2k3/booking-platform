"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "T1", revenue: 320000000, bookings: 45 },
  { month: "T2", revenue: 280000000, bookings: 38 },
  { month: "T3", revenue: 350000000, bookings: 52 },
  { month: "T4", revenue: 420000000, bookings: 61 },
  { month: "T5", revenue: 480000000, bookings: 68 },
  { month: "T6", revenue: 450000000, bookings: 64 },
]

export function PartnerRevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doanh thu theo tháng</CardTitle>
        <CardDescription>Biểu đồ doanh thu và số lượng đặt chỗ của khách sạn</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                name === "revenue" ? `${(Number(value) / 1000000).toFixed(0)}M₫` : value,
                name === "revenue" ? "Doanh thu" : "Đặt chỗ",
              ]}
            />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a" }} />
            <Line type="monotone" dataKey="bookings" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
