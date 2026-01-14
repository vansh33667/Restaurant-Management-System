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
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WorkersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [workers, setWorkers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    mobileNo: "",
    role: "",
    joiningDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    loadWorkers()
  }, [router])

  const loadWorkers = async () => {
    try {
      const response = await fetch('/api/workers')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (data.success) {
        setWorkers(data.data)
      } else {
        throw new Error(data.error || 'Failed to load workers')
      }
    } catch (error) {
      console.error('Error loading workers:', error)
      toast({ title: "Error", description: "Failed to load workers", variant: "destructive" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const workerData = {
        worker_name: formData.name,
        mobile_no: formData.mobileNo,
        role: formData.role,
        joining_date: formData.joiningDate,
      }

      if (editingWorker) {
        // Update existing worker
        const updateData = {
          id: editingWorker._id,
          ...workerData,
        }

        const response = await fetch('/api/workers', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to update worker')
        }

        toast({ title: "Success", description: "Worker updated successfully" })
      } else {
        // Add new worker
        const response = await fetch('/api/workers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workerData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to add worker')
        }

        toast({ title: "Success", description: "Worker added successfully" })
      }

      setIsDialogOpen(false)
      setEditingWorker(null)
      setFormData({ name: "", mobileNo: "", role: "", joiningDate: new Date().toISOString().split("T")[0] })
      await loadWorkers()
    } catch (error) {
      console.error('Error saving worker:', error)
      toast({ title: "Error", description: error.message || "Failed to save worker", variant: "destructive" })
    }
  }

  const handleEdit = (worker: any) => {
    setEditingWorker(worker)
    setFormData({
      name: worker.worker_name,
      mobileNo: worker.mobile_no || "",
      role: worker.role,
      joiningDate: worker.joining_date,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      try {
        const response = await fetch('/api/workers', {
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
          throw new Error(data.error || 'Failed to delete worker')
        }

        toast({ title: "Success", description: "Worker deleted successfully" })
        await loadWorkers()
      } catch (error) {
        console.error('Error deleting worker:', error)
        toast({ title: "Error", description: error.message || "Failed to delete worker", variant: "destructive" })
      }
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingWorker(null)
    setFormData({ name: "", mobileNo: "", role: "", joiningDate: new Date().toISOString().split("T")[0] })
  }

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.mobile_no && worker.mobile_no.includes(searchTerm)) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Worker Management</h1>
              <p className="text-muted-foreground">Manage your hotel workers</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingWorker ? "Edit Worker" : "Add New Worker"}</DialogTitle>
                  <DialogDescription>Enter the worker details below</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Worker Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter worker name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobileNo">Mobile Number *</Label>
                      <Input
                        id="mobileNo"
                        placeholder="Enter mobile number"
                        value={formData.mobileNo}
                        onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Input
                        id="role"
                        placeholder="e.g., Chef, Waiter, Cleaner"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joiningDate">Joining Date *</Label>
                      <Input
                        id="joiningDate"
                        type="date"
                        value={formData.joiningDate}
                        onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingWorker ? "Update" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{workers.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inactive Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search workers by name, mobile, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Workers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Workers List</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredWorkers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No workers found matching your search" : "No workers added yet"}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joining Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkers.map((worker) => (
                      <TableRow key={worker._id}>
                        <TableCell className="font-medium">{worker.worker_name}</TableCell>
                        <TableCell>{worker.mobile_no}</TableCell>
                        <TableCell>{worker.role}</TableCell>
                        <TableCell>{new Date(worker.joining_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(worker._id)}
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
    </div>
  )
}
