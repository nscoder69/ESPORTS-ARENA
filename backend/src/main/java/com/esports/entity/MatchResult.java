package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
@Entity
@Table(name = "match_results")
public class MatchResult {

    @EmbeddedId
    private MatchResultId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("matchId")
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @Column(name = "kill_points")
    private Integer killPoints = 0;

    @Column(name = "placement_points")
    private Integer placementPoints = 0;

    @Column(name = "total_points")
    private Integer totalPoints = 0;

    @Embeddable
    @Getter
    @Setter
    public static class MatchResultId implements Serializable {
        private String matchId;
        private String teamId;
    }
}
