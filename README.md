# 🍽️ Restaurant & Banquet Management System  
### *Padharo Thal & Banquet – Complete Hotel Software*

This is a **full-scale Restaurant & Banquet Management System** built for real-world hotel operations.  
The system is designed to handle **daily orders, thali menu, banquet bookings, workers, attendance, salary, expenses, reports, and security** in one place.

It is not a demo project – it is a **production-ready business application** built for actual restaurant use.

---

## 🚀 Technology Stack

- **Frontend:** Modern Web Interface (React / Next.js style)
- **Backend:** Node.js based API
- **Database:** MongoDB
- **Authentication:** Role-based Login System
- **Architecture:** Real-time sync, persistent data, zero data loss

All data is stored in **MongoDB** and survives:
- Page refresh  
- Browser restart  
- Logout / Login  
- System restart  

---

## 👤 User Roles

This system has **two separate accounts**:

### 🔐 1. Admin Account  
Admin has **full control** over the restaurant and banquet operations.

#### Admin Dashboard
Shows live business data:

- Today’s Orders  
- Today’s Revenue  
- Cash Income  
- Online Income  
- Card Income  
- Total Menu Items for Today  
- Weekly Revenue Chart (Auto-updating)

All values update **instantly** when a new order is placed.

---

### 🧾 Order Management (Admin & Cashier)

- Place orders from Order Entry page  
- Each order generates an **8-digit unique Order ID**
  - Example: `00000001`, `00000002`, `00000003`  
- Order ID is **persistent**  
  - Does not reset on refresh  
  - Does not reset on logout  
  - Continues from last order  
- Order Summary and Bill always show Order ID  
- Orders are saved directly into MongoDB

---

### 🍛 Daily Thali Menu (Admin)

- Add today’s thali menu  
- Store all items in one record  
- Menu instantly reflects on:
  - Order Entry Page  
  - Dashboard  
- If today’s menu is not added, Order Entry shows warning  
- Premium “Our Special Thali” style UI

---

### 🎉 Banquet Management (Admin)

Complete event booking system:

- Create New Booking  
- Store:
  - Event Date  
  - Customer Name  
  - Phone & Alternate Phone  
  - Address  
  - Event Type  
  - Start Time / End Time  
  - Expected Guests  
  - Amenities (Checkboxes):
    - Decoration  
    - Sound System  
    - Stage  
  - Food Type:
    - Veg  
    - Non-Veg  
    - Both  
  - Menu Package  
  - Price Per Plate  
  - Number of Plates  
  - Special Instructions  
  - Payment Details  
  - Advance Payment  
  - Payment Mode (Cash / UPI / Bank Transfer)  
  - Booking Status (Tentative / Confirmed / Completed / Cancelled)

#### Advanced Controls:
- 👁️ Eye Icon → View & Edit Booking  
- 💳 Payment Icon → Update Payment Details  

All updates modify the **same MongoDB document**.  
No duplicate records are created.

---

### 👷 Workers Management (Admin)

- Add Worker:
  - Name  
  - Mobile  
  - Role  
  - Joining Date  

Workers are stored in MongoDB and automatically sync with:

- Worker Attendance Page  
- Cashier Salary Module  

Workers Management is the **single source of truth**.

---

### 📅 Worker Attendance (Admin)

- Daily attendance system  
- Fields:
  - Date  
  - Worker Name  
  - Role  
  - Status:
    - Present  
    - Absent  
    - Half Day  
    - Leave  
  - Notes (up to 50,000 characters)

Features:
- Attendance saved directly to MongoDB  
- New day starts automatically at **12:00 AM**  
- Workers list always comes from Workers Management  

---

## 💼 Cashier Account

Cashier handles daily operations.

### 🛒 Order Entry
- Place customer orders  
- Select payment mode  
- Orders saved to MongoDB  
- Unique 8-digit Order ID shown  

---

### 💰 Daily Expenses (Cashier)

- Add:
  - Date  
  - Title  
  - Amount  
  - Payment Mode  
  - Notes  
- Each click creates a **new MongoDB document**  
- No overwrite, full history maintained  

---

### 🧑‍💼 Worker Salary Management (Cashier)

- Month & Year based salary entry  
- For each worker:
  - Monthly Salary  
  - Advance  
  - Bonus  
  - Final Salary  

Button: **Save All Salary Records**

- Saves **all workers at once**  
- Uses `insertMany()`  
- One document per worker  
- Page refreshes after success  
- Ready for next month entry  

---

### 📈 Cashier Dashboard Graph

- Real-time revenue graph  
- Based on placed orders  
- Updates instantly  

---

## 🔒 Smart Login & Security System

Every login attempt is stored in MongoDB:

- Username  
- Date  
- Time  
- Status: YES / NO  
- Attempted Password (for failed attempts)

### Progressive Lock System:

| Wrong Attempts | Lock Time |
|----------------|-----------|
| 3              | 5 minutes |
| 6              | 10 minutes|
| 7              | 30 minutes|
| 8              | 90 minutes|
| 9+             | 3× growth |

Features:

- Live countdown timer on login page  
- Lock survives:
  - Page refresh  
  - Browser restart  
  - Logout  
- Correct password (`2026`) unlocks immediately  
- Auto redirect to Dashboard on success  

---

## 🗄️ MongoDB Collections

- `orders` – All orders  
- `thali_menu` – Daily menu  
- `banquet_management` – Event bookings  
- `workers` – Staff data  
- `worker_attendance` – Attendance records  
- `daily_expenses` – Cashier expenses  
- `worker_salary` / `Worker_Salary_Management` – Salary data  
- `order_counters` – Persistent Order ID  
- `login_logs` – Login history  
- `login_security` – Lock & attempts  

---

## ✨ Highlights

- Real-world production design  
- No data loss on refresh  
- Persistent Order ID system  
- Smart security with live timer  
- Real-time dashboard updates  
- Fully MongoDB-driven  
- Smooth & optimized UI  
- Built for real hotel operations  

---

This project is a **complete Restaurant & Banquet Management Solution** designed for real business use, not just a demo.

It combines **operations, finance, staff, security, and analytics** in one powerful system.
