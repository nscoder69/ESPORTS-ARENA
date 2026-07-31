package com.esports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomCredentialsDto {
    private String roomId;
    private String roomPassword;
    private boolean isUpdated;
    private String message;
}
