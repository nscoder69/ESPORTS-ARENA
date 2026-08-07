package com.esports.serviceImpl;

import com.esports.dto.TeamDto;
import com.esports.dto.TeamMemberDto;
import com.esports.entity.Team;
import com.esports.entity.TeamMember;
import com.esports.entity.User;
import com.esports.repository.TeamRepository;
import com.esports.repository.TeamMemberRepository;
import com.esports.repository.UserRepository;
import com.esports.repository.TournamentRegistrationRepository;
import com.esports.entity.TournamentRegistration;
import com.esports.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TournamentRegistrationRepository registrationRepository;

    @Override
    public TeamDto createTeam(TeamDto teamDto, String userEmail) {
        User captain = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (captain.getGameName() == null || captain.getGameName().trim().isEmpty() ||
            captain.getFreeFireUid() == null || captain.getFreeFireUid().trim().isEmpty()) {
            throw new RuntimeException("Please update your In-Game Name and Free Fire UID in your profile before creating a team.");
        }

        Team team = new Team();
        team.setName(teamDto.getName());
        team.setLogoUrl(teamDto.getLogoUrl());
        team.setCaptain(captain);
        team.setInviteCode(java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase());

        Team savedTeam = teamRepository.save(team);

        TeamMember.TeamMemberId memberId = new TeamMember.TeamMemberId();
        memberId.setTeamId(savedTeam.getId());
        memberId.setUserId(captain.getId());

        TeamMember captainMember = new TeamMember();
        captainMember.setId(memberId);
        captainMember.setTeam(savedTeam);
        captainMember.setUser(captain);
        captainMember.setMemberRole("Captain");
        teamMemberRepository.save(captainMember);

        TeamDto responseDto = new TeamDto();
        responseDto.setId(savedTeam.getId());
        responseDto.setName(savedTeam.getName());
        responseDto.setLogoUrl(savedTeam.getLogoUrl());
        responseDto.setCaptainId(captain.getId());
        responseDto.setInviteCode(savedTeam.getInviteCode());
        responseDto.setCaptainFreeFireUid(captain.getFreeFireUid());

        return responseDto;
    }

    @Override
    public TeamDto joinTeam(String inviteCode, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "User not found"));

        if (user.getGameName() == null || user.getGameName().trim().isEmpty() ||
            user.getFreeFireUid() == null || user.getFreeFireUid().trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Please update your In-Game Name and Free Fire UID in your profile before joining a team."
            );
        }

        Team team = teamRepository.findByInviteCode(inviteCode)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid invite code"));

        boolean alreadyMember = teamMemberRepository.findByTeam_IdAndUser_Id(team.getId(), user.getId()).isPresent();
        if (alreadyMember) {
            TeamDto responseDto = new TeamDto();
            responseDto.setId(team.getId());
            responseDto.setName(team.getName());
            responseDto.setLogoUrl(team.getLogoUrl());
            responseDto.setCaptainId(team.getCaptain().getId());
            responseDto.setInviteCode(team.getInviteCode());
            responseDto.setCaptainFreeFireUid(team.getCaptain().getFreeFireUid());
            return responseDto;
        }

        // Enforce maximum team size (strict max 4 members)
        int maxMembers = 4; // Default and absolute max limit
        String restrictiveMode = null;
        List<TournamentRegistration> registrations = registrationRepository.findByTeam_Id(team.getId());
        for (TournamentRegistration reg : registrations) {
            String mode = reg.getTournament().getGameMode();
            if (mode != null) {
                int limit = 4;
                if (mode.equalsIgnoreCase("Full Map - Solo") || mode.equalsIgnoreCase("SOLO")) {
                    limit = 1;
                } else if (mode.equalsIgnoreCase("Full Map - Duo") || mode.equalsIgnoreCase("DUO")) {
                    limit = 2;
                } else if (mode.equalsIgnoreCase("Full Map - Squad") || mode.equalsIgnoreCase("SQUAD")) {
                    limit = 4;
                } else if (mode.equalsIgnoreCase("Clash Squad") || mode.equalsIgnoreCase("CLASH_SQUAD")) {
                    limit = 4;
                }
                if (limit < maxMembers) {
                    maxMembers = limit;
                    restrictiveMode = mode;
                }
            }
        }

        long memberCount = teamMemberRepository.findByTeam_Id(team.getId()).size();
        if (memberCount >= maxMembers) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, 
                restrictiveMode != null 
                    ? "Team is full (maximum " + maxMembers + " members for " + restrictiveMode + ")"
                    : "Team is full (maximum " + maxMembers + " members allowed per team)"
            );
        }

        TeamMember.TeamMemberId memberId = new TeamMember.TeamMemberId();
        memberId.setTeamId(team.getId());
        memberId.setUserId(user.getId());

        TeamMember teamMember = new TeamMember();
        teamMember.setId(memberId);
        teamMember.setTeam(team);
        teamMember.setUser(user);
        teamMember.setMemberRole("Player");

        teamMemberRepository.save(teamMember);

        TeamDto responseDto = new TeamDto();
        responseDto.setId(team.getId());
        responseDto.setName(team.getName());
        responseDto.setLogoUrl(team.getLogoUrl());
        responseDto.setCaptainId(team.getCaptain().getId());
        responseDto.setInviteCode(team.getInviteCode());
        responseDto.setCaptainFreeFireUid(team.getCaptain().getFreeFireUid());

        return responseDto;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TeamDto> getAllTeams() {
        return teamRepository.findAll().stream().map(team -> {
            TeamDto dto = new TeamDto();
            dto.setId(team.getId());
            dto.setName(team.getName());
            dto.setLogoUrl(team.getLogoUrl());
            dto.setCaptainId(team.getCaptain().getId());
            dto.setInviteCode(team.getInviteCode());
            dto.setCaptainFreeFireUid(team.getCaptain().getFreeFireUid());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TeamDto> getMyTeams(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return teamMemberRepository.findByUser_Id(user.getId()).stream().map(member -> {
            Team team = member.getTeam();
            TeamDto dto = new TeamDto();
            dto.setId(team.getId());
            dto.setName(team.getName());
            dto.setLogoUrl(team.getLogoUrl());
            dto.setCaptainId(team.getCaptain().getId());
            dto.setInviteCode(team.getInviteCode());
            dto.setCaptainFreeFireUid(team.getCaptain().getFreeFireUid());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<TeamMemberDto> getTeamMembers(java.util.UUID teamId) {
        return teamMemberRepository.findByTeam_Id(teamId).stream().map(member -> {
            TeamMemberDto dto = new TeamMemberDto();
            dto.setUserId(member.getUser().getId());
            dto.setGameName(member.getUser().getGameName());
            dto.setFreeFireUid(member.getUser().getFreeFireUid());
            dto.setAvatarUrl(member.getUser().getAvatarUrl());
            dto.setMemberRole(member.getMemberRole());
            dto.setJoinedAt(member.getJoinedAt());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public void removeMember(java.util.UUID teamId, java.util.UUID userId, String requesterEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        boolean isCaptain = team.getCaptain().getEmail().equals(requesterEmail);
        boolean isSelf = requester.getId().equals(userId);

        if (!isCaptain && !isSelf) {
            throw new RuntimeException("Only the team captain or the member themselves can remove members");
        }

        if (team.getCaptain().getId().equals(userId)) {
            throw new RuntimeException("Captain cannot be removed");
        }

        TeamMember member = teamMemberRepository.findByTeam_IdAndUser_Id(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        teamMemberRepository.delete(member);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteTeam(java.util.UUID teamId, String requesterEmail) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
                
        if (!team.getCaptain().getEmail().equals(requesterEmail)) {
            throw new RuntimeException("Only the team captain can delete the team");
        }

        List<TournamentRegistration> registrations = registrationRepository.findByTeam_Id(teamId);
        if (!registrations.isEmpty()) {
            throw new RuntimeException("Cannot delete team that is currently registered in tournaments. Please unregister or complete the tournaments first.");
        }
        
        // Delete all members first (cascade)
        teamMemberRepository.deleteByTeam_Id(teamId);
        
        // Delete the team
        teamRepository.delete(team);
    }
}
