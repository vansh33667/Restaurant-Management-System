// API storage utilities for communicating with Next.js API routes

export interface Order {
  order_id: string;
  order_date: string;
  customer_name: string;
  customer_phone?: string;
  table_number?: number;
  num_of_persons: number;
  total_items: number;
  total_amount: number;
  payment_mode?: "cash" | "online" | "card";
}

const API_BASE_URL = '';

export async function getOrders(date: string): Promise<Order[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders?date=${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Failed to fetch orders');
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function saveOrder(order: Omit<Order, 'payment_mode'>): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save order');
    }
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}
