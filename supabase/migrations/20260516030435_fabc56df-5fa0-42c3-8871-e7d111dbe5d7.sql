ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS booth text NOT NULL DEFAULT 'decompiler';
CREATE INDEX IF NOT EXISTS idx_orders_booth ON public.orders(booth);