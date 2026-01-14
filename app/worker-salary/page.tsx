"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WorkerSalaryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [workers, setWorkers] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [salaries, setSalaries] = useState<Record<string, any>>({})

  useEffect(() => {
    loadData()
  }, [router, selectedMonth])

  const loadData = async () => {
    try {
      const response = await fetch('/api/workers')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        const fetchedWorkers = data.data
        setWorkers(fetchedWorkers)

        const monthSalaries: Record<string, any> = {}

        fetchedWorkers.forEach((worker) => {
          const existingSalary = null // Since we're not loading from storage
          monthSalaries[worker._id] = existingSalary || {
            workerId: worker._id,
            workerName: worker.worker_name,
            monthlySalary: 0,
            advance: 0,
            bonus: 0,
          }
        })

        setSalaries(monthSalaries)
      } else {
        throw new Error(data.error || 'Failed to load workers')
      }
    } catch (error) {
      console.error('Error loading workers:', error)
    }
  }

  const handleSalaryChange = useCallback((workerId: string, field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setSalaries((prev) => ({
      ...prev,
      [workerId]: {
        ...prev[workerId],
        [field]: numValue,
        finalSalary:
          field === "monthlySalary"
            ? numValue + (prev[workerId]?.bonus || 0) - (prev[workerId]?.advance || 0)
            : field === "bonus"
              ? (prev[workerId]?.monthlySalary || 0) + numValue - (prev[workerId]?.advance || 0)
              : (prev[workerId]?.monthlySalary || 0) + (prev[workerId]?.bonus || 0) - numValue,
      },
    }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
      const monthYear = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      const salaryRecords = Object.keys(salaries).map((workerId) => {
        const salaryData = salaries[workerId]
        return {
          month_year: monthYear,
          worker_name: salaryData.workerName,
          monthly_salary: salaryData.monthlySalary || 0,
          advance: salaryData.advance || 0,
          bonus: salaryData.bonus || 0,
          final_salary: salaryData.finalSalary || 0,
        }
      }).filter(record => record.worker_name) // Only save records with valid worker name

      if (salaryRecords.length === 0) {
        toast({ title: "Warning", description: "No valid worker data to save", variant: "destructive" })
        return
      }

      const response = await fetch('/api/worker_salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaryRecords),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save salary records')
      }

      toast({ title: "Success", description: `Salary records saved successfully for ${data.insertedCount} workers` })
      loadData() // Reset the form after successful save
    } catch (error) {
      console.error('Error saving salary records:', error)
      toast({ title: "Error", description: error.message || "Failed to save salary records", variant: "destructive" })
    }
  }, [selectedMonth, salaries, toast, loadData])

  const totalSalary = useMemo(() => {
    return Object.values(salaries).reduce((sum, s) => sum + (s.finalSalary || 0), 0)
  }, [salaries])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Worker Salary Management</h1>
            <div className="flex items-center gap-4">
              <Label>Select Month:</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date()
                    date.setMonth(date.getMonth() - i)
                    const value = date.toISOString().slice(0, 7)
                    return (
                      <SelectItem key={value} value={value}>
                        {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Salary Entries for{" "}
                {new Date(selectedMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker Name</TableHead>
                      <TableHead>Monthly Salary (₹)</TableHead>
                      <TableHead>Advance (₹)</TableHead>
                      <TableHead>Bonus (₹)</TableHead>
                      <TableHead className="font-bold">Final Salary (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No active workers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      workers.map((worker) => {
                        const salary = salaries[worker._id] || {}
                        return (
                          <TableRow key={worker._id}>
                            <TableCell className="font-medium">{worker.worker_name}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={salary.monthlySalary || ""}
                                onChange={(e) => handleSalaryChange(worker._id, "monthlySalary", e.target.value)}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={salary.advance || ""}
                                onChange={(e) => handleSalaryChange(worker._id, "advance", e.target.value)}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={salary.bonus || ""}
                                onChange={(e) => handleSalaryChange(worker._id, "bonus", e.target.value)}
                                className="w-32"
                              />
                            </TableCell>
                            <TableCell className="font-bold text-lg">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-4 w-4 text-muted-foreground" />₹
                                {(salary.finalSalary || 0).toLocaleString()}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                    {workers.length > 0 && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="text-right font-bold text-lg">
                          Grand Total:
                        </TableCell>
                        <TableCell className="font-bold text-xl text-primary">
                          ₹{totalSalary.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSave} size="lg" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save All Salary Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
