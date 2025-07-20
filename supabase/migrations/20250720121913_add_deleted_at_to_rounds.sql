  -- Add the deleted_at column
  ALTER TABLE rounds
  ADD COLUMN deleted_at TIMESTAMPTZ NULL;

  -- Add index for better query performance when filtering deleted records
  CREATE INDEX idx_rounds_deleted_at ON rounds(deleted_at);

  -- Optional: Add a comment to document the column
  COMMENT ON COLUMN rounds.deleted_at IS 'Timestamp when the round was soft deleted. NULL means not deleted.';