-- Independent versioned ledger. The historical CHECK and historical rows are unchanged.
CREATE TABLE IF NOT EXISTS crm_sequence_events (
 id BIGSERIAL PRIMARY KEY, prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id),
 source_system TEXT NOT NULL, event_id TEXT NOT NULL, kind TEXT NOT NULL,
 occurred_at TIMESTAMPTZ NOT NULL, payload_hash TEXT NOT NULL, metadata JSONB NOT NULL,
 UNIQUE(source_system,event_id)
);
CREATE TABLE IF NOT EXISTS crm_commercial_state (
 prospect_id BIGINT PRIMARY KEY REFERENCES crm_prospects(id),
 state TEXT NOT NULL, sequence_id TEXT NOT NULL, sequence_version INTEGER NOT NULL,
 source_system TEXT NOT NULL, source_event_id TEXT NOT NULL,
 occurred_at TIMESTAMPTZ NOT NULL, revision TEXT NOT NULL,
 follow_up_count INTEGER NOT NULL DEFAULT 0, next_action_at TIMESTAMPTZ,
 metadata JSONB NOT NULL
);
CREATE TABLE IF NOT EXISTS crm_legacy_execution_blocks (
 entity_type TEXT NOT NULL, entity_id BIGINT NOT NULL, prospect_id BIGINT NOT NULL REFERENCES crm_prospects(id),
 source_event_id TEXT NOT NULL, reason TEXT NOT NULL DEFAULT 'SUPERSEDED', created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(entity_type,entity_id)
);
