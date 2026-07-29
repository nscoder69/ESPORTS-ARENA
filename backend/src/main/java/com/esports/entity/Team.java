package com.esports.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "teams")
public class Team extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id", nullable = false)
    private User captain;

    @Column(name = "invite_code", unique = true, length = 10)
    private String inviteCode;
}
