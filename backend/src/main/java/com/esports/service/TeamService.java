package com.esports.service;

import com.esports.dto.TeamDto;
import com.esports.dto.TeamMemberDto;
import java.util.List;
import java.util.UUID;

public interface TeamService {
    TeamDto createTeam(TeamDto teamDto, String userEmail);

    TeamDto joinTeam(String inviteCode, String userEmail);

    List<TeamDto> getAllTeams();

    List<TeamDto> getMyTeams(String userEmail);

    List<TeamMemberDto> getTeamMembers(UUID teamId);

    void removeMember(UUID teamId, UUID userId, String requesterEmail);

    void deleteTeam(UUID teamId, String requesterEmail);
}
