package com.esports.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ChatMessageDto {
    private UUID id;
    private UUID tournamentId;
    private String senderName;
    private String content;
    private String timestamp;
}
