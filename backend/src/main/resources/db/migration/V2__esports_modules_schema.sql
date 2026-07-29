CREATE TABLE teams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    captain_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (captain_id) REFERENCES users(id)
);

CREATE TABLE team_members (
    team_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    member_role VARCHAR(50) NOT NULL, -- Captain, Player, Standin
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tournaments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10, 2) DEFAULT 0.00,
    prize_pool DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Upcoming', -- Upcoming, Live, Completed
    game_map VARCHAR(100),
    game_mode VARCHAR(100),
    match_timing TIMESTAMP,
    organizer_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);
