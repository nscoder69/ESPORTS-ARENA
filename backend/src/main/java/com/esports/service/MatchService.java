package com.esports.service;

import com.esports.dto.MatchDto;
import java.util.List;
import java.util.UUID;

public interface MatchService {
    MatchDto createMatch(MatchDto matchDto);
    List<MatchDto> getMatchesByTournament(UUID tournamentId);
}
