package com.esports.serviceImpl;

import com.esports.dto.MatchDto;
import com.esports.entity.Match;
import com.esports.entity.Tournament;
import com.esports.repository.MatchRepository;
import com.esports.repository.TournamentRepository;
import com.esports.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchServiceImpl implements MatchService {

    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;

    @Override
    public MatchDto createMatch(MatchDto matchDto) {
        Tournament tournament = tournamentRepository.findById(matchDto.getTournamentId())
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        Match match = new Match();
        match.setTournament(tournament);
        match.setRoomId(matchDto.getRoomId());
        match.setRoomPassword(matchDto.getRoomPassword());
        match.setStartTime(matchDto.getStartTime());
        match.setStatus(matchDto.getStatus() != null ? matchDto.getStatus() : "Pending");

        Match saved = matchRepository.save(match);
        return mapToDto(saved);
    }

    @Override
    public List<MatchDto> getMatchesByTournament(UUID tournamentId) {
        return matchRepository.findByTournamentId(tournamentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MatchDto mapToDto(Match match) {
        MatchDto dto = new MatchDto();
        dto.setId(match.getId());
        dto.setTournamentId(match.getTournament().getId());
        dto.setRoomId(match.getRoomId());
        dto.setRoomPassword(match.getRoomPassword());
        dto.setStartTime(match.getStartTime());
        dto.setStatus(match.getStatus());
        return dto;
    }
}
