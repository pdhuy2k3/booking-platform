"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Hotel,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  User,
  Building2,
  CreditCard,
  MessageSquare,
  FileText,
  HelpCircle,
  Bed,
  Users,
  Star,
  Plane,
  Bus,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { usePartnerPermissions } from "@/hooks/use-partner-permissions"

interface PartnerLayoutProps {
  children: React.ReactNode
}

function PartnerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const permissions = usePartnerPermissions()

  // Tạo menu động dựa trên quyền
  const getNavigationData = () => {
    const navMain = [
      {
        title: "Tổng quan",
        items: [
          {
            title: "Dashboard",
            url: "/partner",
            icon: LayoutDashboard,
            show: true,
          },
          {
            title: "Thống kê",
            url: "/partner/analytics",
            icon: BarChart3,
            show: permissions.canViewReports,
          },
        ].filter((item) => item.show),
      },
    ]

    // Quản lý dịch vụ - chỉ hiện những dịch vụ được phép
    const serviceItems = []

    if (permissions.canManageHotels) {
      serviceItems.push(
        {
          title: "Khách sạn của tôi",
          url: "/partner/hotels",
          icon: Hotel,
        },
        {
          title: "Quản lý phòng",
          url: "/partner/rooms",
          icon: Bed,
        },
        {
          title: "Đánh giá khách sạn",
          url: "/partner/hotel-reviews",
          icon: Star,
        },
      )
    }

    if (permissions.canManageFlights) {
      serviceItems.push({
        title: "Chuyến bay của tôi",
        url: "/partner/flights",
        icon: Plane,
      })
    }

    if (permissions.canManageTransport) {
      serviceItems.push({
        title: "Xe khách của tôi",
        url: "/partner/transport",
        icon: Bus,
      })
    }

    if (serviceItems.length > 0) {
      navMain.push({
        title: "Quản lý dịch vụ",
        items: serviceItems,
      })
    }

    // Đặt chỗ & Khách hàng
    navMain.push({
      title: "Đặt chỗ & Khách hàng",
      items: [
        {
          title: "Đặt chỗ",
          url: "/partner/bookings",
          icon: Calendar,
        },
        {
          title: "Khách hàng",
          url: "/partner/customers",
          icon: Users,
        },
      ],
    })

    // Kinh doanh
    const businessItems = []

    if (permissions.canViewReports) {
      businessItems.push({
        title: "Báo cáo",
        url: "/partner/reports",
        icon: FileText,
      })
    }

    if (permissions.canManagePayments) {
      businessItems.push({
        title: "Thanh toán",
        url: "/partner/payments",
        icon: CreditCard,
      })
    }

    if (businessItems.length > 0) {
      navMain.push({
        title: "Kinh doanh",
        items: businessItems,
      })
    }

    // Hỗ trợ
    navMain.push({
      title: "Hỗ trợ",
      items: [
        {
          title: "Tin nhắn",
          url: "/partner/messages",
          icon: MessageSquare,
        },
        {
          title: "Trợ giúp",
          url: "/partner/help",
          icon: HelpCircle,
        },
      ],
    })

    return {
      navMain: navMain.filter((group) => group.items.length > 0),
      navSecondary: [
        {
          title: "Cài đặt",
          url: "/partner/settings",
          icon: Settings,
        },
      ],
    }
  }

  const data = getNavigationData()

  // Lấy tên hiển thị cho loại đối tác
  const getPartnerTypeDisplay = () => {
    switch (user?.partnerType) {
      case "HOTEL":
        return "Hotel Partner"
      case "FLIGHT":
        return "Flight Partner"
      case "TRANSPORT":
        return "Transport Partner"
      case "ALL":
        return "Multi-Service Partner"
      default:
        return "Partner Portal"
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/partner">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BookingSmart</span>
                  <span className="truncate text-xs">{getPartnerTypeDisplay()}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <PartnerUserDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function PartnerUserDropdown() {
  const { user, logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "Partner"} />
            <AvatarFallback className="rounded-lg">{user?.name?.charAt(0).toUpperCase() || "P"}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user?.name || "Partner User"}</span>
            <span className="truncate text-xs">{user?.email || "partner@hotel.com"}</span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Hồ sơ đối tác</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = []

  if (segments.length === 1 && segments[0] === "partner") {
    return [{ title: "Dashboard", href: "/partner", isCurrentPage: true }]
  }

  breadcrumbs.push({ title: "Dashboard", href: "/partner", isCurrentPage: false })

  const routeMap: Record<string, string> = {
    hotels: "Khách sạn của tôi",
    flights: "Chuyến bay của tôi",
    transport: "Xe khách của tôi",
    rooms: "Quản lý phòng",
    bookings: "Đặt chỗ",
    customers: "Khách hàng",
    reports: "Báo cáo",
    payments: "Thanh toán",
    messages: "Tin nhắn",
    settings: "Cài đặt",
    analytics: "Thống kê",
    "hotel-reviews": "Đánh giá khách sạn",
    help: "Trợ giúp",
  }

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]
    const title = routeMap[segment] || segment
    const href = "/" + segments.slice(0, i + 1).join("/")
    const isCurrentPage = i === segments.length - 1

    breadcrumbs.push({ title, href, isCurrentPage })
  }

  return breadcrumbs
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <SidebarProvider>
      <PartnerSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.href}>
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {breadcrumb.isCurrentPage ? (
                        <BreadcrumbPage className="text-sm">{breadcrumb.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={breadcrumb.href} className="text-sm">
                            {breadcrumb.title}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full text-[10px] text-white flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-full overflow-x-hidden">
          <div className="w-full max-w-none">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
