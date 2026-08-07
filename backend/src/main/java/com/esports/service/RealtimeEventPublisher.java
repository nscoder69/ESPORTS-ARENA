package com.esports.service;

import com.esports.dto.RealtimeEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RealtimeEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishUserWalletUpdate(String userEmail, Object walletData, String message) {
        if (userEmail == null) return;
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("WALLET_UPDATE")
                    .message(message != null ? message : "Wallet balance updated")
                    .data(walletData)
                    .build();
            String destination = "/topic/user/" + userEmail.trim().toLowerCase() + "/wallet";
            messagingTemplate.convertAndSend(destination, event);
        } catch (Exception e) {
            log.error("Failed to publish wallet update event to {}", userEmail, e);
        }
    }

    public void publishUserNotification(String userEmail, Object notificationData) {
        if (userEmail == null) return;
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("NOTIFICATION_UPDATE")
                    .message("New notification received")
                    .data(notificationData)
                    .build();
            String destination = "/topic/user/" + userEmail.trim().toLowerCase() + "/notifications";
            messagingTemplate.convertAndSend(destination, event);
        } catch (Exception e) {
            log.error("Failed to publish notification event to {}", userEmail, e);
        }
    }

    public void publishUserSupportUpdate(String userEmail, Object ticketData) {
        if (userEmail == null) return;
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("SUPPORT_UPDATE")
                    .message("Support ticket updated")
                    .data(ticketData)
                    .build();
            String destination = "/topic/user/" + userEmail.trim().toLowerCase() + "/support";
            messagingTemplate.convertAndSend(destination, event);
        } catch (Exception e) {
            log.error("Failed to publish support event to {}", userEmail, e);
        }
    }

    public void publishTournamentUpdate(String message, Object tournamentData) {
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("TOURNAMENT_UPDATE")
                    .message(message != null ? message : "Tournaments updated")
                    .data(tournamentData)
                    .build();
            messagingTemplate.convertAndSend("/topic/tournaments", event);
        } catch (Exception e) {
            log.error("Failed to publish tournament update event", e);
        }
    }

    public void publishRoomCredentialsUpdate(java.util.UUID tournamentId, Object roomData) {
        if (tournamentId == null) return;
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("ROOM_CREDENTIALS_UPDATE")
                    .message("Room credentials updated")
                    .data(roomData)
                    .build();
            String destination = "/topic/tournaments/" + tournamentId.toString() + "/room";
            messagingTemplate.convertAndSend(destination, event);
            // Also notify general tournament listeners
            messagingTemplate.convertAndSend("/topic/tournaments", event);
        } catch (Exception e) {
            log.error("Failed to publish room credentials update for tournament {}", tournamentId, e);
        }
    }

    public void publishAdminUpdate(String updateType, Object payload) {
        try {
            RealtimeEventDto event = RealtimeEventDto.builder()
                    .type("ADMIN_UPDATE")
                    .message(updateType)
                    .data(payload)
                    .build();
            messagingTemplate.convertAndSend("/topic/admin/updates", event);
        } catch (Exception e) {
            log.error("Failed to publish admin update event", e);
        }
    }
}
