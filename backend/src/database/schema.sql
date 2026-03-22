-- =====================================================
-- HOTEL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- PostgreSQL Database Schema
-- =====================================================

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles for RBAC
CREATE TYPE user_role AS ENUM ('admin', 'guest', 'staff');

-- Booking status lifecycle
CREATE TYPE booking_status AS ENUM (
  'pending',      -- Initial booking request
  'confirmed',    -- Admin approved
  'checked_in',   -- Guest has arrived
  'checked_out',  -- Guest has departed
  'cancelled',    -- Booking cancelled
  'completed'     -- Full lifecycle complete
);

-- Room status for inventory management
CREATE TYPE room_status AS ENUM (
  'available',    -- Ready for booking
  'occupied',     -- Currently occupied
  'maintenance',  -- Under maintenance/cleaning
  'reserved'      -- Pre-booked but not yet checked in
);

-- Order status for F&B services
CREATE TYPE order_status AS ENUM (
  'pending',      -- Order placed
  'preparing',     -- Kitchen working on it
  'ready',         -- Ready for delivery
  'delivered',     -- Delivered to guest
  'cancelled'      -- Order cancelled
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',      -- Awaiting payment
  'completed',    -- Payment successful
  'failed',       -- Payment failed
  'refunded'      -- Payment refunded
);

-- Event booking status
CREATE TYPE event_status AS ENUM (
  'inquiry',      -- Initial inquiry
  'pending',      -- Awaiting confirmation
  'confirmed',    -- Confirmed by admin
  'cancelled',    -- Cancelled
  'completed'     -- Event completed
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table with role-based access control
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'guest',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Guest profiles extended information
CREATE TABLE guest_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  nationality VARCHAR(100),
  id_type VARCHAR(50),          -- Passport, Driver's License, etc.
  id_number VARCHAR(50),
  address TEXT,
  preferences TEXT,             -- JSON preferences (allergies, room preferences)
  loyalty_points INTEGER DEFAULT 0,
  membership_tier VARCHAR(20) DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ROOM MANAGEMENT TABLES
-- =====================================================

-- Room types definition
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,           -- Deluxe, Suite, Standard, etc.
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  bed_configuration VARCHAR(100),       -- King, Queen, Double, Twin
  amenities TEXT[],                      -- Array of amenities
  room_size_sqft INTEGER,
  images TEXT[],                         -- Array of image URLs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual rooms inventory
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(10) NOT NULL UNIQUE,
  room_type_id UUID NOT NULL REFERENCES room_types(id),
  floor INTEGER,
  status room_status DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Room pricing for dynamic pricing (seasonal, weekend, etc.)
CREATE TABLE room_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_id UUID NOT NULL REFERENCES room_types(id),
  price DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- =====================================================
-- BOOKING TABLES
-- =====================================================

-- Room bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,  -- Human-readable reference
  guest_id UUID NOT NULL REFERENCES users(id),
  room_type_id UUID NOT NULL REFERENCES room_types(id),
  assigned_room_id UUID REFERENCES rooms(id),
  
  -- Booking dates
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  actual_check_in TIMESTAMP WITH TIME ZONE,
  actual_check_out TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  base_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Status and metadata
  status booking_status DEFAULT 'pending',
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  special_requests TEXT,
  
  -- Cancellation tracking
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_booking_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_guest_count CHECK (number_of_guests >= 1)
);

-- Booking history for audit trail
CREATE TABLE booking_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  previous_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FOOD & BEVERAGE TABLES
-- =====================================================

-- F&B Menu categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES menu_categories(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  is_vegetarian BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  preparation_time_minutes INTEGER DEFAULT 15,
  allergens TEXT[],
  calories INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Food orders
CREATE TABLE food_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_reference VARCHAR(20) UNIQUE NOT NULL,
  guest_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  
  -- Order details
  order_status order_status DEFAULT 'pending',
  delivery_location VARCHAR(200),       -- Room number or location
  special_instructions TEXT,
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Payment
  payment_status payment_status DEFAULT 'pending',
  charged_to_room BOOLEAN DEFAULT false,
  
  -- Timestamps
  ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items (line items)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES food_orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EVENT MANAGEMENT TABLES
-- =====================================================

-- Event spaces (conference halls, banquet rooms)
CREATE TABLE event_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  area_sqft INTEGER,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  daily_rate DECIMAL(10, 2),
  amenities TEXT[],
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event bookings
CREATE TABLE event_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  organizer_id UUID NOT NULL REFERENCES users(id),
  event_space_id UUID NOT NULL REFERENCES event_spaces(id),
  
  -- Event details
  event_name VARCHAR(200) NOT NULL,
  event_description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  expected_attendees INTEGER,
  
  -- Status and pricing
  status event_status DEFAULT 'inquiry',
  quoted_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Services requested
  required_equipment TEXT[],
  catering_required BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_event_time CHECK (end_time > start_time)
);

-- =====================================================
-- PAYMENTS & INVOICES
-- =====================================================

-- Payments tracking
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  food_order_id UUID REFERENCES food_orders(id),
  event_booking_id UUID REFERENCES event_bookings(id),
  guest_id UUID NOT NULL REFERENCES users(id),
  
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(200),
  payment_status payment_status DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  receipt_url VARCHAR(500),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoices generated for guests
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(20) UNIQUE NOT NULL,
  guest_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  
  items JSONB NOT NULL,           -- Detailed breakdown
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SERVICE REQUESTS & REVIEWS
-- =====================================================

-- Guest service requests (housekeeping, maintenance, etc.)
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  room_id UUID REFERENCES rooms(id),
  
  request_type VARCHAR(100) NOT NULL,     -- housekeeping, maintenance, concierge, etc.
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent
  status VARCHAR(20) DEFAULT 'pending',
  
  assigned_to UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  guest_rating INTEGER,                  -- 1-5 rating after completion
  guest_feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guest reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Booking indexes for availability searches
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Room availability index
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type_id);

-- Order indexes
CREATE INDEX idx_food_orders_guest ON food_orders(guest_id);
CREATE INDEX idx_food_orders_status ON food_orders(order_status);
CREATE INDEX idx_food_orders_booking ON food_orders(booking_id);

-- Event booking indexes
CREATE INDEX idx_event_bookings_date ON event_bookings(event_date);
CREATE INDEX idx_event_bookings_space ON event_bookings(event_space_id);

-- Service request indexes
CREATE INDEX idx_service_requests_guest ON service_requests(guest_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables with updated_at column
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'BK';
  sequence_num BIGINT;
BEGIN
  SELECT COUNT(*) + 1 INTO sequence_num FROM bookings;
  NEW.booking_reference := prefix || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                           LPAD(sequence_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for booking reference generation
CREATE TRIGGER generate_booking_reference_trigger
BEFORE INSERT ON bookings
FOR EACH ROW
WHEN (NEW.booking_reference IS NULL)
EXECUTE FUNCTION generate_booking_reference();

-- Function to generate order reference
CREATE OR REPLACE FUNCTION generate_order_reference()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'ORD';
  sequence_num BIGINT;
BEGIN
  SELECT COUNT(*) + 1 INTO sequence_num FROM food_orders;
  NEW.order_reference := prefix || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                          LPAD(sequence_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order reference generation
CREATE TRIGGER generate_order_reference_trigger
BEFORE INSERT ON food_orders
FOR EACH ROW
WHEN (NEW.order_reference IS NULL)
EXECUTE FUNCTION generate_order_reference();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'INV';
  sequence_num BIGINT;
BEGIN
  SELECT COUNT(*) + 1 INTO sequence_num FROM invoices;
  NEW.invoice_number := prefix || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || 
                        LPAD(sequence_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Available rooms view for booking engine
CREATE OR REPLACE VIEW available_rooms AS
SELECT 
  r.id as room_id,
  r.room_number,
  rt.id as room_type_id,
  rt.name as room_type_name,
  rt.description,
  rt.base_price,
  rt.max_occupancy,
  rt.amenities,
  rt.room_size_sqft,
  r.floor,
  r.status
FROM rooms r
JOIN room_types rt ON r.room_type_id = rt.id
WHERE r.status = 'available'
AND rt.is_active = true;

-- Room availability check function
CREATE OR REPLACE FUNCTION check_room_availability(
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
  conflicting_bookings INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflicting_bookings
  FROM bookings
  WHERE room_type_id = p_room_type_id
  AND status NOT IN ('cancelled', 'completed')
  AND (
    (check_in_date < p_check_out AND check_out_date > p_check_in)
  );
  
  RETURN conflicting_bookings = 0;
END;
$$ LANGUAGE plpgsql;

-- Guest booking summary view
CREATE OR REPLACE VIEW guest_booking_summary AS
SELECT 
  u.id as guest_id,
  u.email,
  u.first_name,
  u.last_name,
  COUNT(b.id) as total_bookings,
  SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) as completed_stays,
  SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as upcoming_stays,
  COALESCE(SUM(b.total_amount), 0) as total_spent,
  MAX(b.created_at) as last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.guest_id
WHERE u.role = 'guest'
GROUP BY u.id, u.email, u.first_name, u.last_name;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON DATABASE hotel_management IS 'Hotel Management System Database - Contains all data for room booking, F&B, events, and guest management';
COMMENT ON TABLE users IS 'Core user table with role-based access control (Admin, Guest, Staff)';
COMMENT ON TABLE bookings IS 'Room booking records with date management and status tracking';
COMMENT ON TABLE food_orders IS 'In-room dining orders with cart and delivery tracking';
COMMENT ON TABLE event_bookings IS 'Conference hall and banquet room reservations';
COMMENT ON TABLE service_requests IS 'Guest service requests (housekeeping, maintenance, etc.)';
