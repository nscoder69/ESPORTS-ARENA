package com.esports.repository;

import com.esports.entity.GameProfileRequest;
import com.esports.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameProfileRequestRepository extends JpaRepository<GameProfileRequest, UUID> {
    List<GameProfileRequest> findByStatusOrderByCreatedAtAsc(String status);
    List<GameProfileRequest> findByUserOrderByCreatedAtDesc(User user);
    Optional<GameProfileRequest> findFirstByUserAndStatusOrderByCreatedAtDesc(User user, String status);
}
