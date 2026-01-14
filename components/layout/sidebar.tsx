"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  UserCheck,
  Calendar,
  TableProperties,
  LogOut,
} from "lucide-react"
import { getCurrentUser, logout } from "@/lib/storage"
import { useState, useEffect } from "react"

const adminNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/daily-thali", label: "Daily Thali Menu", icon: UtensilsCrossed },
  { href: "/tables", label: "Table Management", icon: TableProperties },
  { href: "/orders", label: "Order Entry", icon: ShoppingCart },
  { href: "/banquet", label: "Banquet Management", icon: Calendar },
  { href: "/workers", label: "Worker Management", icon: UserCheck },
  { href: "/attendance", label: "Worker Attendance", icon: Calendar },
]

const cashierNavItems = [
  { href: "/cashier-dashboard", label: "Cashier Dashboard", icon: LayoutDashboard },
  { href: "/daily-expenses", label: "Daily Expenses", icon: ShoppingCart },
  { href: "/worker-salary", label: "Worker Salary", icon: UserCheck },
  { href: "/salary-summary", label: "Monthly Summary", icon: Calendar },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser?.role === "Cashier" && pathname === "/dashboard") {
      router.push("/cashier-dashboard")
    }
  }, [pathname, router])

  const navItems = user?.role === "Cashier" ? cashierNavItems : adminNavItems

  return (
    <div className="flex flex-col h-screen w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/images/padharo-dhal-28hotel-29-logo.jpg"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-md"
          />
          <div>
            <h2 className="font-bold text-sm leading-tight">Padharo Thal</h2>
            <p className="text-xs text-muted-foreground">& Banquet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-rose-50 text-rose-900 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-3 border-t border-border space-y-2">
        {user && (
          <div className="px-3 py-2 text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </div>
  )
}

function handleLogout() {
  logout()
  window.location.href = "/"
}
