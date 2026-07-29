package com.esports.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class TournamentResultUpdateDto {
    private UUID firstPlaceTeamId;
    private UUID secondPlaceTeamId;
    private UUID thirdPlaceTeamId;
    private Map<UUID, Integer> teamKills; // teamId -> kills
}
