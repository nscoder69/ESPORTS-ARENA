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

    @GetMapping({"/make-super-admin", "/make-super-admin/{email:.+}", "/make-super-admin/**"})
    public ResponseEntity<String> makeSuperAdmin(
            @PathVariable(value = "email", required = false) String pathEmail,
            @RequestParam(value = "email", required = false) String paramEmail,
            jakarta.servlet.http.HttpServletRequest request) {
        String email = extractEmail(pathEmail, paramEmail, request);
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Please specify email parameter e.g. /api/v1/test/make-super-admin?email=your-email@gmail.com");
        }
        final String targetEmail = email.trim().toLowerCase();
        String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();

        return ResponseEntity.ok(authService.makeSuperAdmin(targetEmail, baseUrl));
    }

    private String extractEmail(String pathEmail, String paramEmail, jakarta.servlet.http.HttpServletRequest request) {
        if (paramEmail != null && !paramEmail.trim().isEmpty()) {
            return paramEmail.trim();
        }
        if (pathEmail != null && !pathEmail.trim().isEmpty()) {
            return pathEmail.trim();
        }
        String uri = request.getRequestURI();
        int idx = uri.indexOf("/make-super-admin/");
        if (idx != -1) {
            String remaining = uri.substring(idx + "/make-super-admin/".length());
            try {
                remaining = java.net.URLDecoder.decode(remaining, java.nio.charset.StandardCharsets.UTF_8.name());
            } catch (Exception ignored) {}
            if (!remaining.trim().isEmpty()) {
                return remaining.trim();
            }
        }
        return null;
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
