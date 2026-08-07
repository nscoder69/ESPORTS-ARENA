package com.esports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeEventDto {
    private String type; // WALLET_UPDATE, TOURNAMENT_UPDATE, ROOM_CREDENTIALS_UPDATE, NOTIFICATION_UPDATE, SUPPORT_UPDATE, ADMIN_UPDATE
    private String message;
    private Object data;
}
