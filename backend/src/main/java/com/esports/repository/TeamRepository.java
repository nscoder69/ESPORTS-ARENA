package com.esports.repository;

import com.esports.entity.Team;
import com.esports.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, UUID> {
    List<Team> findByCaptain(User captain);
    java.util.Optional<Team> findByInviteCode(String inviteCode);
}
