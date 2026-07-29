package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "team_members")
public class TeamMember {

    @EmbeddedId
    private TeamMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "member_role", nullable = false, length = 50)
    private String memberRole;

    @CreationTimestamp
    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @Embeddable
    @Getter
    @Setter
    public static class TeamMemberId implements Serializable {
        private java.util.UUID teamId;
        private java.util.UUID userId;
    }
}
