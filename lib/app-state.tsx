"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export interface ThaliItem {
  id: string
  date: string
  itemName: string
  category: string
}

export interface Order {
  id: string
  orderId: string // 8-digit unique order ID
  date: string
  time: string
  customerName: string
  customerPhone?: string
  tableNumber?: number
  persons: number
  perThaliPrice: number
  totalAmount: number
  paymentMode: "cash" | "online" | "card"
  thaliPrice?: number
}

interface AppState {
  // Daily Thali Menu
  thaliItems: ThaliItem[]
  addThaliItem: (item: Omit<ThaliItem, "id">) => void
  updateThaliItem: (id: string, item: Partial<ThaliItem>) => void
  deleteThaliItem: (id: string) => void
  getThaliItemsByDate: (date: string) => ThaliItem[]

  // Orders
  orders: Order[]
  orderIdCounter: number
  addOrder: (order: Omit<Order, "id" | "orderId">) => void
  getOrdersByDate: (date: string) => Order[]
  getOrdersByPaymentMode: (date: string, mode: "cash" | "online" | "card") => Order[]

  // Stats
  getDailyStats: (date: string) => {
    totalOrders: number
    totalRevenue: number
    cashIncome: number
    onlineIncome: number
    cardIncome: number
    menuItems: number
  }
  getWeeklyStats: () => Array<{
    date: string
    day: string
    revenue: number
    orders: number
  }>
}

const AppStateContext = createContext<AppState | undefined>(undefined)

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [thaliItems, setThaliItems] = useState<ThaliItem[]>(() => {
    // Load thaliItems from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thaliItems')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [orders, setOrders] = useState<Order[]>(() => {
    // Load orders from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orders')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [orderIdCounter, setOrderIdCounter] = useState(() => {
    // Load counter from localStorage, default to 1 if not found
    if (typeof window !== 'undefined') {
      // Temporarily reset to 1 for testing
      localStorage.setItem('orderIdCounter', '1')
      return 1
    }
    return 1
  })

  // Save counter to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderIdCounter', orderIdCounter.toString())
    }
  }, [orderIdCounter])

  // Save thaliItems to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('thaliItems', JSON.stringify(thaliItems))
    }
  }, [thaliItems])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('orders', JSON.stringify(orders))
    }
  }, [orders])

  const addThaliItem = useCallback((item: Omit<ThaliItem, "id">) => {
    const newItem: ThaliItem = {
      ...item,
      id: Date.now().toString(),
    }
    setThaliItems((prev) => [...prev, newItem])
  }, [])

  const updateThaliItem = useCallback((id: string, item: Partial<ThaliItem>) => {
    setThaliItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)))
  }, [])

  const deleteThaliItem = useCallback((id: string) => {
    setThaliItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getThaliItemsByDate = useCallback(
    (date: string) => {
      return thaliItems.filter((t) => t.date === date)
    },
    [thaliItems],
  )

  const addOrder = useCallback((order: Omit<Order, "id" | "orderId">) => {
    const orderId = orderIdCounter.toString().padStart(8, '0') // Generate 8-digit ID
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderId,
    }
    setOrders((prev) => [...prev, newOrder])
    setOrderIdCounter((prev) => prev + 1) // Increment counter for next order
  }, [orderIdCounter])

  const getOrdersByDate = useCallback(
    (date: string) => {
      return orders.filter((o) => o.date === date)
    },
    [orders],
  )

  const getOrdersByPaymentMode = useCallback(
    (date: string, mode: "cash" | "online" | "card") => {
      return orders.filter((o) => o.date === date && o.paymentMode === mode)
    },
    [orders],
  )

  const getDailyStats = useCallback(
    (date: string) => {
      const dateOrders = getOrdersByDate(date)
      const dateThaliItems = getThaliItemsByDate(date)

      const totalOrders = dateOrders.length
      const totalRevenue = dateOrders.reduce((sum, o) => sum + o.totalAmount, 0)
      const cashIncome = getOrdersByPaymentMode(date, "cash").reduce((sum, o) => sum + o.totalAmount, 0)
      const onlineIncome = getOrdersByPaymentMode(date, "online").reduce((sum, o) => sum + o.totalAmount, 0)
      const cardIncome = getOrdersByPaymentMode(date, "card").reduce((sum, o) => sum + o.totalAmount, 0)
      const menuItems = dateThaliItems.length

      return {
        totalOrders,
        totalRevenue,
        cashIncome,
        onlineIncome,
        cardIncome,
        menuItems,
      }
    },
    [getOrdersByDate, getThaliItemsByDate, getOrdersByPaymentMode],
  )

  const getWeeklyStats = useCallback(() => {
    const stats = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

      const dayOrders = getOrdersByDate(dateStr)
      const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0)

      stats.push({
        date: dateStr,
        day: dayName,
        revenue,
        orders: dayOrders.length,
      })
    }
    return stats
  }, [getOrdersByDate])

  const value: AppState = {
    thaliItems,
    addThaliItem,
    updateThaliItem,
    deleteThaliItem,
    getThaliItemsByDate,
    orders,
    orderIdCounter,
    addOrder,
    getOrdersByDate,
    getOrdersByPaymentMode,
    getDailyStats,
    getWeeklyStats,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within AppStateProvider")
  }
  return context
}
