-- Migration 0020: Stage 37 Apps Marketplace Hub

CREATE TABLE IF NOT EXISTS app_marketplace_listings (
    id TEXT PRIMARY KEY,
    app_id TEXT NOT NULL,
    version TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    author TEXT,
    author_url TEXT,
    icon_url TEXT,
    category TEXT,
    pricing TEXT,
    price REAL,
    status TEXT,
    submitted_by TEXT,
    submitted_at INTEGER,
    approved_by TEXT,
    approved_at INTEGER,
    rejection_reason TEXT,
    download_url TEXT,
    manifest_json TEXT,
    changelog TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS app_marketplace_versions (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    version TEXT NOT NULL,
    submitted_at INTEGER,
    manifest_json TEXT,
    download_url TEXT,
    status TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS app_marketplace_installs (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    store_id TEXT,
    installed_at INTEGER,
    uninstalled_at INTEGER,
    status TEXT
);

CREATE INDEX IF NOT EXISTS idx_listings_app_id ON app_marketplace_listings(app_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON app_marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_versions_listing_id ON app_marketplace_versions(listing_id);
CREATE INDEX IF NOT EXISTS idx_installs_listing_id ON app_marketplace_installs(listing_id);
CREATE INDEX IF NOT EXISTS idx_installs_store_id ON app_marketplace_installs(store_id);
