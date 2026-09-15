-- Stage C: Apps Framework Part 1 (Foundation / Skeleton)
-- Tables: installed_apps, app_install_log

CREATE TABLE IF NOT EXISTS installed_apps (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  installed_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  settings TEXT,
  permissions TEXT,
  installed_by TEXT
);

CREATE TABLE IF NOT EXISTS app_install_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  app_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_at INTEGER NOT NULL,
  performed_by TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_installed_apps_enabled ON installed_apps(enabled);
CREATE INDEX IF NOT EXISTS idx_app_install_log_app_id ON app_install_log(app_id);
