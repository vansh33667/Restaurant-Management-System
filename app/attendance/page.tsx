"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  getCurrentUser,
  getItems,
  addItem,
  updateItem,
  type Worker,
  type Attendance,
  initializeData,
} from "@/lib/storage"
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { status: "Present" | "Absent" | "Half Day" | "Leave"; notes: string }>
  >({})

  useEffect(() => {
    initializeData()
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadData()
  }, [router, selectedDate])

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

        const today = new Date().toISOString().split("T")[0]

        let todayAttendance: Attendance[] = []
        if (selectedDate === today) {
          todayAttendance = getItems<Attendance>("attendanceToday")
        } else {
          const allAttendance = getItems<Attendance>("attendance")
          todayAttendance = allAttendance.filter((a) => a.date === selectedDate)
        }
        setAttendance(todayAttendance)

        // Initialize attendance data
        const attendanceData: Record<string, { status: "Present" | "Absent" | "Half Day" | "Leave"; notes: string }> = {}
        fetchedWorkers.forEach((worker) => {
          const existing = todayAttendance.find((a) => a.workerId === worker._id)
          attendanceData[worker._id] = {
            status: existing?.status || "Present",
            notes: existing?.notes || "",
          }
        })
        setAttendanceData(attendanceData)
      } else {
        throw new Error(data.error || 'Failed to load workers')
      }
    } catch (error) {
      console.error('Error loading workers:', error)
      toast({ title: "Error", description: "Failed to load workers", variant: "destructive" })
    }
  }

  const handleStatusChange = (workerId: string, status: "Present" | "Absent" | "Half Day" | "Leave") => {
    setAttendanceData({
      ...attendanceData,
      [workerId]: { ...attendanceData[workerId], status },
    })
  }

  const handleNotesChange = (workerId: string, notes: string) => {
    setAttendanceData({
      ...attendanceData,
      [workerId]: { ...attendanceData[workerId], notes },
    })
  }

  const handleSubmitAttendance = async () => {
    try {
      const attendanceRecords = workers.map((worker) => {
        const data = attendanceData[worker._id]
        if (!data) return null

        return {
          attendance_date: selectedDate,
          worker_name: worker.worker_name,
          role: worker.role,
          status: data.status,
          notes: data.notes || '',
        }
      }).filter(record => record !== null)

      if (attendanceRecords.length === 0) {
        toast({ title: "Warning", description: "No attendance data to save", variant: "destructive" })
        return
      }

      const response = await fetch('/api/worker_attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceRecords),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save attendance')
      }

      toast({ title: "Success", description: `Attendance saved successfully for ${result.insertedCount} workers` })

      // Reset form to fresh state
      const freshData: Record<string, { status: "Present" | "Absent" | "Half Day" | "Leave"; notes: string }> = {}
      workers.forEach((worker) => {
        freshData[worker._id] = {
          status: "Present",
          notes: "",
        }
      })
      setAttendanceData(freshData)
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast({ title: "Error", description: error.message || "Failed to save attendance", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Present":
        return <Badge className="bg-green-500">Present</Badge>
      case "Absent":
        return <Badge className="bg-red-500">Absent</Badge>
      case "Half Day":
        return <Badge className="bg-yellow-500">Half Day</Badge>
      case "Leave":
        return <Badge className="bg-blue-500">Leave</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAttendanceStats = () => {
    const present = Object.values(attendanceData).filter((d) => d.status === "Present").length
    const absent = Object.values(attendanceData).filter((d) => d.status === "Absent").length
    const halfDay = Object.values(attendanceData).filter((d) => d.status === "Half Day").length
    const leave = Object.values(attendanceData).filter((d) => d.status === "Leave").length
    return { present, absent, halfDay, leave }
  }

  const stats = getAttendanceStats()

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Worker Attendance</h1>
              <p className="text-muted-foreground">Mark daily attendance for workers</p>
            </div>
            <Button onClick={handleSubmitAttendance} size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Half Day
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.halfDay}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.leave}</div>
              </CardContent>
            </Card>
          </div>

          {/* Date Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="date" className="text-sm font-medium">
                  Attendance Date:
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

          {/* Attendance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {workers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active workers found. Please add workers first.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker._id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{worker.worker_name}</div>
                            <div className="text-xs text-muted-foreground">{worker.mobile_no}</div>
                          </div>
                        </TableCell>
                        <TableCell>{worker.role}</TableCell>
                        <TableCell>
                          <Select
                            value={attendanceData[worker._id]?.status || "Present"}
                            onValueChange={(value: any) => handleStatusChange(worker._id, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Present">Present</SelectItem>
                              <SelectItem value="Absent">Absent</SelectItem>
                              <SelectItem value="Half Day">Half Day</SelectItem>
                              <SelectItem value="Leave">Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add notes (optional)"
                            value={attendanceData[worker._id]?.notes || ""}
                            onChange={(e) => handleNotesChange(worker._id, e.target.value)}
                            className="max-w-xs"
                          />
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
