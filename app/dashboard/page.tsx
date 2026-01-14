"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/app-state"
import { getCurrentUser } from "@/lib/storage"
import { IndianRupee, ShoppingCart, Wallet, CreditCard, UtensilsCrossed } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const router = useRouter()
  const appState = useAppState()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    cashIncome: 0,
    onlineIncome: 0,
    cardIncome: 0,
    menuItems: 0,
  })
  const [weeklyData, setWeeklyData] = useState<any[]>([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
  }, [router])

  useEffect(() => {
    const updateStats = () => {
      const today = new Date().toISOString().split("T")[0]
      const dailyStats = appState.getDailyStats(today)
      setStats({
        todayOrders: dailyStats.totalOrders,
        todayRevenue: dailyStats.totalRevenue,
        cashIncome: dailyStats.cashIncome,
        onlineIncome: dailyStats.onlineIncome,
        cardIncome: dailyStats.cardIncome,
        menuItems: dailyStats.menuItems,
      })

      const weeklyStats = appState.getWeeklyStats()
      setWeeklyData(weeklyStats)
    }

    updateStats()
    // Set up interval to check for updates
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [appState])

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="border-b pb-4">
            
            <div className="mt-4">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">Total orders placed today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total income today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menu Items Today</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.menuItems}</div>
                <p className="text-xs text-muted-foreground mt-1">Items in today's menu</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cash Income</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{stats.cashIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Cash payments today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Online Income</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₹{stats.onlineIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Online payments today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Card Income</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">₹{stats.cardIncome.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Card payments today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Revenue</CardTitle>
              <p className="text-sm text-muted-foreground">Last 7 days revenue overview</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} labelFormatter={(label) => `Day: ${label}`} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
