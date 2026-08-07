package com.esports.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "game_profile_requests")
public class GameProfileRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "game_name", nullable = false, length = 100)
    private String gameName;

    @Column(name = "free_fire_uid", nullable = false, length = 100)
    private String freeFireUid;

    @Column(name = "game_level", nullable = false)
    private Integer gameLevel = 1;

    @Column(nullable = false, length = 50)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}
