-- 1. Modify users table to handle auth and impact metrics
ALTER TABLE public.users
ADD COLUMN meals_received INTEGER DEFAULT 0,
ADD COLUMN kg_rescued DOUBLE PRECISION DEFAULT 0;

-- Ensure users links to auth.users if needed
ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Modify donators table to handle impact metrics
ALTER TABLE public.donators
ADD COLUMN meals_donated INTEGER DEFAULT 0,
ADD COLUMN kg_saved DOUBLE PRECISION DEFAULT 0;

-- 3. Trigger to handle Auth Signups automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'UNASSIGNED'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Trigger to handle Impact Metrics on Claim Pickup
CREATE OR REPLACE FUNCTION public.update_impact_metrics_on_claim()
RETURNS trigger AS $$
DECLARE
  donation_row RECORD;
BEGIN
  -- Only trigger if status changes from PENDING to PICKED_UP
  IF (NEW.status = 'PICKED_UP' AND OLD.status = 'PENDING') THEN
    
    -- Increment for the rescuer
    UPDATE public.users 
    SET meals_received = meals_received + NEW.claimed_quantity
    WHERE id = NEW.rescuer_id;

    -- Fetch the donation to get the donator_id
    SELECT * INTO donation_row FROM public.donations WHERE id = NEW.donation_id;

    -- Increment for the donator
    IF FOUND THEN
      UPDATE public.donators
      SET meals_donated = meals_donated + NEW.claimed_quantity
      WHERE id = donation_row.donator_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_impact_metrics
  AFTER UPDATE ON public.claims
  FOR EACH ROW EXECUTE PROCEDURE public.update_impact_metrics_on_claim();
