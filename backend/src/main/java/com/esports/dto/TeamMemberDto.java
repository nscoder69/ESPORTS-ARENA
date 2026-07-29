package com.esports.dto;

import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
public class TeamMemberDto {
    private UUID userId;
    private String gameName;
    private String freeFireUid;
    private String avatarUrl;
    private String memberRole; // e.g. "Captain", "Player"
    private LocalDateTime joinedAt;
}
