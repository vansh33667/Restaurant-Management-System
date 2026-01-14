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
import { getCurrentUser, getItems, addItem, updateItem, deleteItem, type User, initializeData } from "@/lib/storage"
import { Plus, Pencil, Trash2, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "Cashier" as "Admin" | "Cashier",
  })

  useEffect(() => {
    initializeData()
    const user = getCurrentUser()
    if (!user) {
      router.push("/")
      return
    }

    // Only admin can access user management
    if (user.role !== "Admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can manage users",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    setCurrentUser(user)
    loadUsers()
  }, [router])

  const loadUsers = () => {
    const allUsers = getItems<User>("users")
    setUsers(allUsers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      const updated: User = {
        ...editingUser,
        username: formData.username,
        name: formData.name,
        role: formData.role,
        ...(formData.password && { password: formData.password }), // Only update password if provided
      }
      updateItem("users", editingUser.id, updated)
      toast({ title: "Success", description: "User updated successfully" })
    } else {
      // Check if username already exists
      const existingUser = users.find((u) => u.username === formData.username)
      if (existingUser) {
        toast({
          title: "Error",
          description: "Username already exists",
          variant: "destructive",
        })
        return
      }

      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      }
      addItem("users", newUser)
      toast({ title: "Success", description: "User added successfully" })
    }

    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({ username: "", password: "", name: "", role: "Cashier" })
    loadUsers()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: "", // Don't populate password for security
      name: user.name,
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    // Prevent deleting own account
    if (currentUser?.id === id) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      })
      return
    }

    // Prevent deleting last admin
    const adminUsers = users.filter((u) => u.role === "Admin")
    const userToDelete = users.find((u) => u.id === id)
    if (adminUsers.length === 1 && userToDelete?.role === "Admin") {
      toast({
        title: "Error",
        description: "Cannot delete the last administrator account",
        variant: "destructive",
      })
      return
    }

    if (confirm("Are you sure you want to delete this user?")) {
      deleteItem("users", id)
      toast({ title: "Success", description: "User deleted successfully" })
      loadUsers()
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({ username: "", password: "", name: "", role: "Cashier" })
  }

  if (!currentUser) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage system users and permissions</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleDialogClose()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
                  <DialogDescription>Enter user details and assign role</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={!!editingUser}
                        required
                      />
                      {editingUser && <p className="text-xs text-muted-foreground">Username cannot be changed</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required={!editingUser}
                        placeholder={editingUser ? "Leave blank to keep current password" : ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value: "Admin" | "Cashier") => setFormData({ ...formData, role: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Cashier">Cashier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingUser ? "Update" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No users found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.role === "Admin" && <Shield className="h-4 w-4 text-primary" />}
                            {user.role}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(user.id)}
                              className="text-destructive"
                              disabled={currentUser.id === user.id}
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

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Admin
                </p>
                <p className="text-muted-foreground ml-6">
                  Full access to all system features including user management
                </p>
              </div>
              <div>
                <p className="font-medium">Cashier</p>
                <p className="text-muted-foreground ml-6">
                  Can manage orders, customers, and view reports. No access to user management
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
