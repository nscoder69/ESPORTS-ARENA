package com.esports.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MatchDto {
    private UUID id;
    private UUID tournamentId;
    private String roomId;
    private String roomPassword;
    private String status;
    private LocalDateTime startTime;
}
