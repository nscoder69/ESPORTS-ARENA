package com.esports.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class GameProfileRequestDto {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userAvatarUrl;
    private String currentGameName;
    private String currentFreeFireUid;
    private Integer currentGameLevel;
    private String requestedGameName;
    private String requestedFreeFireUid;
    private Integer requestedGameLevel;
    private String status; // PENDING, APPROVED, REJECTED
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
