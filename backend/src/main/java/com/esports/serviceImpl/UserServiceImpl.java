package com.esports.serviceImpl;

import com.esports.entity.User;
import com.esports.repository.UserRepository;
import com.esports.service.FileUploadService;
import com.esports.service.UserService;
import com.esports.repository.WalletRepository;
import com.esports.repository.TransactionRepository;
import com.esports.repository.TeamRepository;
import com.esports.repository.TeamMemberRepository;
import com.esports.repository.TournamentRegistrationRepository;
import com.esports.repository.TournamentRepository;
import com.esports.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final com.esports.repository.RoleRepository roleRepository;
    private final FileUploadService fileUploadService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentRepository tournamentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final com.esports.service.MailService mailService;
    private final com.esports.service.GameProfileVerificationService gameProfileVerificationService;
    private final jakarta.persistence.EntityManager entityManager;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String ownerEmail;

    private final java.util.Map<java.util.UUID, PendingSuperAdminPromotion> pendingSuperAdminPromotions = new java.util.concurrent.ConcurrentHashMap<>();

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class PendingSuperAdminPromotion {
        private java.util.UUID targetUserId;
        private String role;
        private String permissions;
        private String confirmationCode;
        private java.time.LocalDateTime expiresAt;
    }

    @Override
    @Transactional
    public User updateProfile(String email, String gameName, String freeFireUid, Integer gameLevel, MultipartFile avatar) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ((gameName != null && !gameName.trim().isEmpty()) ||
            (freeFireUid != null && !freeFireUid.trim().isEmpty()) ||
            (gameLevel != null && gameLevel > 0)) {

            String reqGameName = (gameName != null && !gameName.trim().isEmpty()) ? gameName.trim() : (user.getGameName() != null ? user.getGameName() : "");
            String reqUid = (freeFireUid != null && !freeFireUid.trim().isEmpty()) ? freeFireUid.trim() : (user.getFreeFireUid() != null ? user.getFreeFireUid() : "");
            Integer reqLevel = (gameLevel != null && gameLevel > 0) ? gameLevel : (user.getGameLevel() != null ? user.getGameLevel() : 1);

            gameProfileVerificationService.submitRequest(user, reqGameName, reqUid, reqLevel);
        }

        if (avatar != null && !avatar.isEmpty()) {
            try {
                String avatarUrl = fileUploadService.saveAvatar(avatar);
                user.setAvatarUrl(avatarUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload avatar", e);
            }
        }

        return userRepository.save(user);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<com.esports.dto.UserDto> getAllUsers(String adminEmail) {
        verifyAdmin(adminEmail);

        return userRepository.findAll().stream()
                .filter(u -> u.getIsDeleted() == null || !u.getIsDeleted())
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<com.esports.dto.UserDto> getAllAdmins(String adminEmail) {
        verifySuperAdmin(adminEmail);

        return userRepository.findAll().stream()
                .filter(u -> (u.getIsDeleted() == null || !u.getIsDeleted()))
                .filter(u -> "ROLE_ADMIN".equals(u.getRole().getName()) || "ROLE_SUPER_ADMIN".equals(u.getRole().getName()))
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public com.esports.dto.UpdateUserRoleResponseDto updateUserRoleAndPermissions(java.util.UUID userId, com.esports.dto.UpdateAdminRoleRequest request, String adminEmail) {
        verifySuperAdmin(adminEmail);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String rawRole = request.getRole().trim().toUpperCase();
            final String targetRoleName = rawRole.startsWith("ROLE_") ? rawRole : "ROLE_" + rawRole;

            com.esports.entity.Role role = roleRepository.findByName(targetRoleName)
                    .orElseGet(() -> {
                        com.esports.entity.Role r = new com.esports.entity.Role();
                        r.setName(targetRoleName);
                        return roleRepository.save(r);
                    });

            targetUser.setRole(role);
        }

        if (request.getPermissions() != null) {
            targetUser.setPermissions(request.getPermissions().trim());
        }

        User updatedUser = userRepository.save(targetUser);
        return com.esports.dto.UpdateUserRoleResponseDto.builder()
                .requiresConfirmation(false)
                .message("User role and permissions updated successfully.")
                .user(convertToDto(updatedUser))
                .build();
    }

    @Override
    @Transactional
    public com.esports.dto.UpdateUserRoleResponseDto confirmSuperAdminPromotion(java.util.UUID userId, com.esports.dto.ConfirmSuperAdminRequest request, String adminEmail) {
        verifySuperAdmin(adminEmail);

        if (request == null || request.getConfirmationCode() == null || request.getConfirmationCode().trim().isEmpty()) {
            throw new RuntimeException("Confirmation code is required");
        }

        PendingSuperAdminPromotion pending = pendingSuperAdminPromotions.get(userId);
        if (pending == null) {
            throw new RuntimeException("No pending Super Admin promotion request found for this user or request has expired.");
        }

        if (pending.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            pendingSuperAdminPromotions.remove(userId);
            throw new RuntimeException("Super Admin promotion confirmation code has expired. Please initiate promotion again.");
        }

        if (!pending.getConfirmationCode().trim().equals(request.getConfirmationCode().trim())) {
            throw new RuntimeException("Invalid confirmation code. Please check your website owner email.");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        com.esports.entity.Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_SUPER_ADMIN role not found"));

        targetUser.setRole(superAdminRole);
        if (pending.getPermissions() != null) {
            targetUser.setPermissions(pending.getPermissions().trim());
        }

        User updatedUser = userRepository.save(targetUser);
        pendingSuperAdminPromotions.remove(userId);

        return com.esports.dto.UpdateUserRoleResponseDto.builder()
                .requiresConfirmation(false)
                .message("Super Admin privileges authorized and granted successfully!")
                .user(convertToDto(updatedUser))
                .build();
    }

    @Override
    @Transactional
    public void blockUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Admin user not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if ("ROLE_SUPER_ADMIN".equals(user.getRole() != null ? user.getRole().getName() : null) && !"ROLE_SUPER_ADMIN".equals(admin.getRole() != null ? admin.getRole().getName() : null)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Unauthorized: Sub-admin has no authority to block a Super Admin");
        }
        user.setIsBlocked(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unblockUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Admin user not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if ("ROLE_SUPER_ADMIN".equals(user.getRole() != null ? user.getRole().getName() : null) && !"ROLE_SUPER_ADMIN".equals(admin.getRole() != null ? admin.getRole().getName() : null)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Unauthorized: Sub-admin has no authority to unblock a Super Admin");
        }
        user.setIsBlocked(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Admin user not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if ("ROLE_SUPER_ADMIN".equals(user.getRole() != null ? user.getRole().getName() : null)) {
            if (!"ROLE_SUPER_ADMIN".equals(admin.getRole() != null ? admin.getRole().getName() : null)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Unauthorized: Sub-admin has no authority to delete a Super Admin");
            }
        }

        String userIdStr = userId.toString();

        // 1. Delete notifications
        entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 2. Delete game profile requests
        entityManager.createNativeQuery("DELETE FROM game_profile_requests WHERE user_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 3. Delete support tickets
        entityManager.createNativeQuery("DELETE FROM support_tickets WHERE user_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 4. Delete OTP verifications
        if (user.getEmail() != null) {
            entityManager.createNativeQuery("DELETE FROM otp_verifications WHERE email = :email")
                    .setParameter("email", user.getEmail())
                    .executeUpdate();
        }

        // 5. Delete chat messages
        entityManager.createNativeQuery("DELETE FROM chat_messages WHERE user_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 6. Delete team memberships
        entityManager.createNativeQuery("DELETE FROM team_members WHERE user_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 7. Find and delete teams captained by this user
        java.util.List<com.esports.entity.Team> captainTeams = teamRepository.findByCaptain(user);
        for (com.esports.entity.Team team : captainTeams) {
            String teamIdStr = team.getId().toString();
            entityManager.createNativeQuery("DELETE FROM match_results WHERE team_id = :teamId")
                    .setParameter("teamId", teamIdStr)
                    .executeUpdate();
            entityManager.createNativeQuery("DELETE FROM tournament_registrations WHERE team_id = :teamId")
                    .setParameter("teamId", teamIdStr)
                    .executeUpdate();
            entityManager.createNativeQuery("DELETE FROM team_members WHERE team_id = :teamId")
                    .setParameter("teamId", teamIdStr)
                    .executeUpdate();
            entityManager.createNativeQuery("DELETE FROM teams WHERE id = :teamId")
                    .setParameter("teamId", teamIdStr)
                    .executeUpdate();
        }

        // 8. Update organized tournaments to set organizer to null
        entityManager.createNativeQuery("UPDATE tournaments SET organizer_id = NULL WHERE organizer_id = :userId")
                .setParameter("userId", userIdStr)
                .executeUpdate();

        // 9. Delete wallet and transactions
        walletRepository.findByUserId(userId).ifPresent(wallet -> {
            String walletIdStr = wallet.getId().toString();
            entityManager.createNativeQuery("DELETE FROM transactions WHERE wallet_id = :walletId")
                    .setParameter("walletId", walletIdStr)
                    .executeUpdate();
            entityManager.createNativeQuery("DELETE FROM wallets WHERE id = :walletId")
                    .setParameter("walletId", walletIdStr)
                    .executeUpdate();
        });

        // 10. Delete user permanently
        userRepository.delete(user);
        userRepository.flush();
    }

    private com.esports.dto.UserDto convertToDto(User u) {
        com.esports.dto.UserDto dto = new com.esports.dto.UserDto();
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setRole(u.getRole().getName());
        dto.setGameName(u.getGameName());
        dto.setFreeFireUid(u.getFreeFireUid());
        dto.setGameLevel(u.getGameLevel() != null ? u.getGameLevel() : 1);
        dto.setGameProfileStatus(u.getGameProfileStatus() != null ? u.getGameProfileStatus() : "VERIFIED");
        dto.setAvatarUrl(u.getAvatarUrl());
        dto.setCreatedAt(u.getCreatedAt());
        dto.setLastActiveAt(u.getLastActiveAt());
        dto.setIsBlocked(u.getIsBlocked());
        dto.setPermissions(u.getPermissions());
        return dto;
    }

    private void verifyAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Admin user not found"));
        String role = admin.getRole() != null ? admin.getRole().getName() : null;
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_SUPER_ADMIN".equals(role)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Unauthorized: Only admins can perform this action");
        }
        if ("ROLE_ADMIN".equals(role)) {
            verifyPermission(admin, "MANAGE_USERS");
        }
    }

    private void verifyPermission(User admin, String requiredPermission) {
        if ("ROLE_SUPER_ADMIN".equals(admin.getRole() != null ? admin.getRole().getName() : null)) {
            return;
        }
        if (!admin.hasPermission(requiredPermission)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
        }
    }

    private void verifySuperAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized: Only Super Admin can perform this action");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
