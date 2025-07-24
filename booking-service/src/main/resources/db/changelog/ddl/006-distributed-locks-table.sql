-- liquibase formatted sql

-- changeset pdh:006-create-distributed-locks-table
-- comment: Create distributed_locks table for Phase 4: Inventory Locking
-- This table will be used for distributed locking across microservices

CREATE TABLE IF NOT EXISTS distributed_locks (
    lock_id VARCHAR(255) PRIMARY KEY,
    resource VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    acquired_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    timeout_seconds BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    metadata TEXT,
    owner_service VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    priority INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_distributed_locks_resource ON distributed_locks(resource, resource_type);
CREATE INDEX IF NOT EXISTS idx_distributed_locks_owner ON distributed_locks(owner);
CREATE INDEX IF NOT EXISTS idx_distributed_locks_status ON distributed_locks(status);
CREATE INDEX IF NOT EXISTS idx_distributed_locks_expires_at ON distributed_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_distributed_locks_resource_status ON distributed_locks(resource, resource_type, status);

-- Create unique constraint to prevent duplicate active locks for same resource
CREATE UNIQUE INDEX IF NOT EXISTS idx_distributed_locks_unique_active 
ON distributed_locks(resource, resource_type, owner) 
WHERE status = 'ACQUIRED';

-- Add comments for documentation
COMMENT ON TABLE distributed_locks IS 'Distributed locks for inventory management across microservices';
COMMENT ON COLUMN distributed_locks.lock_id IS 'Unique identifier for the lock';
COMMENT ON COLUMN distributed_locks.resource IS 'Resource being locked (e.g., flight:123, hotel:456)';
COMMENT ON COLUMN distributed_locks.resource_type IS 'Type of resource (FLIGHT, HOTEL, ROOM, etc.)';
COMMENT ON COLUMN distributed_locks.owner IS 'Owner of the lock (usually saga ID or booking ID)';
COMMENT ON COLUMN distributed_locks.expires_at IS 'When the lock expires and should be cleaned up';
COMMENT ON COLUMN distributed_locks.quantity IS 'Quantity of the resource being locked';
COMMENT ON COLUMN distributed_locks.priority IS 'Lock priority (higher = more important)';
COMMENT ON COLUMN distributed_locks.owner_service IS 'Service that owns the lock';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_distributed_locks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_distributed_locks_updated_at
    BEFORE UPDATE ON distributed_locks
    FOR EACH ROW
    EXECUTE FUNCTION update_distributed_locks_updated_at();

-- rollback changeset pdh:006-create-distributed-locks-table
-- DROP TRIGGER IF EXISTS trigger_distributed_locks_updated_at ON distributed_locks;
-- DROP FUNCTION IF EXISTS update_distributed_locks_updated_at();
-- DROP TABLE IF EXISTS distributed_locks;
