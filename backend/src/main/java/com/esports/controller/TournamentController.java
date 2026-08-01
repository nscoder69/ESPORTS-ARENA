package com.esports.controller;

import com.esports.dto.TournamentDto;
import com.esports.dto.TournamentRegistrationDto;
import com.esports.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @PostMapping
    public ResponseEntity<TournamentDto> createTournament(@RequestBody TournamentDto tournamentDto, Authentication authentication) {
        return ResponseEntity.ok(tournamentService.createTournament(tournamentDto, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TournamentDto>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @PostMapping("/{tournamentId}/register")
    public ResponseEntity<?> registerForTournament(
            @PathVariable UUID tournamentId,
            @RequestBody java.util.Map<String, String> request,
            Authentication authentication) {
        
        try {
            UUID teamId = UUID.fromString(request.get("teamId"));
            return ResponseEntity.ok(tournamentService.registerForTournament(tournamentId, teamId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{tournamentId}/register-solo")
    public ResponseEntity<?> registerSoloForTournament(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        
        try {
            return ResponseEntity.ok(tournamentService.registerSoloForTournament(tournamentId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{tournamentId}/join-via-invite")
    public ResponseEntity<?> joinTournamentViaInvite(
            @PathVariable UUID tournamentId,
            @RequestBody(required = false) java.util.Map<String, String> request,
            @RequestParam(value = "inviteCode", required = false) String paramInviteCode,
            Authentication authentication) {
        try {
            String inviteCode = (request != null && request.get("inviteCode") != null) 
                    ? request.get("inviteCode") 
                    : paramInviteCode;
            if (inviteCode == null || inviteCode.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invite code is required"));
            }
            return ResponseEntity.ok(tournamentService.joinTournamentViaInvite(tournamentId, inviteCode.trim(), authentication.getName()));
        } catch (org.springframework.web.server.ResponseStatusException rse) {
            return ResponseEntity.status(rse.getStatusCode()).body(java.util.Map.of("message", rse.getReason() != null ? rse.getReason() : rse.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to join team"));
        }
    }

    @GetMapping("/my-registered")
    public ResponseEntity<?> getMyRegisteredTournaments(Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.getMyRegisteredTournaments(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/registered")
    public ResponseEntity<?> getUserRegisteredTournaments(
            @PathVariable UUID userId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.getUserRegisteredTournaments(userId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{tournamentId}/registrations")
    public ResponseEntity<?> getRegistrations(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.getRegistrationsForTournament(tournamentId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{tournamentId}/registered-teams")
    public ResponseEntity<?> getRegisteredTeams(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.getRegisteredTeamsForParticipant(tournamentId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{tournamentId}/cancel")
    public ResponseEntity<?> cancelTournament(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.cancelTournament(tournamentId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{tournamentId}/reschedule")
    public ResponseEntity<?> rescheduleTournament(
            @PathVariable UUID tournamentId,
            @RequestBody java.util.Map<String, String> request,
            Authentication authentication) {
        try {
            java.time.LocalDateTime newTiming = java.time.LocalDateTime.parse(request.get("matchTiming"));
            return ResponseEntity.ok(tournamentService.rescheduleTournament(tournamentId, newTiming, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{tournamentId}/registrations/{teamId}")
    public ResponseEntity<?> removeTeamFromTournament(
            @PathVariable UUID tournamentId,
            @PathVariable UUID teamId,
            Authentication authentication) {
        try {
            tournamentService.removeTeamFromTournament(tournamentId, teamId, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{tournamentId}")
    public ResponseEntity<?> deleteTournament(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        try {
            tournamentService.deleteTournament(tournamentId, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{tournamentId}/result")
    public ResponseEntity<?> updateTournamentResults(
            @PathVariable UUID tournamentId,
            @RequestBody com.esports.dto.TournamentResultUpdateDto resultDto,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(tournamentService.updateTournamentResults(tournamentId, resultDto, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{tournamentId}/results")
    public ResponseEntity<?> getTournamentResults(@PathVariable UUID tournamentId) {
        try {
            return ResponseEntity.ok(tournamentService.getTournamentResults(tournamentId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{tournamentId}/room-credentials")
    public ResponseEntity<?> updateRoomCredentials(
            @PathVariable UUID tournamentId,
            @RequestBody com.esports.dto.RoomUpdateDto updateDto,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Authentication required"));
        }
        return ResponseEntity.ok(tournamentService.updateRoomCredentials(tournamentId, updateDto, authentication.getName()));
    }

    @GetMapping("/{tournamentId}/room-credentials")
    public ResponseEntity<?> getRoomCredentials(
            @PathVariable UUID tournamentId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Authentication required"));
        }
        return ResponseEntity.ok(tournamentService.getRoomCredentials(tournamentId, authentication.getName()));
    }
}
