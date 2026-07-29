package com.esports.repository;

import com.esports.entity.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMember.TeamMemberId> {

    // Spring Data JPA allows findByTeam_Id when there's a related entity
    List<TeamMember> findByTeam_Id(java.util.UUID teamId);
    
    List<TeamMember> findByUser_Id(java.util.UUID userId);

    Optional<TeamMember> findByTeam_IdAndUser_Id(java.util.UUID teamId, java.util.UUID userId);

    @org.springframework.transaction.annotation.Transactional
    void deleteByTeam_Id(java.util.UUID teamId);
}
