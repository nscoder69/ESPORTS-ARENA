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
    private final FileUploadService fileUploadService;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentRepository tournamentRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    @Transactional
    public User updateProfile(String email, String gameName, String freeFireUid, MultipartFile avatar) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (gameName != null) {
            user.setGameName(gameName);
        }
        if (freeFireUid != null) {
            user.setFreeFireUid(freeFireUid);
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
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized: Only admins can perform this action");
        }

        return userRepository.findAll().stream()
                .filter(u -> u.getIsDeleted() == null || !u.getIsDeleted())
                .map(u -> {
                    com.esports.dto.UserDto dto = new com.esports.dto.UserDto();
                    dto.setId(u.getId());
                    dto.setEmail(u.getEmail());
                    dto.setRole(u.getRole().getName());
                    dto.setGameName(u.getGameName());
                    dto.setFreeFireUid(u.getFreeFireUid());
                    dto.setAvatarUrl(u.getAvatarUrl());
                    dto.setCreatedAt(u.getCreatedAt());
                    dto.setLastActiveAt(u.getLastActiveAt());
                    dto.setIsBlocked(u.getIsBlocked());
                    return dto;
                }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public void blockUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unblockUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(java.util.UUID userId, String adminEmail) {
        verifyAdmin(adminEmail);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 1. Delete chat messages
        chatMessageRepository.deleteByUserId(userId);

        // 2. Find and delete team memberships
        java.util.List<com.esports.entity.TeamMember> memberships = teamMemberRepository.findByUser_Id(userId);
        teamMemberRepository.deleteAll(memberships);

        // 3. Find and delete teams captained by this user
        java.util.List<com.esports.entity.Team> captainTeams = teamRepository.findByCaptain(user);
        for (com.esports.entity.Team team : captainTeams) {
            // Delete registrations for this team
            java.util.List<com.esports.entity.TournamentRegistration> registrations = tournamentRegistrationRepository.findByTeam_Id(team.getId());
            tournamentRegistrationRepository.deleteAll(registrations);
            // Delete all members of this team
            teamMemberRepository.deleteByTeam_Id(team.getId());
            // Delete team
            teamRepository.delete(team);
        }

        // 4. Update organized tournaments to set organizer to null
        tournamentRepository.findAll().stream()
                .filter(t -> t.getOrganizer() != null && t.getOrganizer().getId().equals(userId))
                .forEach(t -> {
                    t.setOrganizer(null);
                    tournamentRepository.save(t);
                });

        // 5. Delete wallet and transactions
        walletRepository.findByUserId(userId).ifPresent(wallet -> {
            java.util.List<com.esports.entity.Transaction> transactions = transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
            transactionRepository.deleteAll(transactions);
            walletRepository.delete(wallet);
        });

        // 6. Delete user permanently
        userRepository.delete(user);
    }

    private void verifyAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized: Only admins can perform this action");
        }
    }
}
