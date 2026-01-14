"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DailyExpensesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<any[]>([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    amount: "",
    paymentMode: "Cash" as "Cash" | "UPI" | "Card" | "Bank",
    notes: "",
  })

  useEffect(() => {
    loadExpenses()
  }, [router])

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/daily_expenses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setExpenses(data.data)
      } else {
        throw new Error(data.error || 'Failed to load expenses')
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const expenseData = {
        expense_date: formData.date,
        title: formData.title,
        amount: formData.amount,
        payment_mode: formData.paymentMode,
        notes: formData.notes,
      }

      const response = await fetch('/api/daily_expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to add expense')
      }

      // Success
      toast({ title: "Success", description: "Expense added successfully" })
      setFormData({
        date: new Date().toISOString().split("T")[0],
        title: "",
        amount: "",
        paymentMode: "Cash",
        notes: "",
      })
      await loadExpenses()
    } catch (error) {
      console.error('Error adding expense:', error)
      toast({ title: "Error", description: error.message || "Failed to add expense", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        const response = await fetch('/api/daily_expenses', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to delete expense')
        }

        await loadExpenses()
      } catch (error) {
        console.error('Error deleting expense:', error)
        toast({ title: "Error", description: error.message || "Failed to delete expense", variant: "destructive" })
      }
    }
  }

  const todayTotal = expenses.filter((e) => e.expense_date === formData.date).reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">Daily Expenses</h1>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Add Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="e.g., Grocery, Electricity Bill"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Mode</Label>
                    <Select
                      value={formData.paymentMode}
                      onValueChange={(value: any) => setFormData({ ...formData, paymentMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Bank">Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Additional details..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Expense Records</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Today's Total: <span className="font-bold text-foreground">₹{todayTotal.toLocaleString()}</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No expenses recorded yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        expenses.map((expense) => (
                          <TableRow key={expense._id}>
                            <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">{expense.title}</TableCell>
                            <TableCell className="font-semibold">₹{expense.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  expense.payment_mode === "Cash"
                                    ? "bg-green-100 text-green-700"
                                    : expense.payment_mode === "UPI"
                                      ? "bg-blue-100 text-blue-700"
                                      : expense.payment_mode === "Card"
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {expense.payment_mode}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{expense.notes || "-"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(expense._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
