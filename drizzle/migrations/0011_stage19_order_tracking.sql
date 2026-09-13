-- Stage 19: Order Tracking Columns
ALTER TABLE orders ADD COLUMN courier_name TEXT;
ALTER TABLE orders ADD COLUMN tracking_number TEXT;
ALTER TABLE orders ADD COLUMN estimated_delivery TEXT;
ALTER TABLE orders ADD COLUMN status_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
