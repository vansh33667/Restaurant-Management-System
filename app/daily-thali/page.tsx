"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/storage"
import { useAppState } from "@/lib/app-state"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const categories = ["Sabji", "Dal", "Rice", "Roti", "Sweet", "Farsan", "Salad", "Papad", "Other"]

export default function DailyThaliPage() {
  const router = useRouter()
  const { toast } = useToast()
  const appState = useAppState()
  const [user, setUser] = useState<any>(null)
  const [thalis, setThalis] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingThali, setEditingThali] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadThalis()
  }, [router, selectedDate])

  const loadThalis = () => {
    const filtered = appState.getThaliItemsByDate(selectedDate)
    setThalis(filtered)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/menu001', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: selectedDate,
          item_name: formData.itemName,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to add menu item')
      }

      toast({ title: "Success", description: "Menu item added successfully" })

      // Also add to local state for UI
      appState.addThaliItem({
        date: selectedDate,
        itemName: formData.itemName,
        category: formData.category,
      })

    } catch (error) {
      console.error('Error adding menu item:', error)
      toast({ title: "Error", description: error.message || "Failed to add menu item", variant: "destructive" })
    }

    setIsDialogOpen(false)
    setEditingThali(null)
    setFormData({ itemName: "", category: "" })
    loadThalis()
  }

  const handleEdit = (thali: any) => {
    setEditingThali(thali)
    setFormData({
      itemName: thali.itemName,
      category: thali.category,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      appState.deleteThaliItem(id)
      toast({ title: "Success", description: "Thali item deleted successfully" })
      loadThalis()
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingThali(null)
    setFormData({ itemName: "", category: "" })
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Daily Thali Menu</h1>
              <p className="text-muted-foreground">Manage today's thali items</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleDialogClose()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingThali ? "Edit Thali Item" : "Add Thali Item"}</DialogTitle>
                    <DialogDescription>Enter the details for today's thali menu item</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="itemName">Item Name</Label>
                        <Input
                          id="itemName"
                          value={formData.itemName}
                          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button type="submit">{editingThali ? "Update" : "Add"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Date Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="date" className="text-sm font-medium">
                  Select Date:
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Thali Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Thali Items for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {thalis.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added for this date. Click "Add Item" to start.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {thalis.map((thali) => (
                      <TableRow key={thali.id}>
                        <TableCell className="font-medium">{thali.itemName}</TableCell>
                        <TableCell>{thali.category}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(thali)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(thali.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingThali ? "Edit Thali Item" : "Add Thali Item"}</DialogTitle>
            <DialogDescription>Enter the details for today's thali menu item</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">{editingThali ? "Update" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
