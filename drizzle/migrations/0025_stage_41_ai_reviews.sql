-- Stage 41: AI Review Generator App
-- Tables: ai_review_generations, ai_review_settings, and ALTER reviews

CREATE TABLE IF NOT EXISTS ai_review_generations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    requested_count INTEGER NOT NULL,
    generated_count INTEGER DEFAULT 0,
    rating_min INTEGER NOT NULL,
    rating_max INTEGER NOT NULL,
    tone TEXT,
    language TEXT,
    reviewer_style TEXT,
    date_range_days INTEGER,
    approval_mode TEXT,
    status TEXT,
    error_message TEXT,
    created_by TEXT,
    created_at INTEGER,
    completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS ai_review_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    provider TEXT DEFAULT 'cloudflare',
    default_tone TEXT DEFAULT 'positive',
    default_language TEXT DEFAULT 'english',
    max_reviews_per_batch INTEGER DEFAULT 50,
    enabled INTEGER DEFAULT 1,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_ai_gen_product_id ON ai_review_generations(product_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_status ON ai_review_generations(status);

-- Reviews Table Alterations for AI tracking
ALTER TABLE reviews ADD COLUMN is_ai_generated INTEGER DEFAULT 0;
ALTER TABLE reviews ADD COLUMN ai_generation_id TEXT;
CREATE INDEX IF NOT EXISTS idx_reviews_ai_gen ON reviews(ai_generation_id);
