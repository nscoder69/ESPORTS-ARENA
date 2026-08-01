package com.esports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleResponseDto {
    private boolean requiresConfirmation;
    private String message;
    private UserDto user;
}
