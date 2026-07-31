package com.esports.service;

import com.esports.dto.RoomCredentialsDto;
import com.esports.dto.RoomUpdateDto;
import com.esports.dto.TournamentDto;
import com.esports.dto.TournamentRegistrationDto;
import java.util.List;
import java.util.UUID;

public interface TournamentService {
    TournamentDto createTournament(TournamentDto tournamentDto, String userEmail);
    List<TournamentDto> getAllTournaments();
    TournamentRegistrationDto registerForTournament(UUID tournamentId, UUID teamId, String userEmail);
    TournamentRegistrationDto registerSoloForTournament(UUID tournamentId, String userEmail);
    List<TournamentRegistrationDto> getRegistrationsForTournament(UUID tournamentId, String userEmail);
    List<java.util.Map<String, String>> getRegisteredTeamsForParticipant(UUID tournamentId, String userEmail);
    com.esports.dto.TeamDto joinTournamentViaInvite(UUID tournamentId, String inviteCode, String userEmail);
    List<TournamentDto> getMyRegisteredTournaments(String userEmail);
    List<TournamentDto> getUserRegisteredTournaments(UUID userId, String adminEmail);
    
    // Admin Controls
    TournamentDto cancelTournament(UUID tournamentId, String adminEmail);
    TournamentDto rescheduleTournament(UUID tournamentId, java.time.LocalDateTime newTiming, String adminEmail);
    void deleteTournament(UUID tournamentId, String adminEmail);
    void removeTeamFromTournament(UUID tournamentId, UUID teamId, String adminEmail);
    
    TournamentDto updateTournamentResults(UUID tournamentId, com.esports.dto.TournamentResultUpdateDto resultDto, String adminEmail);
    List<TournamentRegistrationDto> getTournamentResults(UUID tournamentId);

    // Room ID & Password Controls
    TournamentDto updateRoomCredentials(UUID tournamentId, RoomUpdateDto updateDto, String adminEmail);
    RoomCredentialsDto getRoomCredentials(UUID tournamentId, String userEmail);
}
