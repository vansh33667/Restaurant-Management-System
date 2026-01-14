"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, getItems, type WorkerSalary, type DailyExpense } from "@/lib/storage"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"

export default function CashierDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    todayExpenses: 0,
    monthlyExpenses: 0,
    monthlySalary: 0,
    activeWorkers: 0,
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    if (currentUser.role !== "Cashier") {
      router.push("/dashboard")
      return
    }
    setUser(currentUser)
    loadStats()
  }, [router])

  const loadStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().toISOString().slice(0, 7)

    const expenses = getItems<DailyExpense>("dailyExpenses")
    const salaries = getItems<WorkerSalary>("workerSalaries")
    const workers = getItems<any>("workers")

    const todayExpenses = expenses.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0)

    const monthlyExpenses = expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0)

    const monthlySalary = salaries.filter((s) => s.month === currentMonth).reduce((sum, s) => sum + s.finalSalary, 0)

    const activeWorkers = workers.filter((w: any) => w.isActive).length

    setStats({
      todayExpenses,
      monthlyExpenses,
      monthlySalary,
      activeWorkers,
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="border-b pb-4">
            
            <div className="mt-4">
              <h2 className="text-2xl font-semibold">Cashier Dashboard</h2>
              <p className="text-muted-foreground">Welcome, {user.name}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.todayExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Current date expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.monthlyExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.monthlySalary.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total paid this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeWorkers}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
