CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value) VALUES
('upi_id', 'ultimatebackup112-1@okaxis'),
('upi_qr_url', '')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

ALTER TABLE users ADD COLUMN permissions TEXT NULL;
