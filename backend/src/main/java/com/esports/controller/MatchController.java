package com.esports.controller;

import com.esports.dto.MatchDto;
import com.esports.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping
    public ResponseEntity<MatchDto> createMatch(@RequestBody MatchDto matchDto) {
        return ResponseEntity.ok(matchService.createMatch(matchDto));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<MatchDto>> getMatchesByTournament(@PathVariable UUID tournamentId) {
        return ResponseEntity.ok(matchService.getMatchesByTournament(tournamentId));
    }
}
