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
  Plane,
  Hotel,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  User,
  Shield,
  CreditCard,
  Tag,
  MessageSquare,
  FileText,
  HelpCircle,
  Sparkles,
  Building2,
  Navigation,
  Building,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AdminLayoutProps {
  children: React.ReactNode
}

// Navigation data with new structure
const data = {
  navMain: [
    {
      title: "Tổng quan",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Thống kê",
          url: "/admin/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Quản lý dịch vụ",
      items: [
        // Flight parent menu with submenu
        {
          title: "Chuyến bay",
          url: "/admin/flights",
          icon: Plane,
          hasSubMenu: true,
          subItems: [
            {
              title: "Hãng hàng không",
              url: "/admin/airlines",
              icon: Building,
            },
            {
              title: "Sân bay",
              url: "/admin/airports",
              icon: Navigation,
            },
            {
              title: "Giá vé",
              url: "/admin/flights/flight-fares",
              icon: CreditCard,
            },
          ],
        },
        // Hotel parent menu with submenu
        {
          title: "Khách sạn",
          url: "/admin/hotels",
          icon: Hotel,
          hasSubMenu: true,
          subItems: [
            {
              title: "Tiện nghi",
              url: "/admin/hotels/amenities",
              icon: Sparkles,
            },
          ],
        },
        {
          title: "Đặt chỗ",
          url: "/admin/bookings",
          icon: Calendar,
        },
      ],
    },
    {
      title: "Quản lý người dùng",
      items: [
        {
          title: "Khách hàng",
          url: "/admin/customers",
          icon: Users,
        },
        {
          title: "Đối tác",
          url: "/admin/partners",
          icon: Building2,
        },
        {
          title: "Nhân viên",
          url: "/admin/staff",
          icon: User,
        },
      ],
    },
    {
      title: "Kinh doanh",
      items: [
        {
          title: "Báo cáo",
          url: "/admin/reports",
          icon: FileText,
        },
        {
          title: "Thanh toán",
          url: "/admin/payments",
          icon: CreditCard,
        },
        {
          title: "Khuyến mãi",
          url: "/admin/promotions",
          icon: Tag,
        },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        {
          title: "Tin nhắn",
          url: "/admin/messages",
          icon: MessageSquare,
        },
        {
          title: "Trợ giúp",
          url: "/admin/help",
          icon: HelpCircle,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = React.useState<Record<string, boolean>>({})

  // Toggle submenu expansion
  const toggleMenu = (itemTitle: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemTitle]: !prev[itemTitle]
    }))
  }

  // Check if any submenu item is active
  const isSubmenuActive = (subItems: any[]) => {
    return subItems.some(subItem => pathname === subItem.url)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BookingSmart</span>
                  <span className="truncate text-xs">Admin Panel</span>
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
                  const isExpanded = expandedMenus[item.title] || false
                  const hasActiveSubItem = item.hasSubMenu && item.subItems ? isSubmenuActive(item.subItems) : false
                  
                  return (
                    <React.Fragment key={item.title}>
                      {/* Main menu item */}
                      <SidebarMenuItem>
                        <div className="flex items-center w-full">
                          {/* Main link - navigates to parent page */}
                          <SidebarMenuButton asChild isActive={isActive || hasActiveSubItem} className="flex-1">
                            <Link href={item.url} className="flex items-center">
                              <item.icon className="h-4 w-4" />
                              <span className="ml-2">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                          
                          {/* Chevron button - toggles submenu */}
                          {item.hasSubMenu && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              onClick={(e) => {
                                e.preventDefault()
                                toggleMenu(item.title)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </SidebarMenuItem>

                      {/* Submenu items */}
                      {item.hasSubMenu && item.subItems && isExpanded && (
                        <div className="ml-4 border-l border-sidebar-border pl-4 space-y-1">
                          {item.subItems.map((subItem) => {
                            const isSubItemActive = pathname === subItem.url
                            return (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton asChild isActive={isSubItemActive} size="sm">
                                  <Link href={subItem.url} className="flex items-center">
                                    <subItem.icon className="h-4 w-4" />
                                    <span className="ml-2">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )
                          })}
                        </div>
                      )}
                    </React.Fragment>
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
            <UserDropdown />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function UserDropdown() {
  const { user, logout } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.username || "Admin"} />
            <AvatarFallback className="rounded-lg">{user?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user?.username || "Admin User"}</span>
            <span className="truncate text-xs">{user?.email || "admin@bookingsmart.vn"}</span>
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
          <span>Hồ sơ</span>
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

  if (segments.length === 1 && segments[0] === "admin") {
    return [{ title: "Dashboard", href: "/admin", isCurrentPage: true }]
  }

  breadcrumbs.push({ title: "Dashboard", href: "/admin", isCurrentPage: false })

  const routeMap: Record<string, string> = {
    flights: "Chuyến bay",
    airlines: "Hãng hàng không",
    airports: "Sân bay",
    hotels: "Khách sạn",
    bookings: "Đặt chỗ",
    customers: "Khách hàng",
    staff: "Nhân viên",
    reports: "Báo cáo",
    payments: "Thanh toán",
    promotions: "Khuyến mãi",
    messages: "Tin nhắn",
    settings: "Cài đặt",
    analytics: "Thống kê",
    help: "Trợ giúp",
    amenities: "Tiện nghi",
    partners: "Đối tác",
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

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
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
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
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
