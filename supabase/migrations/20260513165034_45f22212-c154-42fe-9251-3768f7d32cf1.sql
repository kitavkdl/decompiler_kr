
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_code text,
  ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_code_key
  ON public.orders (payment_code)
  WHERE payment_code IS NOT NULL;

CREATE POLICY "Anyone can update orders"
  ON public.orders
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
