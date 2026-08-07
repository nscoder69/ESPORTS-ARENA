package com.esports.controller;

import com.esports.dto.GameProfileRequestDto;
import com.esports.entity.User;
import com.esports.repository.UserRepository;
import com.esports.service.GameProfileVerificationService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GameProfileVerificationController {

    private final GameProfileVerificationService verificationService;
    private final UserRepository userRepository;

    @PostMapping("/users/game-profile/submit")
    public ResponseEntity<GameProfileRequestDto> submitVerificationRequest(
            @RequestBody SubmitProfileRequest body,
            Authentication authentication
    ) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        GameProfileRequestDto dto = verificationService.submitRequest(user, body.getGameName(), body.getFreeFireUid(), body.getGameLevel());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/users/game-profile/my-request")
    public ResponseEntity<GameProfileRequestDto> getMyLatestRequest(Authentication authentication) {
        String email = authentication.getName();
        GameProfileRequestDto dto = verificationService.getMyLatestRequest(email);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/admin/game-profile-requests")
    public ResponseEntity<List<GameProfileRequestDto>> getPendingRequests(Authentication authentication) {
        String adminEmail = authentication.getName();
        List<GameProfileRequestDto> requests = verificationService.getPendingRequests(adminEmail);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/admin/game-profile-requests/{id}/approve")
    public ResponseEntity<GameProfileRequestDto> approveRequest(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        GameProfileRequestDto dto = verificationService.approveRequest(id, adminEmail);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/admin/game-profile-requests/{id}/reject")
    public ResponseEntity<GameProfileRequestDto> rejectRequest(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason,
            Authentication authentication
    ) {
        String adminEmail = authentication.getName();
        GameProfileRequestDto dto = verificationService.rejectRequest(id, reason, adminEmail);
        return ResponseEntity.ok(dto);
    }

    @Data
    public static class SubmitProfileRequest {
        private String gameName;
        private String freeFireUid;
        private Integer gameLevel;
    }
}
