CREATE TABLE matches (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(100),
    room_password VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Ongoing, Finished
    start_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE match_results (
    match_id VARCHAR(36) NOT NULL,
    team_id VARCHAR(36) NOT NULL,
    kill_points INT DEFAULT 0,
    placement_points INT DEFAULT 0,
    total_points INT DEFAULT 0,
    PRIMARY KEY (match_id, team_id),
    FOREIGN KEY (match_id) REFERENCES matches(id),
    FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
