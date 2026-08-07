package com.esports.serviceImpl;

import com.esports.dto.GameProfileRequestDto;
import com.esports.entity.GameProfileRequest;
import com.esports.entity.User;
import com.esports.repository.GameProfileRequestRepository;
import com.esports.repository.UserRepository;
import com.esports.service.GameProfileVerificationService;
import com.esports.service.NotificationService;
import com.esports.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameProfileVerificationServiceImpl implements GameProfileVerificationService {

    private final GameProfileRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @Override
    @Transactional
    public GameProfileRequestDto submitRequest(User user, String gameName, String freeFireUid, Integer gameLevel) {
        if (user == null) {
            throw new RuntimeException("User cannot be null");
        }

        // Check if there is already a PENDING request for this user, if so update it
        GameProfileRequest request = requestRepository.findFirstByUserAndStatusOrderByCreatedAtDesc(user, "PENDING")
                .orElseGet(() -> {
                    GameProfileRequest newReq = new GameProfileRequest();
                    newReq.setUser(user);
                    return newReq;
                });

        request.setGameName(gameName != null ? gameName.trim() : "");
        request.setFreeFireUid(freeFireUid != null ? freeFireUid.trim() : "");
        request.setGameLevel(gameLevel != null && gameLevel > 0 ? gameLevel : 1);
        request.setStatus("PENDING");
        request.setRejectionReason(null);

        GameProfileRequest saved = requestRepository.save(request);

        user.setGameProfileStatus("PENDING");
        userRepository.save(user);

        // Notify Admin of pending verification request
        realtimeEventPublisher.publishAdminUpdate("GAME_PROFILE_REQUEST_SUBMITTED", mapToDto(saved));

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public GameProfileRequestDto getMyLatestRequest(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<GameProfileRequest> requests = requestRepository.findByUserOrderByCreatedAtDesc(user);
        if (requests.isEmpty()) {
            return null;
        }
        return mapToDto(requests.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GameProfileRequestDto> getPendingRequests(String adminEmail) {
        verifyAdmin(adminEmail);
        return requestRepository.findByStatusOrderByCreatedAtAsc("PENDING")
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GameProfileRequestDto approveRequest(UUID requestId, String adminEmail) {
        verifyAdmin(adminEmail);
        GameProfileRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Request has already been processed");
        }

        request.setStatus("APPROVED");
        request.setRejectionReason(null);
        GameProfileRequest saved = requestRepository.save(request);

        User user = request.getUser();
        user.setGameName(request.getGameName());
        user.setFreeFireUid(request.getFreeFireUid());
        user.setGameLevel(request.getGameLevel());
        user.setGameProfileStatus("VERIFIED");
        userRepository.save(user);

        // Notify user via notifications & real-time events
        notificationService.createNotification(
                user,
                "In-Game Credentials Verified!",
                "Your In-Game Name (" + request.getGameName() + "), Free Fire UID (" + request.getFreeFireUid() + "), and Level (" + request.getGameLevel() + ") have been verified by Admin. You are now eligible to register for tournaments!"
        );

        realtimeEventPublisher.publishAdminUpdate("GAME_PROFILE_REQUEST_APPROVED", mapToDto(saved));
        realtimeEventPublisher.publishUserNotification(user.getEmail(), "Game profile verified!");

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public GameProfileRequestDto rejectRequest(UUID requestId, String rejectionReason, String adminEmail) {
        verifyAdmin(adminEmail);
        GameProfileRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Verification request not found"));

        if (!"PENDING".equalsIgnoreCase(request.getStatus())) {
            throw new RuntimeException("Request has already been processed");
        }

        request.setStatus("REJECTED");
        request.setRejectionReason(rejectionReason != null && !rejectionReason.trim().isEmpty() ? rejectionReason.trim() : "Credentials could not be verified.");
        GameProfileRequest saved = requestRepository.save(request);

        User user = request.getUser();
        user.setGameProfileStatus("REJECTED");
        userRepository.save(user);

        // Notify user
        notificationService.createNotification(
                user,
                "In-Game Credentials Rejected",
                "Your game credentials request was rejected. Reason: " + request.getRejectionReason()
        );

        realtimeEventPublisher.publishAdminUpdate("GAME_PROFILE_REQUEST_REJECTED", mapToDto(saved));
        realtimeEventPublisher.publishUserNotification(user.getEmail(), "Game profile rejected.");

        return mapToDto(saved);
    }

    private void verifyAdmin(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (!admin.hasPermission("MANAGE_USERS")) {
            throw new RuntimeException("Access denied: You do not have MANAGE_USERS permission.");
        }
    }

    private GameProfileRequestDto mapToDto(GameProfileRequest req) {
        GameProfileRequestDto dto = new GameProfileRequestDto();
        dto.setId(req.getId());
        if (req.getUser() != null) {
            dto.setUserId(req.getUser().getId());
            dto.setUserEmail(req.getUser().getEmail());
            dto.setUserAvatarUrl(req.getUser().getAvatarUrl());
            dto.setCurrentGameName(req.getUser().getGameName());
            dto.setCurrentFreeFireUid(req.getUser().getFreeFireUid());
            dto.setCurrentGameLevel(req.getUser().getGameLevel());
        }
        dto.setRequestedGameName(req.getGameName());
        dto.setRequestedFreeFireUid(req.getFreeFireUid());
        dto.setRequestedGameLevel(req.getGameLevel());
        dto.setStatus(req.getStatus());
        dto.setRejectionReason(req.getRejectionReason());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setUpdatedAt(req.getUpdatedAt());
        return dto;
    }
}
