-- Stage 17.5: Broadcast Notifications System

-- Broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  type TEXT DEFAULT 'info', -- 'info', 'promotion', 'announcement', 'warning'
  target TEXT DEFAULT 'all', -- 'all', 'registered', 'guest'
  status TEXT DEFAULT 'sent', -- 'sent', 'draft', 'scheduled', 'archived'
  sent_at TEXT,
  scheduled_for TEXT,
  created_at TEXT NOT NULL,
  created_by TEXT
);

-- Broadcast views and dismissals
CREATE TABLE IF NOT EXISTS broadcast_views (
  id TEXT PRIMARY KEY,
  broadcast_id TEXT NOT NULL,
  customer_id TEXT,
  visitor_id TEXT,
  is_dismissed INTEGER DEFAULT 0,
  viewed_at TEXT NOT NULL,
  clicked_at TEXT,
  FOREIGN KEY (broadcast_id) REFERENCES broadcasts(id) ON DELETE CASCADE,
  UNIQUE(broadcast_id, visitor_id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_broadcasts_status ON broadcasts(status);
CREATE INDEX IF NOT EXISTS idx_broadcasts_target ON broadcasts(target);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON broadcasts(created_at);
CREATE INDEX IF NOT EXISTS idx_broadcast_views_broadcast_id ON broadcast_views(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_views_visitor_id ON broadcast_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_views_is_dismissed ON broadcast_views(is_dismissed);
