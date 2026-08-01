package com.esports.controller;

import com.esports.entity.Role;
import com.esports.entity.User;
import com.esports.repository.RoleRepository;
import com.esports.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class AdminTestController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @GetMapping("/make-admin/{email:.+}")
    public ResponseEntity<String> makeAdmin(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

        user.setRole(adminRole);
        userRepository.save(user);

        return ResponseEntity.ok("Successfully upgraded " + email + " to ROLE_ADMIN! Please log out and log back in to see changes.");
    }

    @GetMapping("/make-super-admin/{email:.+}")
    public ResponseEntity<String> makeSuperAdmin(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_SUPER_ADMIN");
                    return roleRepository.save(r);
                });

        user.setRole(superAdminRole);
        userRepository.save(user);

        return ResponseEntity.ok("Successfully upgraded " + email + " to ROLE_SUPER_ADMIN! Please log out and log back in on the website to apply your Super Admin access.");
    }

    @GetMapping("/remove-admin/{email:.+}")
    public ResponseEntity<String> removeAdmin(@PathVariable String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role playerRole = roleRepository.findByName("ROLE_PLAYER")
                .orElseThrow(() -> new RuntimeException("ROLE_PLAYER not found"));

        user.setRole(playerRole);
        userRepository.save(user);

        return ResponseEntity.ok("Successfully downgraded " + email + " to ROLE_PLAYER! Please log out and log back in to see changes.");
    }
}
