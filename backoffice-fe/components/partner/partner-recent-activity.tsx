import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard, Star, MessageSquare, User } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "booking",
    user: "Nguyễn Văn A",
    action: "đã đặt phòng Deluxe",
    time: "5 phút trước",
    icon: Calendar,
    color: "blue",
  },
  {
    id: 2,
    type: "payment",
    user: "Trần Thị B",
    action: "đã thanh toán 3,500,000₫",
    time: "15 phút trước",
    icon: CreditCard,
    color: "green",
  },
  {
    id: 3,
    type: "review",
    user: "Lê Văn C",
    action: "đã đánh giá 5 sao",
    time: "30 phút trước",
    icon: Star,
    color: "yellow",
  },
  {
    id: 4,
    type: "message",
    user: "Phạm Thị D",
    action: "đã gửi tin nhắn",
    time: "1 giờ trước",
    icon: MessageSquare,
    color: "purple",
  },
  {
    id: 5,
    type: "checkin",
    user: "Hoàng Văn E",
    action: "đã check-in",
    time: "2 giờ trước",
    icon: User,
    color: "gray",
  },
]

export function PartnerRecentActivity() {
  const getIconColor = (color: string) => {
    switch (color) {
      case "blue":
        return "text-blue-600 bg-blue-100"
      case "green":
        return "text-green-600 bg-green-100"
      case "yellow":
        return "text-yellow-600 bg-yellow-100"
      case "purple":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
        <CardDescription>Các hoạt động mới nhất tại khách sạn của bạn</CardDescription>
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
