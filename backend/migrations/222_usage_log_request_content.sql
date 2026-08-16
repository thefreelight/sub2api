CREATE TABLE IF NOT EXISTS usage_log_request_contents (
    usage_log_id BIGINT PRIMARY KEY REFERENCES usage_logs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_bytes INTEGER NOT NULL,
    truncated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_log_request_contents_created_at
    ON usage_log_request_contents (created_at DESC);
