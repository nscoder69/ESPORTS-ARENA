package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "tournaments")
public class Tournament extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee = BigDecimal.ZERO;

    @Column(name = "prize_pool", precision = 10, scale = 2)
    private BigDecimal prizePool = BigDecimal.ZERO;

    @Column(name = "per_kill_prize", precision = 10, scale = 2)
    private BigDecimal perKillPrize = BigDecimal.ZERO;

    @Column(name = "first_prize", precision = 10, scale = 2)
    private BigDecimal firstPrize = BigDecimal.ZERO;

    @Column(name = "second_prize", precision = 10, scale = 2)
    private BigDecimal secondPrize = BigDecimal.ZERO;

    @Column(name = "third_prize", precision = 10, scale = 2)
    private BigDecimal thirdPrize = BigDecimal.ZERO;

    @Column(length = 50)
    private String status = "Upcoming";

    @Column(name = "game_map", length = 100)
    private String gameMap;

    @Column(name = "game_mode", length = 100)
    private String gameMode;

    @Column(name = "match_timing")
    private LocalDateTime matchTiming;

    @Column(name = "registration_closing_time")
    private LocalDateTime registrationClosingTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(name = "room_id", length = 100)
    private String roomId;

    @Column(name = "room_password", length = 100)
    private String roomPassword;

    @Column(name = "min_level")
    private Integer minLevel = 1;
}
