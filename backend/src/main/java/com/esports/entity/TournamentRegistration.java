package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tournament_registrations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tournament_id", "team_id"})
})
public class TournamentRegistration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    @Column(name = "slot_number")
    private Integer slotNumber;

    @Column(name = "placement")
    private Integer placement;

    @Column(name = "kills")
    private Integer kills = 0;

    @Column(length = 20, nullable = false)
    private String status = "REGISTERED"; // REGISTERED, CANCELLED
}
