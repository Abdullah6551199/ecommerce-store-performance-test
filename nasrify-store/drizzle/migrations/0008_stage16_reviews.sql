-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  product_id TEXT NOT NULL,
  order_id TEXT,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_verified_purchase INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  admin_reply TEXT,
  admin_reply_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Review images
CREATE TABLE IF NOT EXISTS review_images (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL,
  user_ip TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('helpful', 'not_helpful')),
  created_at TEXT NOT NULL,
  UNIQUE(review_id, user_ip),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);

-- Add has_review column to orders (to prevent duplicate reviews)
ALTER TABLE orders ADD COLUMN has_review INTEGER DEFAULT 0;
