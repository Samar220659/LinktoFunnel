-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔐 SOCIAL MEDIA API MANAGEMENT SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- Dieses Schema verwaltet:
-- 1. Social Media APIs (TikTok, Instagram, YouTube, etc.)
-- 2. Verschlüsselte API-Keys
-- 3. API-Änderungsverfolgung
-- 4. Health Monitoring
--
-- INSTALLATION:
-- 1. Öffne Supabase SQL Editor
-- 2. Kopiere dieses gesamte Script
-- 3. Führe es aus
--
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 1: Social Media APIs Registry
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS social_media_apis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identifikation
  platform TEXT NOT NULL,                    -- tiktok, instagram, youtube, etc.
  api_name TEXT NOT NULL,                    -- z.B. "TikTok Creator API"

  -- API-Spezifikationen
  base_url TEXT,                             -- Base URL der API
  version TEXT,                              -- API Version (z.B. "2.0", "v19.0")
  docs_url TEXT,                             -- Link zur Dokumentation
  auth_type TEXT,                            -- OAuth2, Access Token, API Key

  -- Endpunkte und Limits
  endpoints JSONB,                           -- Array von Endpoint-Objekten
  rate_limit JSONB,                          -- Rate Limit Informationen

  -- Monitoring
  check_url TEXT,                            -- URL für Changelog/Updates
  last_checked TIMESTAMP,                    -- Letzte Überprüfung
  status TEXT DEFAULT 'active',              -- active, deprecated, changed, inactive

  -- Metadaten
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(platform, api_name)
);

-- Index für schnelle Plattform-Suche
CREATE INDEX IF NOT EXISTS idx_social_media_apis_platform
  ON social_media_apis(platform);

-- Index für Status-Filterung
CREATE INDEX IF NOT EXISTS idx_social_media_apis_status
  ON social_media_apis(status);

-- Index für letzte Überprüfung
CREATE INDEX IF NOT EXISTS idx_social_media_apis_last_checked
  ON social_media_apis(last_checked);

-- Kommentare für Dokumentation
COMMENT ON TABLE social_media_apis IS
  'Registry aller Social Media APIs mit Versionierung und Endpoint-Tracking';

COMMENT ON COLUMN social_media_apis.endpoints IS
  'JSON Array von Endpoint-Objekten: [{path: "/users", method: "GET", purpose: "..."}]';

COMMENT ON COLUMN social_media_apis.rate_limit IS
  'JSON Objekt: {requests: 1000, period: "24h", resetTime: "00:00 UTC"}';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 2: API Keys (Encrypted Storage)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS social_media_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referenz zur API
  api_id UUID NOT NULL REFERENCES social_media_apis(id) ON DELETE CASCADE,

  -- Key-Identifikation
  key_name TEXT NOT NULL,                    -- z.B. "production", "test", "backup"

  -- Verschlüsselte Daten
  encrypted_value TEXT NOT NULL,             -- AES-256-GCM verschlüsselter Wert
  encryption_iv TEXT NOT NULL,               -- Initialization Vector
  encryption_auth_tag TEXT NOT NULL,         -- Authentication Tag für GCM

  -- Key-Eigenschaften
  permissions JSONB,                         -- Berechtigungen des Keys
  expires_at TIMESTAMP,                      -- Ablaufdatum (optional)
  is_active BOOLEAN DEFAULT TRUE,            -- Ist der Key aktiv?

  -- Audit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,                    -- Wann wurde der Key zuletzt verwendet?
  usage_count INTEGER DEFAULT 0,             -- Wie oft wurde er verwendet?

  -- Constraints
  UNIQUE(api_id, key_name)
);

-- Index für API-Zuordnung
CREATE INDEX IF NOT EXISTS idx_social_media_api_keys_api_id
  ON social_media_api_keys(api_id);

-- Index für aktive Keys
CREATE INDEX IF NOT EXISTS idx_social_media_api_keys_active
  ON social_media_api_keys(is_active)
  WHERE is_active = TRUE;

-- Kommentare
COMMENT ON TABLE social_media_api_keys IS
  'Verschlüsselte Speicherung von API-Keys mit AES-256-GCM';

COMMENT ON COLUMN social_media_api_keys.encrypted_value IS
  'Mit AES-256-GCM verschlüsselter API-Key (hex-encoded)';

COMMENT ON COLUMN social_media_api_keys.permissions IS
  'JSON Objekt: {read: true, write: true, delete: false, scopes: ["user.read", "post.write"]}';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 3: API Change Log
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS social_media_api_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referenz zur API
  api_id UUID NOT NULL REFERENCES social_media_apis(id) ON DELETE CASCADE,

  -- Art der Änderung
  change_type TEXT NOT NULL,                 -- version_update, endpoint_added, endpoint_removed,
                                             -- deprecated, rate_limit_change, base_url_change

  -- Änderungsdetails
  old_value JSONB,                          -- Alter Wert
  new_value JSONB,                          -- Neuer Wert

  -- Bewertung
  severity TEXT,                            -- low, medium, high, critical
  description TEXT,                          -- Menschenlesbare Beschreibung
  impact_assessment TEXT,                    -- Auswirkungsanalyse

  -- Tracking
  detected_at TIMESTAMP DEFAULT NOW(),       -- Wann wurde die Änderung erkannt?
  notified BOOLEAN DEFAULT FALSE,            -- Wurde eine Benachrichtigung gesendet?
  notified_at TIMESTAMP,                     -- Wann wurde benachrichtigt?
  acknowledged BOOLEAN DEFAULT FALSE,        -- Wurde die Änderung bestätigt?
  acknowledged_at TIMESTAMP,                 -- Wann wurde bestätigt?
  acknowledged_by TEXT                       -- Wer hat bestätigt?
);

-- Index für API-Zuordnung
CREATE INDEX IF NOT EXISTS idx_social_media_api_changes_api_id
  ON social_media_api_changes(api_id);

-- Index für unbenachrichtigte Änderungen
CREATE INDEX IF NOT EXISTS idx_social_media_api_changes_notified
  ON social_media_api_changes(notified)
  WHERE notified = FALSE;

-- Index für Severity
CREATE INDEX IF NOT EXISTS idx_social_media_api_changes_severity
  ON social_media_api_changes(severity);

-- Index für Zeitstempel
CREATE INDEX IF NOT EXISTS idx_social_media_api_changes_detected_at
  ON social_media_api_changes(detected_at DESC);

-- Kommentare
COMMENT ON TABLE social_media_api_changes IS
  'Tracking aller Änderungen an Social Media APIs mit Benachrichtigungsstatus';

COMMENT ON COLUMN social_media_api_changes.change_type IS
  'Mögliche Werte: version_update, endpoint_added, endpoint_removed, deprecated, rate_limit_change, base_url_change, auth_change';

COMMENT ON COLUMN social_media_api_changes.severity IS
  'low: Kosmetische Änderungen | medium: Dokumentations-Updates | high: Breaking Changes | critical: Service Down oder Deprecation';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 4: API Health Monitoring
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS social_media_api_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referenz zur API
  api_id UUID NOT NULL REFERENCES social_media_apis(id) ON DELETE CASCADE,

  -- Health Check Zeitstempel
  check_timestamp TIMESTAMP DEFAULT NOW(),

  -- Performance-Metriken
  response_time_ms INTEGER,                  -- Antwortzeit in Millisekunden
  status_code INTEGER,                       -- HTTP Status Code
  is_available BOOLEAN,                      -- Ist die API erreichbar?

  -- Fehlerinformationen
  error_message TEXT,                        -- Fehlermeldung (falls vorhanden)
  error_type TEXT,                           -- timeout, connection_refused, dns_error, etc.

  -- Rate Limit Status
  rate_limit_remaining INTEGER,              -- Verbleibende Requests
  rate_limit_reset TIMESTAMP,                -- Wann wird das Limit zurückgesetzt?

  -- Zusätzliche Metriken
  ssl_valid BOOLEAN,                         -- Ist das SSL-Zertifikat gültig?
  ssl_expires_at TIMESTAMP,                  -- SSL-Ablaufdatum

  -- Geolocation (optional)
  check_from_region TEXT                     -- Von wo wurde getestet? (eu-west, us-east, etc.)
);

-- Index für API-Zuordnung
CREATE INDEX IF NOT EXISTS idx_social_media_api_health_api_id
  ON social_media_api_health(api_id);

-- Index für Zeitstempel (für Zeitreihenabfragen)
CREATE INDEX IF NOT EXISTS idx_social_media_api_health_timestamp
  ON social_media_api_health(check_timestamp DESC);

-- Index für Verfügbarkeit
CREATE INDEX IF NOT EXISTS idx_social_media_api_health_available
  ON social_media_api_health(is_available);

-- Kommentare
COMMENT ON TABLE social_media_api_health IS
  'Kontinuierliches Health-Monitoring aller APIs mit Performance-Metriken';

COMMENT ON COLUMN social_media_api_health.response_time_ms IS
  'Durchschnittliche Antwortzeit für HEAD-Request zum Base-URL';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TABLE 5: API Usage Statistics
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS social_media_api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referenz zur API und Key
  api_id UUID NOT NULL REFERENCES social_media_apis(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES social_media_api_keys(id) ON DELETE SET NULL,

  -- Usage-Details
  endpoint TEXT,                             -- Welcher Endpoint wurde aufgerufen?
  method TEXT,                               -- GET, POST, PUT, DELETE, etc.
  request_timestamp TIMESTAMP DEFAULT NOW(),

  -- Response-Informationen
  status_code INTEGER,                       -- HTTP Status Code
  response_time_ms INTEGER,                  -- Antwortzeit
  success BOOLEAN,                           -- War der Request erfolgreich?

  -- Fehlerinformationen
  error_message TEXT,

  -- Kosten (optional)
  cost_units DECIMAL,                        -- API-Kosten in Units

  -- Aggregation
  date DATE DEFAULT CURRENT_DATE             -- Datum für tägliche Aggregation
);

-- Index für API-Zuordnung
CREATE INDEX IF NOT EXISTS idx_social_media_api_usage_api_id
  ON social_media_api_usage(api_id);

-- Index für Datum (für Aggregationen)
CREATE INDEX IF NOT EXISTS idx_social_media_api_usage_date
  ON social_media_api_usage(date DESC);

-- Index für Key-Tracking
CREATE INDEX IF NOT EXISTS idx_social_media_api_usage_key_id
  ON social_media_api_usage(api_key_id);

-- Kommentare
COMMENT ON TABLE social_media_api_usage IS
  'Detailliertes Tracking aller API-Aufrufe für Analyse und Kostenüberwachung';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VIEWS: Aggregierte Daten
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- View: API Health Summary (letzte 24h)
CREATE OR REPLACE VIEW social_media_api_health_summary AS
SELECT
  a.id,
  a.platform,
  a.api_name,
  a.version,
  a.status,
  COUNT(h.id) AS total_checks_24h,
  COUNT(CASE WHEN h.is_available = TRUE THEN 1 END) AS available_checks,
  ROUND(
    (COUNT(CASE WHEN h.is_available = TRUE THEN 1 END)::DECIMAL /
     NULLIF(COUNT(h.id), 0) * 100), 2
  ) AS uptime_percentage_24h,
  AVG(h.response_time_ms) AS avg_response_time_ms,
  MAX(h.check_timestamp) AS last_checked
FROM
  social_media_apis a
LEFT JOIN
  social_media_api_health h ON a.id = h.api_id
    AND h.check_timestamp > NOW() - INTERVAL '24 hours'
GROUP BY
  a.id, a.platform, a.api_name, a.version, a.status;

COMMENT ON VIEW social_media_api_health_summary IS
  'Aggregierte Health-Metriken der letzten 24 Stunden pro API';

-- View: Critical Changes (unbestätigt)
CREATE OR REPLACE VIEW social_media_api_critical_changes AS
SELECT
  c.id,
  a.platform,
  a.api_name,
  c.change_type,
  c.severity,
  c.description,
  c.detected_at,
  c.notified,
  c.acknowledged
FROM
  social_media_api_changes c
JOIN
  social_media_apis a ON c.api_id = a.id
WHERE
  c.severity IN ('high', 'critical')
  AND c.acknowledged = FALSE
ORDER BY
  c.detected_at DESC;

COMMENT ON VIEW social_media_api_critical_changes IS
  'Alle kritischen und hohen Änderungen, die noch nicht bestätigt wurden';

-- View: Daily Usage Statistics
CREATE OR REPLACE VIEW social_media_api_daily_usage AS
SELECT
  u.api_id,
  a.platform,
  a.api_name,
  u.date,
  COUNT(*) AS total_requests,
  COUNT(CASE WHEN u.success = TRUE THEN 1 END) AS successful_requests,
  COUNT(CASE WHEN u.success = FALSE THEN 1 END) AS failed_requests,
  AVG(u.response_time_ms) AS avg_response_time_ms,
  SUM(u.cost_units) AS total_cost_units
FROM
  social_media_api_usage u
JOIN
  social_media_apis a ON u.api_id = a.id
GROUP BY
  u.api_id, a.platform, a.api_name, u.date
ORDER BY
  u.date DESC, a.platform;

COMMENT ON VIEW social_media_api_daily_usage IS
  'Tägliche Aggregation aller API-Aufrufe mit Erfolgsrate und Kosten';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FUNCTIONS: Automatisierung
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function: Update Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für social_media_apis
CREATE TRIGGER update_social_media_apis_updated_at
  BEFORE UPDATE ON social_media_apis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger für social_media_api_keys
CREATE TRIGGER update_social_media_api_keys_updated_at
  BEFORE UPDATE ON social_media_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-Notification Timestamp
CREATE OR REPLACE FUNCTION set_notified_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notified = TRUE AND OLD.notified = FALSE THEN
    NEW.notified_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Benachrichtigungen
CREATE TRIGGER update_social_media_api_changes_notified_at
  BEFORE UPDATE ON social_media_api_changes
  FOR EACH ROW
  EXECUTE FUNCTION set_notified_at_timestamp();

-- Function: Auto-Acknowledged Timestamp
CREATE OR REPLACE FUNCTION set_acknowledged_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.acknowledged = TRUE AND OLD.acknowledged = FALSE THEN
    NEW.acknowledged_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Bestätigungen
CREATE TRIGGER update_social_media_api_changes_acknowledged_at
  BEFORE UPDATE ON social_media_api_changes
  FOR EACH ROW
  EXECUTE FUNCTION set_acknowledged_at_timestamp();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Hinweis: Passe diese Policies an deine Authentifizierungslogik an

-- Enable RLS
ALTER TABLE social_media_apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_api_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_api_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_api_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Öffentlicher Lesezugriff auf APIs (für Entwicklung)
-- WARNUNG: In Produktion einschränken!
CREATE POLICY "Allow public read access to APIs"
  ON social_media_apis
  FOR SELECT
  USING (true);

-- Policy: Nur authentifizierte Benutzer können API-Keys lesen
-- WICHTIG: Niemals API-Keys öffentlich machen!
CREATE POLICY "Only authenticated users can read API keys"
  ON social_media_api_keys
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Öffentlicher Lesezugriff auf Änderungen
CREATE POLICY "Allow public read access to changes"
  ON social_media_api_changes
  FOR SELECT
  USING (true);

-- Policy: Öffentlicher Lesezugriff auf Health-Daten
CREATE POLICY "Allow public read access to health"
  ON social_media_api_health
  FOR SELECT
  USING (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INITIAL DATA (Optional)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Hinweis: Die tatsächlichen API-Daten werden vom Agent eingefügt

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SCHEMA COMPLETE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Erfolgreiche Ausführung bestätigen
DO $$
BEGIN
  RAISE NOTICE '✅ Social Media API Schema erfolgreich erstellt!';
  RAISE NOTICE '📋 Tabellen: 5';
  RAISE NOTICE '📊 Views: 3';
  RAISE NOTICE '⚡ Functions: 3';
  RAISE NOTICE '🔐 RLS: Aktiviert';
END $$;
