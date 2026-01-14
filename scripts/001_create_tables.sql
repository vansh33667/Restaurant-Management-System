-- Create users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tables table for table management
CREATE TABLE IF NOT EXISTS public.tables (
  id SERIAL PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'booked', 'reserved')),
  customer_name TEXT,
  customer_phone TEXT,
  persons INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_thali_menus table
CREATE TABLE IF NOT EXISTS public.daily_thali_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  per_thali_price DECIMAL(10, 2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_date DATE NOT NULL,
  order_time TIME NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  table_number INTEGER,
  persons INTEGER NOT NULL,
  per_thali_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'online', 'card')),
  menu_items JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  role TEXT NOT NULL,
  joining_date DATE NOT NULL,
  salary DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, date)
);

-- Create banquets table
CREATE TABLE IF NOT EXISTS public.banquets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_type TEXT NOT NULL,
  guests INTEGER NOT NULL,
  venue TEXT NOT NULL,
  menu_package TEXT,
  food_items JSONB,
  decoration TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  advance_paid DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'online', 'card', 'cheque')),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'tentative', 'cancelled', 'completed')),
  special_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'online', 'card')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create worker_salaries table
CREATE TABLE IF NOT EXISTS public.worker_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10, 2) NOT NULL,
  deductions DECIMAL(10, 2) DEFAULT 0,
  bonus DECIMAL(10, 2) DEFAULT 0,
  final_salary DECIMAL(10, 2) NOT NULL,
  payment_date DATE,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'online', 'bank_transfer')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, month, year)
);

-- Insert default users
INSERT INTO public.users (username, password, role) 
VALUES 
  ('admin', 'admin123', 'admin'),
  ('casher123', '8696', 'cashier')
ON CONFLICT (username) DO NOTHING;

-- Insert default tables (20 tables)
INSERT INTO public.tables (table_number, status, customer_name, customer_phone, persons)
SELECT 
  generate_series AS table_number,
  'open' AS status,
  NULL AS customer_name,
  NULL AS customer_phone,
  NULL AS persons
FROM generate_series(1, 20)
ON CONFLICT (table_number) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_thali_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banquets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_salaries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using custom auth)
-- Note: In production, you should implement proper RLS policies based on user roles

CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all access to tables" ON public.tables FOR ALL USING (true);
CREATE POLICY "Allow all access to daily_thali_menus" ON public.daily_thali_menus FOR ALL USING (true);
CREATE POLICY "Allow all access to orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all access to workers" ON public.workers FOR ALL USING (true);
CREATE POLICY "Allow all access to attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow all access to banquets" ON public.banquets FOR ALL USING (true);
CREATE POLICY "Allow all access to expenses" ON public.expenses FOR ALL USING (true);
CREATE POLICY "Allow all access to worker_salaries" ON public.worker_salaries FOR ALL USING (true);
