package com.esports.service;

import com.esports.dto.GameProfileRequestDto;
import com.esports.entity.User;

import java.util.List;
import java.util.UUID;

public interface GameProfileVerificationService {
    GameProfileRequestDto submitRequest(User user, String gameName, String freeFireUid, Integer gameLevel);
    GameProfileRequestDto getMyLatestRequest(String userEmail);
    List<GameProfileRequestDto> getPendingRequests(String adminEmail);
    GameProfileRequestDto approveRequest(UUID requestId, String adminEmail);
    GameProfileRequestDto rejectRequest(UUID requestId, String rejectionReason, String adminEmail);
}
