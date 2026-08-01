package com.esports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private java.util.UUID id;
    private String email;
    private String role;
    private String gameName;
    private String freeFireUid;
    private Integer gameLevel;
    private String avatarUrl;
    private String permissions;
}
