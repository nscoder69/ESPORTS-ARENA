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
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(name = "free_fire_uid", length = 100)
    private String freeFireUid;

    @Column(name = "game_name", length = 100)
    private String gameName;

    @Column(name = "game_level")
    private Integer gameLevel = 1;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "last_active_at")
    private java.time.LocalDateTime lastActiveAt;

    @Column(name = "is_blocked", nullable = false)
    private Boolean isBlocked = false;

    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    public boolean hasPermission(String requiredPermission) {
        if ("ROLE_SUPER_ADMIN".equals(this.role != null ? this.role.getName() : null)) {
            return true;
        }
        if (permissions == null || permissions.trim().isEmpty()) {
            return true;
        }
        java.util.List<String> permList = java.util.Arrays.asList(permissions.split(","));
        return permList.contains(requiredPermission);
    }
}
