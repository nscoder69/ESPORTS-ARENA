package com.esports.repository;

import com.esports.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, UUID> {
    
    @Query("SELECT DISTINCT t FROM Tournament t " +
           "JOIN TournamentRegistration tr ON tr.tournament = t " +
           "JOIN TeamMember tm ON tm.team = tr.team " +
           "WHERE tm.user.email = :email AND t.isDeleted = false")
    List<Tournament> findTournamentsByUserEmail(@Param("email") String email);

    @Query("SELECT DISTINCT t FROM Tournament t " +
           "JOIN TournamentRegistration tr ON tr.tournament = t " +
           "JOIN TeamMember tm ON tm.team = tr.team " +
           "WHERE tm.user.id = :userId AND t.isDeleted = false")
    List<Tournament> findTournamentsByUserId(@Param("userId") java.util.UUID userId);
}
