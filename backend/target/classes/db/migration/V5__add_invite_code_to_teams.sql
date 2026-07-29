ALTER TABLE teams ADD COLUMN invite_code VARCHAR(10);
CREATE UNIQUE INDEX idx_teams_invite_code ON teams(invite_code);
