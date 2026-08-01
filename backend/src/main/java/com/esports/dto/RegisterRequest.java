package com.esports.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String gameName;
    private String freeFireUid;
    private Integer gameLevel;
    private String otp;
}
