"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser, getItems, updateItem, type Table, initializeData } from "@/lib/storage"
import { TableProperties, CheckCircle2, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function TablesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    status: "Open" as Table["status"],
    customerName: "",
    customerPhone: "",
    persons: 0,
    notes: "",
  })

  useEffect(() => {
    initializeData()
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadTables()
  }, [router])

  const loadTables = () => {
    const allTables = getItems<Table>("tables")
    setTables(allTables.sort((a, b) => a.tableNumber - b.tableNumber))
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    setFormData({
      status: table.status,
      customerName: table.customerName || "",
      customerPhone: table.customerPhone || "",
      persons: table.persons || 0,
      notes: table.notes || "",
    })
    setIsDialogOpen(true)
  }

  const handleUpdateTable = () => {
    if (!selectedTable) return

    const updatedTable: Table = {
      ...selectedTable,
      status: formData.status,
      customerName: formData.status === "Open" ? undefined : formData.customerName,
      customerPhone: formData.status === "Open" ? undefined : formData.customerPhone,
      persons: formData.status === "Open" ? undefined : formData.persons,
      notes: formData.status === "Open" ? undefined : formData.notes,
      reservedAt: formData.status === "Open" ? undefined : new Date().toISOString(),
    }

    updateItem("tables", selectedTable.id, updatedTable)
    toast({ title: "Success", description: "Table updated successfully" })
    setIsDialogOpen(false)
    loadTables()
  }

  const getStatusIcon = (status: Table["status"]) => {
    switch (status) {
      case "Open":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "Reserved":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "Booked":
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "Open":
        return "border-green-200 bg-green-50 hover:bg-green-100"
      case "Reserved":
        return "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
      case "Booked":
        return "border-red-200 bg-red-50 hover:bg-red-100"
    }
  }

  const stats = {
    open: tables.filter((t) => t.status === "Open").length,
    reserved: tables.filter((t) => t.status === "Reserved").length,
    booked: tables.filter((t) => t.status === "Booked").length,
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Table Management</h1>
            <p className="text-muted-foreground">Manage table bookings and reservations</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Open Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.open}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Reserved Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Booked Tables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.booked}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tables Grid */}
          <Card>
            <CardHeader>
              <CardTitle>All Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all cursor-pointer",
                      getStatusColor(table.status),
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <TableProperties className="h-8 w-8 text-muted-foreground" />
                      <div className="font-bold text-lg">Table {table.tableNumber}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(table.status)}
                        <span className="font-medium">{table.status}</span>
                      </div>
                      {table.customerName && (
                        <div className="text-xs text-muted-foreground truncate w-full text-center">
                          {table.customerName}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Update Table Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Table {selectedTable?.tableNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Table Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Booked">Booked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status !== "Open" && (
              <>
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer Phone</Label>
                  <Input
                    placeholder="Enter phone number"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Persons</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Enter persons"
                    value={formData.persons || ""}
                    onChange={(e) => setFormData({ ...formData, persons: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Any special notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTable}>Update Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
