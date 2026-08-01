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

    private final com.esports.service.AuthService authService;

    @GetMapping({"/make-super-admin", "/make-super-admin/{email:.+}"})
    public ResponseEntity<String> makeSuperAdmin(
            @PathVariable(value = "email", required = false) String pathEmail,
            @RequestParam(value = "email", required = false) String paramEmail,
            jakarta.servlet.http.HttpServletRequest request) {
        String email = (pathEmail != null && !pathEmail.trim().isEmpty()) ? pathEmail : paramEmail;
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Please specify email parameter e.g. /api/v1/test/make-super-admin?email=your-email@gmail.com");
        }
        final String targetEmail = email.trim().toLowerCase();
        String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();

        return ResponseEntity.ok(authService.makeSuperAdmin(targetEmail, baseUrl));
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
