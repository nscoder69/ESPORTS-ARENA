package com.esports.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "otp_verifications")
public class OtpVerification extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
