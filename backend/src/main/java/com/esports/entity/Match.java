package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "matches")
public class Match extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "room_id", length = 100)
    private String roomId;

    @Column(name = "room_password", length = 100)
    private String roomPassword;

    @Column(length = 50)
    private String status = "Pending";

    @Column(name = "start_time")
    private LocalDateTime startTime;
}
