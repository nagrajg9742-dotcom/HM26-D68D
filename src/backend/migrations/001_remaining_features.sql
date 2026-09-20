-- CivicTrack remaining feature schema

CREATE TABLE IF NOT EXISTS complaint_assignments (
    id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    officer_id INTEGER NOT NULL REFERENCES users(id),
    assigned_by INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    CONSTRAINT complaint_assignments_status_check
        CHECK (status IN ('active', 'reassigned', 'completed'))
);

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'medium';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'complaints_priority_check'
    ) THEN
        ALTER TABLE complaints
        ADD CONSTRAINT complaints_priority_check
        CHECK (priority IN ('low', 'medium', 'high', 'critical'));
    END IF;
END $$;

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMP;

ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS sla_status VARCHAR(20) NOT NULL DEFAULT 'pending';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'complaints_sla_status_check'
    ) THEN
        ALTER TABLE complaints
        ADD CONSTRAINT complaints_sla_status_check
        CHECK (sla_status IN ('pending', 'overdue', 'completed'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_id INTEGER REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
