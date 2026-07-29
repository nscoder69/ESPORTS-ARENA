package com.esports.repository;

import com.esports.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByTournamentIdOrderByCreatedAtAsc(UUID tournamentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ChatMessage c WHERE c.user.id = :userId")
    void deleteByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);
}
