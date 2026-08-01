package com.esports.controller;

import com.esports.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class RootSuperAdminController {

    private final AuthService authService;

    @GetMapping({"/make-super-admin", "/make-super-admin/{email:.+}", "/make-super-admin/**", "/make-super-admin-direct", "/make-super-admin-direct/{email:.+}", "/make-super-admin-direct/**"})
    public ResponseEntity<String> makeSuperAdmin(
            @PathVariable(value = "email", required = false) String pathEmail,
            @RequestParam(value = "email", required = false) String paramEmail,
            @RequestParam(value = "direct", required = false, defaultValue = "false") boolean direct,
            HttpServletRequest request) {
        String email = extractEmail(pathEmail, paramEmail, request);
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Please specify email parameter e.g. /make-super-admin?email=your-email@gmail.com");
        }
        String normalizedEmail = email.trim().toLowerCase();
        if (direct || request.getRequestURI().contains("direct")) {
            return ResponseEntity.ok(authService.makeSuperAdminDirect(normalizedEmail));
        }
        String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        return ResponseEntity.ok(authService.makeSuperAdmin(normalizedEmail, baseUrl));
    }

    private String extractEmail(String pathEmail, String paramEmail, HttpServletRequest request) {
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
}
