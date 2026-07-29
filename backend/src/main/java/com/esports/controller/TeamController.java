package com.esports.controller;

import com.esports.dto.TeamDto;
import com.esports.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teams")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamDto> createTeam(@RequestBody TeamDto teamDto, Authentication authentication) {
        return ResponseEntity.ok(teamService.createTeam(teamDto, authentication.getName()));
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinTeam(@RequestBody java.util.Map<String, String> request,
            Authentication authentication) {
        String inviteCode = request.get("inviteCode");
        try {
            return ResponseEntity.ok(teamService.joinTeam(inviteCode, authentication.getName()));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.ok(java.util.Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TeamDto>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    @GetMapping("/my-teams")
    public ResponseEntity<List<TeamDto>> getMyTeams(Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyTeams(authentication.getName()));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<com.esports.dto.TeamMemberDto>> getTeamMembers(@PathVariable java.util.UUID teamId) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable java.util.UUID teamId, @PathVariable java.util.UUID userId,
            Authentication authentication) {
        teamService.removeMember(teamId, userId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<?> deleteTeam(@PathVariable java.util.UUID teamId, Authentication authentication) {
        teamService.deleteTeam(teamId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
