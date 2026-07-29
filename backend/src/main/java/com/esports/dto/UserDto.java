package com.esports.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserDto {
    private UUID id;
    private String email;
    private String role;
    private String gameName;
    private String freeFireUid;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
    private Boolean isBlocked;
}
