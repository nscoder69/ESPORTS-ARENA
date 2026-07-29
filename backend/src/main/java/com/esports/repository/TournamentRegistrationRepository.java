package com.esports.repository;

import com.esports.entity.TournamentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, UUID> {
    List<TournamentRegistration> findByTournament_Id(UUID tournamentId);
    List<TournamentRegistration> findByTeam_Id(UUID teamId);
    Optional<TournamentRegistration> findByTournament_IdAndTeam_Id(UUID tournamentId, UUID teamId);
    boolean existsByTournament_IdAndTeam_Id(UUID tournamentId, UUID teamId);
    long countByTournament_Id(UUID tournamentId);
}
