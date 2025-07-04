import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Plane, Hotel, CreditCard, AlertTriangle } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "booking",
    user: "Nguyễn Văn A",
    action: "đã đặt chuyến bay HAN → SGN",
    time: "2 phút trước",
    icon: Plane,
    color: "blue",
  },
  {
    id: 2,
    type: "payment",
    user: "Trần Thị B",
    action: "đã thanh toán 7,000,000₫",
    time: "5 phút trước",
    icon: CreditCard,
    color: "green",
  },
  {
    id: 3,
    type: "hotel",
    user: "Lê Văn C",
    action: "đã đặt phòng Lotte Hotel",
    time: "10 phút trước",
    icon: Hotel,
    color: "purple",
  },
  {
    id: 4,
    type: "cancel",
    user: "Phạm Thị D",
    action: "đã hủy đặt chỗ BK004",
    time: "15 phút trước",
    icon: AlertTriangle,
    color: "red",
  },
  {
    id: 5,
    type: "register",
    user: "Hoàng Văn E",
    action: "đã đăng ký tài khoản mới",
    time: "20 phút trước",
    icon: User,
    color: "gray",
  },
]

export function RecentActivity() {
  const getIconColor = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600 bg-blue-100"
      case "green":
        return "text-green-600 bg-green-100"
      case "purple":
        return "text-purple-600 bg-purple-100"
      case "red":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Các hoạt động mới nhất trên hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(activity.color)}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>{" "}
                  <span className="text-gray-600">{activity.action}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
