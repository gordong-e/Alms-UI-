-- Create Enum Types
CREATE TYPE user_role AS ENUM ('DONATOR', 'RESCUER', 'UNASSIGNED');
CREATE TYPE donation_status AS ENUM ('AVAILABLE', 'PARTIAL', 'CLAIMED', 'EXPIRED', 'CANCELLED');
CREATE TYPE claim_status AS ENUM ('PENDING', 'PICKED_UP', 'NO_SHOW');

-- 1. Users Table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role user_role DEFAULT 'UNASSIGNED',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Donators Table
CREATE TABLE public.donators (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  categories TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Donations Table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donator_id UUID NOT NULL REFERENCES public.donators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  total_quantity INTEGER NOT NULL CHECK (total_quantity > 0),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  status donation_status DEFAULT 'AVAILABLE',
  pickup_window_start TIMESTAMPTZ,
  pickup_window_end TIMESTAMPTZ,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Claims Table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  rescuer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  claimed_quantity INTEGER NOT NULL CHECK (claimed_quantity > 0),
  status claim_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Database Function to handle claim logic
CREATE OR REPLACE FUNCTION process_donation_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there is enough available quantity
  IF (SELECT available_quantity FROM public.donations WHERE id = NEW.donation_id) < NEW.claimed_quantity THEN
    RAISE EXCEPTION 'Not enough quantity available to fulfill this claim';
  END IF;

  -- Reduce available quantity
  UPDATE public.donations
  SET available_quantity = available_quantity - NEW.claimed_quantity
  WHERE id = NEW.donation_id;

  -- Update status if available quantity hits 0
  UPDATE public.donations
  SET status = 'CLAIMED'
  WHERE id = NEW.donation_id AND available_quantity = 0;

  -- Update status to PARTIAL if claimed but still available
  UPDATE public.donations
  SET status = 'PARTIAL'
  WHERE id = NEW.donation_id AND available_quantity > 0 AND status = 'AVAILABLE';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Claims
CREATE TRIGGER after_claim_insert
AFTER INSERT ON public.claims
FOR EACH ROW
EXECUTE FUNCTION process_donation_claim();
