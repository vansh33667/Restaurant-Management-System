// Storage utilities for managing local data

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: "Admin" | "Cashier"
}

export interface Customer {
  id: string
  name: string
  mobileNo: string
  address: string
  createdAt: string
}

export interface MenuItem {
  id: string
  itemName: string
  category: string
  price: number
}

export interface DailyThali {
  id: string
  date: string
  itemName: string
  category: string
}

export interface Order {
  id: string
  date: string
  customerId: string
  customerName: string
  customerPhone: string
  tableNumber?: number
  persons: number
  perThaliPrice: number
  items: OrderItem[]
  totalAmount: number
  paymentMode: "Cash" | "Online" | "Card"
  createdBy: string
  createdAt: string
}

export interface OrderItem {
  itemId: string
  itemName: string
  quantity: number
  price: number
  total: number
}

export interface Worker {
  id: string
  name: string
  mobileNo: string
  role: string
  joiningDate: string
  isActive: boolean
  createdAt: string
}

export interface Attendance {
  id: string
  workerId: string
  workerName: string
  date: string
  status: "Present" | "Absent" | "Half Day" | "Leave"
  notes?: string
  markedBy: string
  markedAt: string
}

export interface Table {
  id: string
  tableNumber: number
  status: "Open" | "Booked" | "Reserved"
  customerName?: string
  customerPhone?: string
  persons?: number
  reservedAt?: string
  notes?: string
}

export interface SalesReport {
  date: string
  totalOrders: number
  totalAmount: number
  cashAmount: number
  onlineAmount: number
  cardAmount: number
}

export interface BanquetHall {
  id: string
  name: string
  capacity: number
  type: "AC" | "Non-AC"
  parkingAvailable: boolean
  basePrice: number
  extraHourCharge: number
  description: string
}

export interface BanquetBooking {
  id: string
  hallId: string
  customerName: string
  customerPhone: string
  alternatePhone?: string
  address?: string
  eventType: "Wedding" | "Reception" | "Birthday" | "Corporate" | "Other"
  eventDate: string
  startTime: string
  endTime: string
  expectedGuests: number
  decoration: boolean
  soundSystem: boolean
  stageRequired: boolean
  menuType: "Veg" | "Non-Veg" | "Both"
  menuPackage: string
  pricePerPlate: number
  numberOfPlates: number
  specialInstructions?: string
  totalAmount: number
  advancePaid: number
  remainingAmount: number
  paymentMode: "Cash" | "UPI" | "Bank"
  paymentStatus: "Pending" | "Partially Paid" | "Paid"
  bookingStatus: "Confirmed" | "Tentative" | "Cancelled" | "Completed"
  cancellationReason?: string
  refundAmount?: number
  createdBy: string
  createdAt: string
  modifiedAt?: string
}

export interface BanquetPayment {
  id: string
  bookingId: string
  amount: number
  paymentMode: "Cash" | "UPI" | "Bank"
  paidOn: string
  receivedBy: string
}

export interface WorkerSalary {
  id: string
  workerId: string
  workerName: string
  month: string
  monthlySalary: number
  advance: number
  bonus: number
  finalSalary: number
  createdBy: string
  createdAt: string
}

export interface DailyExpense {
  id: string
  date: string
  title: string
  amount: number
  paymentMode: "Cash" | "Online" | "Card"
  notes?: string
  createdBy: string
  createdAt: string
}

// Initialize default data
export const initializeData = () => {
  if (typeof window === "undefined") return

  const defaultUsers: User[] = [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      name: "Administrator",
      role: "Admin",
    },
    {
      id: "2",
      username: "casher123",
      password: "8696",
      name: "Cashier",
      role: "Cashier",
    },
  ]
  localStorage.setItem("users", JSON.stringify(defaultUsers))

  // Initialize other collections
  if (!localStorage.getItem("customers")) {
    localStorage.setItem("customers", JSON.stringify([]))
  }
  if (!localStorage.getItem("menuItems")) {
    localStorage.setItem("menuItems", JSON.stringify([]))
  }
  if (!localStorage.getItem("dailyThalis")) {
    localStorage.setItem("dailyThalis", JSON.stringify([]))
  }
  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify([]))
  }
  if (!localStorage.getItem("workers")) {
    localStorage.setItem("workers", JSON.stringify([]))
  }
  if (!localStorage.getItem("attendance")) {
    localStorage.setItem("attendance", JSON.stringify([]))
  }
  if (!localStorage.getItem("attendanceToday")) {
    localStorage.setItem("attendanceToday", JSON.stringify([]))
  }
  if (!localStorage.getItem("lastAttendanceDate")) {
    localStorage.setItem("lastAttendanceDate", new Date().toISOString().split("T")[0])
  }

  // Check for new day and reset attendance
  const today = new Date().toISOString().split("T")[0]
  const lastDate = localStorage.getItem("lastAttendanceDate")
  if (today !== lastDate) {
    // Save yesterday's attendance to historical
    const yesterdayAttendance = getItems<Attendance>("attendanceToday")
    if (yesterdayAttendance.length > 0) {
      const historical = getItems<Attendance>("attendance")
      yesterdayAttendance.forEach(att => {
        att.date = lastDate || today // set to last date
        historical.push(att)
      })
      saveItems("attendance", historical)
    }
    // Clear today's attendance
    localStorage.setItem("attendanceToday", JSON.stringify([]))
    localStorage.setItem("lastAttendanceDate", today)
  }
}

// Generic storage functions
export const getItems = <T,>(key: string): T[] => {
  if (typeof window === "undefined") return []
  const items = localStorage.getItem(key)
  return items ? JSON.parse(items) : []
}

export const saveItems = <T,>(key: string, items: T[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(items))
}

export const addItem = <T extends { id: string }>(key: string, item: T): void => {
  const items = getItems<T>(key)
  items.push(item)
  saveItems(key, items)
}

export const updateItem = <T extends { id: string }>(key: string, id: string, updatedItem: T): void => {
  const items = getItems<T>(key)
  const index = items.findIndex((item) => item.id === id)
  if (index !== -1) {
    items[index] = updatedItem
    saveItems(key, items)
  }
}

export const deleteItem = <T extends { id: string }>(key: string, id: string): void => {
  const items = getItems<T>(key)
  const filtered = items.filter((item) => item.id !== id)
  saveItems(key, filtered)
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("currentUser")
  return user ? JSON.parse(user) : null
}

export const logout = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("currentUser")
}
