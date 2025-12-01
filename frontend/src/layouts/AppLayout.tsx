import { Outlet, Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  ChefHat,
  UtensilsCrossed,
  Settings,
} from "lucide-react"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarNav,
  SidebarNavItem,
  SidebarNavLink,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function AppLayout() {
  const location = useLocation()

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
    },
    {
      title: "Quản lý Đơn hàng",
      icon: ShoppingCart,
      href: "/orders",
    },
    {
      title: "Bếp",
      icon: ChefHat,
      href: "/kitchen",
    },
    {
      title: "Menu & Món ăn",
      icon: UtensilsCrossed,
      href: "/resources/dishes",
    },
    {
      title: "Cài đặt",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">Admin Nhà Hàng</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <SidebarNavItem key={item.href}>
                  <SidebarNavLink
                    asChild
                    active={isActive}
                  >
                    <Link to={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarNavLink>
                </SidebarNavItem>
              )
            })}
          </SidebarNav>
        </SidebarContent>
      </Sidebar>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold">
              {menuItems.find((item) => item.href === location.pathname)?.title || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

