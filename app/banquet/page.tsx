"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  getCurrentUser,
  getItems,
  addItem,
  updateItem,
  deleteItem,
  initializeData,
  type BanquetHall,
  type BanquetBooking,
  type BanquetPayment,
} from "@/lib/storage"
import { Plus, Eye, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function BanquetPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [halls, setHalls] = useState<BanquetHall[]>([])
  const [bookings, setBookings] = useState<BanquetBooking[]>([])
  const [payments, setPayments] = useState<BanquetPayment[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BanquetBooking | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  const [formData, setFormData] = useState<Partial<BanquetBooking>>({
    hallId: "1",
    customerName: "",
    customerPhone: "",
    alternatePhone: "",
    address: "",
    eventType: "Wedding",
    eventDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "22:00",
    expectedGuests: 100,
    decoration: false,
    soundSystem: false,
    stageRequired: false,
    menuType: "Veg",
    menuPackage: "",
    pricePerPlate: 500,
    numberOfPlates: 100,
    specialInstructions: "",
    totalAmount: 0,
    advancePaid: 0,
    paymentMode: "Cash",
    paymentStatus: "Pending",
    bookingStatus: "Tentative",
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMode: "Cash" as const,
  })

  useEffect(() => {
    const initData = async () => {
      initializeData()
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/")
        return
      }
      setUser(currentUser)
      await loadData()
    }
    initData()
  }, [router])

  const loadData = async () => {
    try {
      const response = await fetch('/api/banquet_management')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Convert MongoDB documents to the expected format
          const formattedBookings = data.data.map((booking: any) => ({
            id: booking._id.toString(),
            hallId: "1", // Default hall ID
            customerName: booking.customer_name,
            customerPhone: booking.phone_number,
            alternatePhone: booking.alternate_phone,
            address: booking.address,
            eventType: booking.event_type,
            eventDate: booking.event_date,
            startTime: booking.start_time,
            endTime: booking.end_time,
            expectedGuests: booking.expected_guests,
            decoration: booking.amenities_required?.includes('Decoration') || false,
            soundSystem: booking.amenities_required?.includes('Sound System') || false,
            stageRequired: booking.amenities_required?.includes('Stage') || false,
            menuType: booking.food_type,
            menuPackage: booking.menu_package,
            pricePerPlate: booking.price_per_plate,
            numberOfPlates: booking.number_of_plates,
            specialInstructions: booking.special_instructions,
            paymentDetails: booking.payment_details,
            advancePaid: booking.advance_payment || 0,
            paymentMode: booking.payment_mode,
            bookingStatus: booking.booking_status,
            totalAmount: (booking.price_per_plate || 0) * (booking.number_of_plates || 0),
            remainingAmount: ((booking.price_per_plate || 0) * (booking.number_of_plates || 0)) - (booking.advance_payment || 0),
            createdBy: "Admin",
            createdAt: booking.created_at,
            modifiedAt: booking.created_at,
          }))
          setBookings(formattedBookings)
        }
      }
    } catch (error) {
      console.error('Failed to load banquet bookings:', error)
    }

    // Keep local storage for halls (if needed)
    setHalls(getItems<BanquetHall>("banquetHalls"))
    setPayments(getItems<BanquetPayment>("banquetPayments"))
  }

  const calculateTotal = () => {
    const hall = halls.find((h) => h.id === formData.hallId)
    if (!hall) return 0

    const foodTotal = (formData.pricePerPlate || 0) * (formData.numberOfPlates || 0)
    const hallCharge = hall.basePrice
    const total = foodTotal + hallCharge

    setFormData({ ...formData, totalAmount: total })
  }

  useEffect(() => {
    calculateTotal()
  }, [formData.pricePerPlate, formData.numberOfPlates, formData.hallId])

  const checkDoubleBooking = (date: string, startTime: string, endTime: string, excludeId?: string) => {
    return bookings.some(
      (booking) =>
        booking.id !== excludeId &&
        booking.eventDate === date &&
        booking.bookingStatus !== "Cancelled" &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)),
    )
  }

  const handleSubmitBooking = async () => {
    if (!formData.customerName || !formData.customerPhone || !formData.eventDate) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" })
      return
    }

    try {
      const bookingData = {
        event_date: formData.eventDate,
        customer_name: formData.customerName,
        phone_number: formData.customerPhone,
        alternate_phone: formData.alternatePhone || undefined,
        address: formData.address || undefined,
        event_type: formData.eventType,
        start_time: formData.startTime,
        end_time: formData.endTime,
        expected_guests: formData.expectedGuests,
        amenities_required: [
          ...(formData.decoration ? ['Decoration'] : []),
          ...(formData.soundSystem ? ['Sound System'] : []),
          ...(formData.stageRequired ? ['Stage'] : [])
        ],
        food_type: formData.menuType,
        menu_package: formData.menuPackage,
        price_per_plate: formData.pricePerPlate || undefined,
        number_of_plates: formData.numberOfPlates || undefined,
        special_instructions: formData.specialInstructions || undefined,
        payment_details: formData.paymentDetails || undefined,
        advance_payment: formData.advancePaid || undefined,
        payment_mode: formData.paymentMode || undefined,
        booking_status: formData.bookingStatus || 'Tentative',
      }

      let response;
      if (selectedBooking) {
        // Update existing booking
        response = await fetch('/api/banquet_management', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedBooking.id,
            ...bookingData
          }),
        })
      } else {
        // Create new booking
        response = await fetch('/api/banquet_management', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        })
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save booking')
      }

      toast({ title: "Success", description: selectedBooking ? "Booking updated successfully" : "Booking created successfully" })

    } catch (error) {
      console.error('Error saving booking:', error)
      toast({ title: "Error", description: error.message || "Failed to save booking", variant: "destructive" })
    }

    setIsBookingDialogOpen(false)
    setSelectedBooking(null)
    resetForm()
    await loadData()
  }

  const handleAddPayment = async () => {
    if (!selectedBooking || paymentForm.amount <= 0) {
      toast({ title: "Error", description: "Invalid payment amount", variant: "destructive" })
      return
    }

    try {
      // Calculate new advance payment amount
      const currentAdvance = selectedBooking.advancePaid || 0;
      const newAdvancePayment = currentAdvance + paymentForm.amount;

      // Update booking with payment information
      const response = await fetch('/api/banquet_management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedBooking.id,
          advance_payment: newAdvancePayment,
          payment_mode: paymentForm.paymentMode,
          payment_details: `Payment of ₹${paymentForm.amount} added on ${new Date().toLocaleDateString()}`,
          booking_status: newAdvancePayment >= (selectedBooking.totalAmount || 0) ? 'Confirmed' : selectedBooking.bookingStatus,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to update payment')
      }

      toast({ title: "Success", description: "Payment recorded successfully" })

    } catch (error) {
      console.error('Error updating payment:', error)
      toast({ title: "Error", description: error.message || "Failed to update payment", variant: "destructive" })
    }

    setIsPaymentDialogOpen(false)
    setPaymentForm({ amount: 0, paymentMode: "Cash" })
    await loadData()
  }

  const handleDeleteBooking = async (id: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        const response = await fetch('/api/banquet_management', {
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
          throw new Error(data.error || 'Failed to delete booking')
        }

        toast({ title: "Success", description: "Booking deleted successfully" })
        await loadData()

      } catch (error) {
        console.error('Error deleting booking:', error)
        toast({ title: "Error", description: error.message || "Failed to delete booking", variant: "destructive" })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      hallId: "1",
      customerName: "",
      customerPhone: "",
      alternatePhone: "",
      address: "",
      eventType: "Wedding",
      eventDate: new Date().toISOString().split("T")[0],
      startTime: "10:00",
      endTime: "22:00",
      expectedGuests: 100,
      decoration: false,
      soundSystem: false,
      stageRequired: false,
      menuType: "Veg",
      menuPackage: "",
      pricePerPlate: 500,
      numberOfPlates: 100,
      specialInstructions: "",
      totalAmount: 0,
      advancePaid: 0,
      paymentMode: "Cash",
      paymentStatus: "Pending",
      bookingStatus: "Tentative",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "Tentative":
        return <Badge className="bg-yellow-500">Tentative</Badge>
      case "Cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "Completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-500">Paid</Badge>
      case "Partially Paid":
        return <Badge className="bg-yellow-500">Partially Paid</Badge>
      case "Pending":
        return <Badge className="bg-red-500">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const upcomingBookings = bookings
    .filter(
      (b) =>
        new Date(b.eventDate) >= new Date() && (b.bookingStatus === "Confirmed" || b.bookingStatus === "Tentative"),
    )
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())

  const todaysBookings = bookings.filter((b) => b.eventDate === new Date().toISOString().split("T")[0])

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Banquet Management</h1>
              <p className="text-muted-foreground">Manage hall bookings and events</p>
            </div>
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  onClick={() => {
                    resetForm()
                    setSelectedBooking(null)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{selectedBooking ? "Edit Booking" : "Create New Booking"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Customer Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Customer Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Customer Name *</Label>
                        <Input
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <Label>Phone Number *</Label>
                        <Input
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          placeholder="10 digit number"
                          type="tel"
                        />
                      </div>
                      <div>
                        <Label>Alternate Phone</Label>
                        <Input
                          value={formData.alternatePhone}
                          onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                          placeholder="Optional"
                          type="tel"
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Input
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Event Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Event Type *</Label>
                        <Select
                          value={formData.eventType}
                          onValueChange={(value: any) => setFormData({ ...formData, eventType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Wedding">Wedding</SelectItem>
                            <SelectItem value="Reception">Reception</SelectItem>
                            <SelectItem value="Birthday">Birthday</SelectItem>
                            <SelectItem value="Corporate">Corporate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Event Date *</Label>
                        <Input
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Start Time *</Label>
                        <Input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>End Time *</Label>
                        <Input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Expected Guests *</Label>
                        <Input
                          type="number"
                          value={formData.expectedGuests}
                          onChange={(e) =>
                            setFormData({ ...formData, expectedGuests: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-2">
                      <Label>Amenities Required</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.decoration}
                            onCheckedChange={(checked) => setFormData({ ...formData, decoration: checked as boolean })}
                          />
                          <Label>Decoration</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.soundSystem}
                            onCheckedChange={(checked) => setFormData({ ...formData, soundSystem: checked as boolean })}
                          />
                          <Label>Sound System</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.stageRequired}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, stageRequired: checked as boolean })
                            }
                          />
                          <Label>Stage</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food & Menu */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Food & Menu</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Menu Type *</Label>
                        <Select
                          value={formData.menuType}
                          onValueChange={(value: any) => setFormData({ ...formData, menuType: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Veg">Veg</SelectItem>
                            <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                            <SelectItem value="Both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Menu Package</Label>
                        <Input
                          value={formData.menuPackage}
                          onChange={(e) => setFormData({ ...formData, menuPackage: e.target.value })}
                          placeholder="e.g., Premium Package"
                        />
                      </div>
                      <div>
                        <Label>Price Per Plate *</Label>
                        <Input
                          type="number"
                          value={formData.pricePerPlate}
                          onChange={(e) =>
                            setFormData({ ...formData, pricePerPlate: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
                        <Label>Number of Plates *</Label>
                        <Input
                          type="number"
                          value={formData.numberOfPlates}
                          onChange={(e) =>
                            setFormData({ ...formData, numberOfPlates: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Special Instructions</Label>
                        <Textarea
                          value={formData.specialInstructions}
                          onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                          placeholder="Allergies, dietary requirements, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Total Amount</Label>
                        <Input type="number" value={formData.totalAmount} disabled />
                      </div>
                      <div>
                        <Label>Advance Paid</Label>
                        <Input
                          type="number"
                          value={formData.advancePaid}
                          onChange={(e) =>
                            setFormData({ ...formData, advancePaid: Number.parseInt(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div>
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
                            <SelectItem value="Bank">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Booking Status</Label>
                        <Select
                          value={formData.bookingStatus}
                          onValueChange={(value: any) => setFormData({ ...formData, bookingStatus: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tentative">Tentative</SelectItem>
                            <SelectItem value="Confirmed">Confirmed</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitBooking}>
                      {selectedBooking ? "Update Booking" : "Create Booking"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todaysBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.bookingStatus === "Confirmed").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tentative</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.bookingStatus === "Tentative").length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Alert */}
          {upcomingBookings.length > 0 && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                  <AlertCircle className="h-5 w-5" />
                  Upcoming Events Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between text-sm">
                      <span>
                        {booking.customerName} - {booking.eventType}
                      </span>
                      <span className="font-medium">
                        {new Date(booking.eventDate).toLocaleDateString()} at {booking.startTime}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No bookings found. Create your first booking!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings
                      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
                      .map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{booking.customerName}</div>
                              <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.eventType}</TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(booking.eventDate).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {booking.startTime} - {booking.endTime}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{booking.expectedGuests}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">₹{booking.totalAmount}</div>
                              <div className="text-xs text-muted-foreground">Paid: ₹{booking.advancePaid}</div>
                              <div className="text-xs text-red-600">Due: ₹{booking.remainingAmount}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getPaymentStatusBadge(booking.paymentStatus)}</TableCell>
                          <TableCell>{getStatusBadge(booking.bookingStatus)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBooking(booking)
                                  setFormData(booking)
                                  setIsBookingDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setPaymentForm({ amount: booking.remainingAmount, paymentMode: "Cash" })
                                    }}
                                    disabled={booking.remainingAmount <= 0}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Payment</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Amount to Pay</Label>
                                      <Input
                                        type="number"
                                        value={paymentForm.amount}
                                        onChange={(e) =>
                                          setPaymentForm({
                                            ...paymentForm,
                                            amount: Number.parseInt(e.target.value) || 0,
                                          })
                                        }
                                      />
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Remaining: ₹{selectedBooking?.remainingAmount}
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Payment Mode</Label>
                                      <Select
                                        value={paymentForm.paymentMode}
                                        onValueChange={(value: any) =>
                                          setPaymentForm({ ...paymentForm, paymentMode: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Cash">Cash</SelectItem>
                                          <SelectItem value="UPI">UPI</SelectItem>
                                          <SelectItem value="Bank">Bank Transfer</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleAddPayment}>Add Payment</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteBooking(booking.id)}>
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
