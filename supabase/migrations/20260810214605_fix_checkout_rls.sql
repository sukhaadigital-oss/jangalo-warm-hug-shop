-- The checkout flow was broken: creating an order required reading the row
-- back (no public SELECT policy on orders), and confirming payment required
-- an UPDATE that only admins were allowed to perform. Fix both without
-- opening broad read/write access to orders:
--   1. The checkout page now generates the order id client-side and no
--      longer needs a read-back after INSERT.
--   2. Payment confirmation goes through a narrow SECURITY DEFINER function
--      that only allows the pending_payment -> payment_confirmed transition.
CREATE OR REPLACE FUNCTION public.confirm_order_payment(_order_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.orders
  SET status = 'payment_confirmed'
  WHERE id = _order_id AND status = 'pending_payment'
  RETURNING true;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_order_payment(uuid) TO anon, authenticated;
