"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppState, type Order } from "@/lib/app-state"
import { getCurrentUser } from "@/lib/storage"
import { getOrders, saveOrder, type Order as ApiOrder } from "@/lib/api-storage"
import { ShoppingCart, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OrdersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const appState = useAppState()
  const [user, setUser] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [tableNumber, setTableNumber] = useState<number>(0)
  const [persons, setPersons] = useState(1)
  const [perThaliPrice, setPerThaliPrice] = useState(0)
  const [paymentMode, setPaymentMode] = useState<"cash" | "online" | "card">("cash")
  const [currentTime, setCurrentTime] = useState("")
  const [nextOrderId, setNextOrderId] = useState("00000001")
  const [orders, setOrders] = useState<Order[]>([])

  const dailyThaliItems = appState.getThaliItemsByDate(selectedDate)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/")
      return
    }
    setUser(currentUser)
    loadCounter()
    loadOrders()
  }, [router, selectedDate])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      setCurrentTime(timeString)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const loadCounter = async () => {
    try {
      const response = await fetch('/api/counter')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          updateNextOrderId(data.seq)
        }
      }
    } catch (error) {
      console.error('Failed to load counter', error)
    }
  }

  const updateNextOrderId = (seq: number) => {
    const nextId = (seq + 1).toString().padStart(8, '0')
    setNextOrderId(nextId)
  }

  const loadOrders = async () => {
    try {
      const data = appState.getOrdersByDate(selectedDate)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders', error)
    }
  }

  const calculateTotal = useMemo(() => {
    return persons * perThaliPrice
  }, [persons, perThaliPrice])

  const handleSubmitOrder = useCallback(async () => {
    if (!customerName.trim()) {
      toast({ title: "Error", description: "Please enter customer name", variant: "destructive" })
      return
    }

    if (persons <= 0) {
      toast({ title: "Error", description: "Please enter valid number of persons", variant: "destructive" })
      return
    }

    if (perThaliPrice <= 0) {
      toast({ title: "Error", description: "Please enter valid per thali price", variant: "destructive" })
      return
    }

    const now = new Date()
    const orderTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })

    const items = dailyThaliItems.map(item => ({
      name: item.itemName,
      category: item.category,
      quantity: persons, // assuming quantity per item is persons
      price: perThaliPrice / dailyThaliItems.length // distribute price
    }))

    const orderData = {
      order_date: selectedDate,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim() || undefined,
      table_number: tableNumber > 0 ? tableNumber : undefined,
      num_of_persons: persons,
      total_items: dailyThaliItems.length * persons,
      total_amount: calculateTotal,
      items: items
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to save order')
      }
      // Also add to local state for UI
      appState.addOrder({
        orderId: data.order_id, // Use the generated order_id from DB
        date: selectedDate,
        time: now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        tableNumber: tableNumber > 0 ? tableNumber : undefined,
        persons: persons,
        perThaliPrice: perThaliPrice,
        totalAmount: calculateTotal,
        paymentMode: paymentMode,
      })
      loadOrders() // reload orders
      // reset form
      setCustomerName("")
      setCustomerPhone("")
      setTableNumber(0)
      setPersons(1)
      setPerThaliPrice(0)
      setPaymentMode("cash")
      toast({
        title: "Success",
        description: `Order placed successfully with ID ${data.order_id}`,
      })
      // Update next order ID
      updateNextOrderId(parseInt(data.order_id))
    } catch (error) {
      console.error('Error saving order:', error)
      toast({ title: "Error", description: error.message || "Failed to save order", variant: "destructive" })
    }

    setCustomerName("")
    setCustomerPhone("")
    setTableNumber(0)
    setPersons(1)
    setPerThaliPrice(0)
    setPaymentMode("cash")
  }, [customerName, persons, perThaliPrice, dailyThaliItems, selectedDate, customerPhone, tableNumber, calculateTotal, paymentMode, toast, appState, loadOrders, updateNextOrderId])

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Entry</h1>
              <p className="text-muted-foreground">Create new thali orders</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-lg">
              <Clock className="h-5 w-5 text-rose-600" />
              <div>
                <p className="text-xs text-muted-foreground">Current Time</p>
                <p className="text-lg font-bold text-rose-600 tabular-nums">{currentTime}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="order-date">Select Date</Label>
                    <Input
                      id="order-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Customer Phone (Optional)</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number (Optional)</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      min="0"
                      placeholder="Enter table number"
                      value={tableNumber || ""}
                      onChange={(e) => setTableNumber(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="persons">Number of Persons *</Label>
                      <Input
                        id="persons"
                        type="number"
                        min="1"
                        placeholder="Enter persons"
                        value={persons || ""}
                        onChange={(e) => setPersons(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="perThaliPrice">Per Thali Price (₹) *</Label>
                      <Input
                        id="perThaliPrice"
                        type="number"
                        min="0"
                        placeholder="Enter price"
                        value={perThaliPrice || ""}
                        onChange={(e) => setPerThaliPrice(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMode">Payment Mode</Label>
                    <Select value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
                      <SelectTrigger id="paymentMode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Thali Menu ({selectedDate})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dailyThaliItems.map((item) => {
                      const colors = [
                        "from-rose-400 to-orange-400",
                        "from-purple-400 to-pink-400",
                        "from-blue-400 to-cyan-400",
                        "from-green-400 to-teal-400",
                        "from-yellow-400 to-orange-400",
                      ]
                      const colorIndex = item.itemName.charCodeAt(0) % colors.length
                      return (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold`}
                          >
                            {item.itemName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-bold text-blue-600">{nextOrderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Persons:</span>
                      <span className="font-medium">{persons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Per Thali Price:</span>
                      <span className="font-medium">₹{perThaliPrice}</span>
                    </div>
                    {tableNumber > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Table Number:</span>
                        <span className="font-medium">{tableNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Mode:</span>
                      <span className="font-medium capitalize">{paymentMode}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Total Amount:</span>
                      <span className="text-rose-600">₹{calculateTotal}</span>
                    </div>
                  </div>

                  <Button onClick={handleSubmitOrder} className="w-full" size="lg">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Menu Items Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">
                    {dailyThaliItems.length}
                    <span className="text-sm text-muted-foreground font-normal ml-2">items</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
