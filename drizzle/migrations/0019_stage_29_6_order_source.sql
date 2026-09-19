-- Migration 0019: Stage 29.6 Order Source tracking
ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'web';
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
