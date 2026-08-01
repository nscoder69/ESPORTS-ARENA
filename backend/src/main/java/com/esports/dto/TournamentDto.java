package com.esports.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TournamentDto {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal entryFee;
    private BigDecimal prizePool;
    private BigDecimal perKillPrize;
    private BigDecimal firstPrize;
    private BigDecimal secondPrize;
    private BigDecimal thirdPrize;
    private String status;
    private String gameMap;
    private String gameMode;
    private LocalDateTime matchTiming;
    private LocalDateTime registrationClosingTime;
    private Integer registeredCount;
    private Integer maxCapacity;
    private LocalDateTime updatedAt;
    private String roomId;
    private String roomPassword;
    private Integer minLevel;
    private UUID registeredTeamId;
    private String registeredTeamName;
    private String registeredTeamInviteCode;
}
