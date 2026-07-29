ALTER TABLE tournament_registrations 
ADD COLUMN placement INT,
ADD COLUMN kills INT DEFAULT 0;
