CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  action TEXT NOT NULL,              -- 'apply' | 'cron-reoptimize'
  tenant TEXT NOT NULL,              -- e.g. 'demo' or userId
  version INTEGER NOT NULL,
  metrics_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS impacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  tenant TEXT NOT NULL,
  peak_reduction_pct REAL,
  renewable_gain_pct REAL,
  co2_avoided_kg REAL
);
