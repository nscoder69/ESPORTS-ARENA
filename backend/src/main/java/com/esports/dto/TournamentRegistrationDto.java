package com.esports.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TournamentRegistrationDto {
    private UUID id;
    private UUID tournamentId;
    private UUID teamId;
    private String teamName;
    private String teamLogoUrl;
    private String captainEmail;
    private String captainGameName;
    private LocalDateTime registeredAt;
    private Integer slotNumber;
    private Integer placement;
    private Integer kills;
    private String status;
}
