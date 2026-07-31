package com.esports.serviceImpl;

import com.esports.dto.TournamentDto;
import com.esports.entity.Tournament;
import com.esports.entity.User;
import com.esports.repository.TournamentRepository;
import com.esports.repository.UserRepository;
import com.esports.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

import com.esports.dto.TournamentRegistrationDto;
import com.esports.dto.TeamMemberDto;
import com.esports.dto.TournamentResultUpdateDto;
import com.esports.entity.Team;
import com.esports.entity.TournamentRegistration;
import com.esports.repository.TeamRepository;
import com.esports.repository.TeamMemberRepository;
import com.esports.repository.TournamentRegistrationRepository;
import com.esports.entity.Wallet;
import com.esports.entity.Transaction;
import com.esports.entity.TransactionType;
import com.esports.entity.TransactionStatus;
import com.esports.repository.WalletRepository;
import com.esports.repository.TransactionRepository;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TournamentServiceImpl implements TournamentService {

    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public TournamentDto createTournament(TournamentDto tournamentDto, String userEmail) {
        User organizer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Tournament tournament = new Tournament();
        tournament.setName(tournamentDto.getName());
        tournament.setDescription(tournamentDto.getDescription());
        tournament.setEntryFee(tournamentDto.getEntryFee());
        tournament.setPrizePool(tournamentDto.getPrizePool());
        
        if (tournamentDto.getPerKillPrize() != null) tournament.setPerKillPrize(tournamentDto.getPerKillPrize());
        if (tournamentDto.getFirstPrize() != null) tournament.setFirstPrize(tournamentDto.getFirstPrize());
        if (tournamentDto.getSecondPrize() != null) tournament.setSecondPrize(tournamentDto.getSecondPrize());
        if (tournamentDto.getThirdPrize() != null) tournament.setThirdPrize(tournamentDto.getThirdPrize());

        tournament.setGameMap(tournamentDto.getGameMap());
        tournament.setGameMode(tournamentDto.getGameMode());
        tournament.setMatchTiming(tournamentDto.getMatchTiming());
        tournament.setRegistrationClosingTime(tournamentDto.getRegistrationClosingTime());
        tournament.setOrganizer(organizer);

        Tournament saved = tournamentRepository.save(tournament);

        return mapToTournamentDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentDto> getAllTournaments() {
        return tournamentRepository.findAll().stream()
                .filter(t -> t.getIsDeleted() == null || !t.getIsDeleted())
                .map(this::mapToTournamentDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TournamentRegistrationDto registerForTournament(UUID tournamentId, UUID teamId, String userEmail) {
        User captain = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (captain.getGameName() == null || captain.getGameName().trim().isEmpty() ||
            captain.getFreeFireUid() == null || captain.getFreeFireUid().trim().isEmpty()) {
            throw new RuntimeException("Please update your In-Game Name and Free Fire UID in your profile before registering.");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getRegistrationClosingTime() != null && java.time.LocalDateTime.now().isAfter(tournament.getRegistrationClosingTime())) {
            throw new RuntimeException("Registration for this tournament is closed");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Only captain can register the team
        if (!team.getCaptain().getId().equals(captain.getId())) {
            throw new RuntimeException("Only the team captain can register for tournaments");
        }

        if (registrationRepository.existsByTournament_IdAndTeam_Id(tournamentId, teamId)) {
            throw new RuntimeException("Team is already registered for this tournament");
        }

        long memberCount = teamMemberRepository.findByTeam_Id(team.getId()).size();
        int assignedSlot = assignSlotAndValidateCapacity(tournament, memberCount);

        // Handle Payment
        if (tournament.getEntryFee() != null && tournament.getEntryFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(captain.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            
            if (wallet.getBalance() == null) {
                wallet.setBalance(java.math.BigDecimal.ZERO);
            }

            if (wallet.getBalance().compareTo(tournament.getEntryFee()) < 0) {
                throw new RuntimeException("INSUFFICIENT_BALANCE: Your wallet balance is lower than the entry fee.");
            }

            wallet.setBalance(wallet.getBalance().subtract(tournament.getEntryFee()));
            Wallet savedWallet = walletRepository.save(wallet);

            Transaction transaction = new Transaction();
            transaction.setWallet(savedWallet);
            transaction.setAmount(tournament.getEntryFee());
            // Assuming WITHDRAWAL is available, if we need specific type we can check TransactionType
            transaction.setTransactionType(TransactionType.WITHDRAWAL); 
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setPaymentReference("TOUR_" + tournament.getId().toString().substring(0,8) + "_TEAM_" + team.getId().toString().substring(0,8));
            transaction.setDescription("Registration Fee for " + tournament.getName());
            transactionRepository.save(transaction);
        }

        TournamentRegistration registration = new TournamentRegistration();
        registration.setTournament(tournament);
        registration.setTeam(team);
        registration.setSlotNumber(assignedSlot);
        registration = registrationRepository.save(registration);

        return mapToRegistrationDto(registration);
    }

    @Override
    @Transactional
    public TournamentRegistrationDto registerSoloForTournament(UUID tournamentId, String userEmail) {
        User player = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (player.getGameName() == null || player.getGameName().trim().isEmpty() ||
            player.getFreeFireUid() == null || player.getFreeFireUid().trim().isEmpty()) {
            throw new RuntimeException("Please update your In-Game Name and Free Fire UID in your profile before registering.");
        }

        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getRegistrationClosingTime() != null && java.time.LocalDateTime.now().isAfter(tournament.getRegistrationClosingTime())) {
            throw new RuntimeException("Registration for this tournament is closed");
        }

        if (!"Full Map - Solo".equalsIgnoreCase(tournament.getGameMode())) {
            throw new RuntimeException("This tournament is not a Solo mode tournament");
        }

        int assignedSlot = assignSlotAndValidateCapacity(tournament, 1);

        // Handle Payment
        if (tournament.getEntryFee() != null && tournament.getEntryFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Wallet wallet = walletRepository.findByUserId(player.getId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));
            
            if (wallet.getBalance() == null) {
                wallet.setBalance(java.math.BigDecimal.ZERO);
            }
            
            if (wallet.getBalance().compareTo(tournament.getEntryFee()) < 0) {
                throw new RuntimeException("INSUFFICIENT_BALANCE: Your wallet balance is lower than the entry fee.");
            }

            wallet.setBalance(wallet.getBalance().subtract(tournament.getEntryFee()));
            Wallet savedWallet = walletRepository.save(wallet);

            Transaction transaction = new Transaction();
            transaction.setWallet(savedWallet);
            transaction.setAmount(tournament.getEntryFee());
            transaction.setTransactionType(TransactionType.WITHDRAWAL); 
            transaction.setStatus(TransactionStatus.SUCCESS);
            transaction.setPaymentReference("TOUR_" + tournament.getId().toString().substring(0,8) + "_SOLO_" + player.getId().toString().substring(0,8));
            transaction.setDescription("Solo Registration Fee for " + tournament.getName());
            transactionRepository.save(transaction);
        }

        // Auto-create Solo Team
        Team team = new Team();
        team.setName(player.getGameName() != null ? player.getGameName() + " (Solo)" : "Solo Player");
        team.setCaptain(player);
        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        team.setInviteCode(inviteCode);
        Team savedTeam = teamRepository.save(team);

        // Add user as team member
        com.esports.entity.TeamMember member = new com.esports.entity.TeamMember();
        com.esports.entity.TeamMember.TeamMemberId memberId = new com.esports.entity.TeamMember.TeamMemberId();
        memberId.setTeamId(savedTeam.getId());
        memberId.setUserId(player.getId());
        member.setId(memberId);
        member.setTeam(savedTeam);
        member.setUser(player);
        member.setMemberRole("CAPTAIN");
        teamMemberRepository.save(member);

        // Register Team to Tournament
        TournamentRegistration registration = new TournamentRegistration();
        registration.setTournament(tournament);
        registration.setTeam(savedTeam);
        registration.setSlotNumber(assignedSlot);
        registration = registrationRepository.save(registration);

        return mapToRegistrationDto(registration);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentRegistrationDto> getRegistrationsForTournament(UUID tournamentId, String userEmail) {
        // Here we could verify if user is admin, but we'll assume controller handles roles, or we do basic check
        User admin = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Only admins can view all registrations");
        }

        return registrationRepository.findByTournament_Id(tournamentId).stream()
                .map(this::mapToRegistrationDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, String>> getRegisteredTeamsForParticipant(UUID tournamentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all teams this user is part of
        List<Team> userTeams = teamMemberRepository.findByUser_Id(user.getId()).stream()
                .map(tm -> tm.getTeam())
                .collect(Collectors.toList());

        // Get all registrations for the tournament
        List<TournamentRegistration> registrations = registrationRepository.findByTournament_Id(tournamentId);

        // Check if any of the user's teams are registered
        boolean isParticipant = registrations.stream()
                .anyMatch(reg -> userTeams.stream().anyMatch(t -> t.getId().equals(reg.getTeam().getId())));

        if (!isParticipant && !"ROLE_ADMIN".equals(user.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(user.getRole().getName())) {
            throw new RuntimeException("You must be registered in this tournament to view the participants");
        }

        return registrations.stream().map(reg -> {
            Map<String, String> teamData = new HashMap<>();
            teamData.put("id", reg.getTeam().getId().toString());
            teamData.put("name", reg.getTeam().getName());
            if (reg.getTeam().getLogoUrl() != null) {
                teamData.put("logoUrl", reg.getTeam().getLogoUrl());
            }
            if (reg.getSlotNumber() != null) {
                teamData.put("slotNumber", reg.getSlotNumber().toString());
            }
            return teamData;
        }).collect(Collectors.toList());
    }

    @Override
    public TournamentDto cancelTournament(UUID tournamentId, String adminEmail) {
        verifyAdmin(adminEmail);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        refundAllRegisteredTeams(tournament);
        
        tournament.setStatus("Cancelled");
        tournament = tournamentRepository.save(tournament);
        
        TournamentDto response = new TournamentDto();
        response.setId(tournament.getId());
        response.setName(tournament.getName());
        response.setDescription(tournament.getDescription());
        response.setEntryFee(tournament.getEntryFee());
        response.setPrizePool(tournament.getPrizePool());
        response.setPerKillPrize(tournament.getPerKillPrize());
        response.setFirstPrize(tournament.getFirstPrize());
        response.setSecondPrize(tournament.getSecondPrize());
        response.setThirdPrize(tournament.getThirdPrize());
        response.setStatus(tournament.getStatus());
        response.setGameMap(tournament.getGameMap());
        response.setGameMode(tournament.getGameMode());
        response.setMatchTiming(tournament.getMatchTiming());
        return response;
    }

    @Override
    public TournamentDto rescheduleTournament(UUID tournamentId, java.time.LocalDateTime newTiming, String adminEmail) {
        verifyAdmin(adminEmail);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        tournament.setMatchTiming(newTiming);
        if ("Cancelled".equals(tournament.getStatus())) {
            tournament.setStatus("Upcoming"); // Bring it back from cancellation if rescheduled
        }
        tournament = tournamentRepository.save(tournament);
        
        TournamentDto response = new TournamentDto();
        response.setId(tournament.getId());
        response.setName(tournament.getName());
        response.setDescription(tournament.getDescription());
        response.setEntryFee(tournament.getEntryFee());
        response.setPrizePool(tournament.getPrizePool());
        response.setPerKillPrize(tournament.getPerKillPrize());
        response.setFirstPrize(tournament.getFirstPrize());
        response.setSecondPrize(tournament.getSecondPrize());
        response.setThirdPrize(tournament.getThirdPrize());
        response.setStatus(tournament.getStatus());
        response.setGameMap(tournament.getGameMap());
        response.setGameMode(tournament.getGameMode());
        response.setMatchTiming(tournament.getMatchTiming());
        return response;
    }

    @Override
    public void deleteTournament(UUID tournamentId, String adminEmail) {
        verifyAdmin(adminEmail);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        refundAllRegisteredTeams(tournament);
        
        tournament.setIsDeleted(true);
        tournamentRepository.save(tournament);
    }

    @Override
    public void removeTeamFromTournament(UUID tournamentId, UUID teamId, String adminEmail) {
        verifyAdmin(adminEmail);
        List<TournamentRegistration> registrations = registrationRepository.findByTournament_Id(tournamentId);
        
        TournamentRegistration regToRemove = registrations.stream()
                .filter(reg -> reg.getTeam().getId().equals(teamId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        
        registrationRepository.delete(regToRemove);
    }

    @Override
    public com.esports.dto.TeamDto joinTournamentViaInvite(UUID tournamentId, String inviteCode, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "User not found"));

        if (user.getGameName() == null || user.getGameName().trim().isEmpty() ||
            user.getFreeFireUid() == null || user.getFreeFireUid().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Please update your In-Game Name and Free Fire UID in your profile before joining."
            );
        }

        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid invite code"));

        // Verify team is registered for this tournament
        java.util.Optional<TournamentRegistration> registration = registrationRepository.findByTournament_IdAndTeam_Id(tournamentId, team.getId());
        if (registration.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Team is not registered for this tournament");
        }

        // Enforce maximum team size based on tournament game mode
        Tournament tournament = registration.get().getTournament();
        String mode = tournament.getGameMode();
        int maxMembers = 4; // Default to 4
        if (mode != null) {
            if (mode.equalsIgnoreCase("Full Map - Solo") || mode.equalsIgnoreCase("SOLO")) {
                maxMembers = 1;
            } else if (mode.equalsIgnoreCase("Full Map - Duo") || mode.equalsIgnoreCase("DUO")) {
                maxMembers = 2;
            } else if (mode.equalsIgnoreCase("Full Map - Squad") || mode.equalsIgnoreCase("SQUAD")) {
                maxMembers = 4;
            } else if (mode.equalsIgnoreCase("Clash Squad") || mode.equalsIgnoreCase("CLASH_SQUAD")) {
                maxMembers = 4;
            }
        }

        long memberCount = teamMemberRepository.findByTeam_Id(team.getId()).size();
        if (memberCount >= maxMembers) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                "Team is full (maximum " + maxMembers + " members for " + (mode != null ? mode : "this mode") + ")"
            );
        }

        boolean alreadyMember = teamMemberRepository.findByTeam_IdAndUser_Id(team.getId(), user.getId()).isPresent();
        if (alreadyMember) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "You are already a member of this team");
        }

        com.esports.entity.TeamMember.TeamMemberId memberId = new com.esports.entity.TeamMember.TeamMemberId();
        memberId.setTeamId(team.getId());
        memberId.setUserId(user.getId());

        com.esports.entity.TeamMember teamMember = new com.esports.entity.TeamMember();
        teamMember.setId(memberId);
        teamMember.setTeam(team);
        teamMember.setUser(user);
        teamMember.setMemberRole("Player");

        teamMemberRepository.save(teamMember);

        com.esports.dto.TeamDto responseDto = new com.esports.dto.TeamDto();
        responseDto.setId(team.getId());
        responseDto.setName(team.getName());
        responseDto.setLogoUrl(team.getLogoUrl());
        responseDto.setCaptainId(team.getCaptain().getId());
        responseDto.setInviteCode(team.getInviteCode());
        responseDto.setCaptainFreeFireUid(team.getCaptain().getFreeFireUid());

        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentDto> getMyRegisteredTournaments(String userEmail) {
        List<Tournament> registeredTournaments = tournamentRepository.findTournamentsByUserEmail(userEmail);
        return registeredTournaments.stream().map(this::mapToTournamentDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentDto> getUserRegisteredTournaments(UUID userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        List<Tournament> registeredTournaments = tournamentRepository.findTournamentsByUserId(userId);
        return registeredTournaments.stream().map(this::mapToTournamentDto).collect(Collectors.toList());
    }

    private TournamentDto mapToTournamentDto(Tournament t) {
        TournamentDto dto = new TournamentDto();
        dto.setId(t.getId());
        dto.setName(t.getName());
        dto.setDescription(t.getDescription());
        dto.setEntryFee(t.getEntryFee());
        dto.setPrizePool(t.getPrizePool());
        dto.setPerKillPrize(t.getPerKillPrize());
        dto.setFirstPrize(t.getFirstPrize());
        dto.setSecondPrize(t.getSecondPrize());
        dto.setThirdPrize(t.getThirdPrize());
        dto.setStatus(t.getStatus());
        dto.setGameMap(t.getGameMap());
        dto.setGameMode(t.getGameMode());
        dto.setMatchTiming(t.getMatchTiming());
        dto.setRegistrationClosingTime(t.getRegistrationClosingTime());
        dto.setRegisteredCount((int) registrationRepository.countByTournament_Id(t.getId()));
        dto.setMaxCapacity(getMaxCapacityForMode(t.getGameMode()));
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    private int getMaxCapacityForMode(String mode) {
        if (mode == null) return 999;
        if (mode.equalsIgnoreCase("Clash Squad") || mode.equalsIgnoreCase("CLASH_SQUAD")) {
            return 2;
        } else if (mode.equalsIgnoreCase("Full Map - Solo") || mode.equalsIgnoreCase("SOLO")) {
            return 50;
        } else if (mode.equalsIgnoreCase("Full Map - Duo") || mode.equalsIgnoreCase("DUO")) {
            return 25;
        } else if (mode.equalsIgnoreCase("Full Map - Squad") || mode.equalsIgnoreCase("SQUAD")) {
            return 12;
        }
        return 999;
    }

    private void verifyAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "User not found"));
        String role = admin.getRole() != null ? admin.getRole().getName() : null;
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_SUPER_ADMIN".equals(role)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Admin privileges required");
        }
        if ("ROLE_ADMIN".equals(role)) {
            verifyPermission(admin, "MANAGE_TOURNAMENTS");
        }
    }

    private void verifyPermission(User admin, String requiredPermission) {
        if ("ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            return;
        }
        String permissions = admin.getPermissions();
        if (permissions != null && !permissions.trim().isEmpty()) {
            java.util.List<String> permList = java.util.Arrays.asList(permissions.split(","));
            if (!permList.contains(requiredPermission)) {
                throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
            }
        }
    }

    private void refundAllRegisteredTeams(Tournament tournament) {
        List<TournamentRegistration> registrations = registrationRepository.findByTournament_Id(tournament.getId());
        
        if (tournament.getEntryFee() != null && tournament.getEntryFee().compareTo(java.math.BigDecimal.ZERO) > 0) {
            for (TournamentRegistration reg : registrations) {
                User captain = reg.getTeam().getCaptain();
                Wallet wallet = walletRepository.findByUserId(captain.getId()).orElse(null);
                
                if (wallet != null) {
                    if (wallet.getBalance() == null) {
                        wallet.setBalance(java.math.BigDecimal.ZERO);
                    }
                    wallet.setBalance(wallet.getBalance().add(tournament.getEntryFee()));
                    Wallet savedWallet = walletRepository.save(wallet);

                    Transaction transaction = new Transaction();
                    transaction.setWallet(savedWallet);
                    transaction.setAmount(tournament.getEntryFee());
                    transaction.setTransactionType(TransactionType.DEPOSIT);
                    transaction.setStatus(TransactionStatus.SUCCESS);
                    transaction.setPaymentReference("REFUND_" + tournament.getId().toString().substring(0,8) + "_" + reg.getTeam().getId().toString().substring(0,8));
                    transaction.setDescription("Refund: Tournament Cancelled - " + tournament.getName());
                    transactionRepository.save(transaction);
                }
            }
        }
        
        // Remove all registrations to enforce re-registration if revived
        registrationRepository.deleteAll(registrations);
    }

    private int assignSlotAndValidateCapacity(Tournament tournament, long teamMemberCount) {
        String mode = tournament.getGameMode();
        int maxTeams = getMaxCapacityForMode(mode);
        
        if (mode != null) {
            if ((mode.equalsIgnoreCase("Full Map - Solo") || mode.equalsIgnoreCase("SOLO")) && teamMemberCount > 1) {
                throw new RuntimeException("For Solo mode, team size cannot exceed 1 member.");
            } else if ((mode.equalsIgnoreCase("Full Map - Duo") || mode.equalsIgnoreCase("DUO")) && teamMemberCount > 2) {
                throw new RuntimeException("For Duo mode, team size cannot exceed 2 members.");
            } else if ((mode.equalsIgnoreCase("Full Map - Squad") || mode.equalsIgnoreCase("SQUAD")) && teamMemberCount > 4) {
                throw new RuntimeException("For Squad mode, team size cannot exceed 4 members.");
            }
        }

        List<TournamentRegistration> existingRegs = registrationRepository.findByTournament_Id(tournament.getId());
        if (existingRegs.size() >= maxTeams) {
            throw new RuntimeException("Registration failed: Tournament has reached its maximum capacity of " + maxTeams + " slots.");
        }

        java.util.Set<Integer> usedSlots = existingRegs.stream()
                .map(TournamentRegistration::getSlotNumber)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        for (int i = 1; i <= maxTeams; i++) {
            if (!usedSlots.contains(i)) {
                return i;
            }
        }
        
        throw new RuntimeException("Registration failed: No available slots found.");
    }

    @Override
    @Transactional
    public TournamentDto updateTournamentResults(UUID tournamentId, TournamentResultUpdateDto resultDto, String adminEmail) {
        verifyAdmin(adminEmail);
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        List<TournamentRegistration> registrations = registrationRepository.findByTournament_Id(tournamentId);

        // Check if tournament is already finished, to avoid duplicate credit/wallet updates
        boolean alreadyFinished = "Finished".equalsIgnoreCase(tournament.getStatus());

        for (TournamentRegistration reg : registrations) {
            UUID teamId = reg.getTeam().getId();
            
            // Determine placement
            Integer placement = null;
            if (teamId.equals(resultDto.getFirstPlaceTeamId())) {
                placement = 1;
            } else if (teamId.equals(resultDto.getSecondPlaceTeamId())) {
                placement = 2;
            } else if (teamId.equals(resultDto.getThirdPlaceTeamId())) {
                placement = 3;
            }
            reg.setPlacement(placement);

            // Determine kills
            Integer kills = 0;
            if (resultDto.getTeamKills() != null && resultDto.getTeamKills().containsKey(teamId)) {
                kills = resultDto.getTeamKills().get(teamId);
            }
            reg.setKills(kills);

            registrationRepository.save(reg);

            // Distribute prizes to Captain if this is the first time the tournament results are being finalized
            if (!alreadyFinished) {
                java.math.BigDecimal prizeWon = java.math.BigDecimal.ZERO;
                
                // Placement prize
                if (placement != null) {
                    if (placement == 1 && tournament.getFirstPrize() != null) {
                        prizeWon = prizeWon.add(tournament.getFirstPrize());
                    } else if (placement == 2 && tournament.getSecondPrize() != null) {
                        prizeWon = prizeWon.add(tournament.getSecondPrize());
                    } else if (placement == 3 && tournament.getThirdPrize() != null) {
                        prizeWon = prizeWon.add(tournament.getThirdPrize());
                    }
                }
                
                // Kill prize
                if (kills > 0 && tournament.getPerKillPrize() != null) {
                    java.math.BigDecimal killReward = tournament.getPerKillPrize().multiply(new java.math.BigDecimal(kills));
                    prizeWon = prizeWon.add(killReward);
                }

                if (prizeWon.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    User captain = reg.getTeam().getCaptain();
                    Wallet wallet = walletRepository.findByUserId(captain.getId())
                            .orElseThrow(() -> new RuntimeException("Wallet not found for user: " + captain.getEmail()));
                    
                    if (wallet.getBalance() == null) {
                        wallet.setBalance(java.math.BigDecimal.ZERO);
                    }
                    wallet.setBalance(wallet.getBalance().add(prizeWon));
                    walletRepository.save(wallet);

                    Transaction transaction = new Transaction();
                    transaction.setWallet(wallet);
                    transaction.setAmount(prizeWon);
                    transaction.setTransactionType(TransactionType.DEPOSIT);
                    transaction.setStatus(TransactionStatus.SUCCESS);
                    transaction.setPaymentReference("PRIZE_" + tournament.getId().toString().substring(0, 8) + "_" + reg.getTeam().getId().toString().substring(0, 8));
                    transaction.setDescription("Tournament Prize Won: " + tournament.getName() + 
                            (placement != null ? " (Rank " + placement + ")" : "") + 
                            (kills > 0 ? " with " + kills + " kills" : ""));
                    transactionRepository.save(transaction);
                }
            }
        }

        tournament.setStatus("Finished");
        tournament = tournamentRepository.save(tournament);

        return mapToTournamentDto(tournament);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TournamentRegistrationDto> getTournamentResults(UUID tournamentId) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        return registrationRepository.findByTournament_Id(tournamentId).stream()
                .map(this::mapToRegistrationDto)
                .sorted((r1, r2) -> {
                    Integer p1 = r1.getPlacement();
                    Integer p2 = r2.getPlacement();
                    if (p1 != null && p2 != null) return p1.compareTo(p2);
                    if (p1 != null) return -1;
                    if (p2 != null) return 1;

                    Integer k1 = r1.getKills() != null ? r1.getKills() : 0;
                    Integer k2 = r2.getKills() != null ? r2.getKills() : 0;
                    return k2.compareTo(k1);
                })
                .collect(Collectors.toList());
    }

    private TournamentRegistrationDto mapToRegistrationDto(TournamentRegistration registration) {
        TournamentRegistrationDto dto = new TournamentRegistrationDto();
        dto.setId(registration.getId());
        dto.setTournamentId(registration.getTournament().getId());
        dto.setTeamId(registration.getTeam().getId());
        dto.setTeamName(registration.getTeam().getName());
        dto.setTeamLogoUrl(registration.getTeam().getLogoUrl());
        dto.setCaptainEmail(registration.getTeam().getCaptain().getEmail());
        dto.setCaptainGameName(registration.getTeam().getCaptain().getGameName());
        dto.setCaptainFreeFireUid(registration.getTeam().getCaptain().getFreeFireUid());
        dto.setRegisteredAt(registration.getRegisteredAt());
        dto.setSlotNumber(registration.getSlotNumber());
        dto.setPlacement(registration.getPlacement());
        dto.setKills(registration.getKills());
        dto.setStatus(registration.getStatus());

        if (registration.getTeam() != null) {
            List<TeamMemberDto> members = teamMemberRepository.findByTeam_Id(registration.getTeam().getId()).stream().map(member -> {
                TeamMemberDto memberDto = new TeamMemberDto();
                memberDto.setUserId(member.getUser().getId());
                memberDto.setGameName(member.getUser().getGameName());
                memberDto.setFreeFireUid(member.getUser().getFreeFireUid());
                memberDto.setAvatarUrl(member.getUser().getAvatarUrl());
                memberDto.setMemberRole(member.getMemberRole());
                memberDto.setJoinedAt(member.getJoinedAt());
                return memberDto;
            }).collect(Collectors.toList());
            dto.setMembers(members);
        }

        return dto;
    }
}
