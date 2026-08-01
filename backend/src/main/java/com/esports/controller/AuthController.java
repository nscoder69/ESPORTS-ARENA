package com.esports.controller;

import com.esports.dto.AuthRequest;
import com.esports.dto.AuthResponse;
import com.esports.dto.RegisterRequest;
import com.esports.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> register(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "otp", required = false) String otp,
            @RequestParam(value = "freeFireUid", required = false) String freeFireUid,
            @RequestParam(value = "gameName", required = false) String gameName,
            @RequestParam(value = "avatar", required = false) org.springframework.web.multipart.MultipartFile avatar) {
        
        RegisterRequest request = new RegisterRequest();
        request.setEmail(email);
        request.setPassword(password);
        request.setFreeFireUid(freeFireUid);
        request.setGameName(gameName);
        request.setOtp(otp);
        
        return ResponseEntity.ok(authService.register(request, avatar));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam("email") String email) {
        authService.sendOtp(email);
        return ResponseEntity.ok(java.util.Map.of("message", "OTP sent successfully to " + email));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestParam("email") String email) {
        authService.sendForgotPasswordOtp(email);
        return ResponseEntity.ok(java.util.Map.of("message", "OTP sent successfully to " + email));
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody com.esports.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Password reset successfully. You can now login."));
    }

    @GetMapping({"/make-super-admin", "/make-super-admin/{email:.+}", "/make-super-admin/**"})
    public ResponseEntity<String> makeSuperAdmin(
            @PathVariable(value = "email", required = false) String pathEmail,
            @RequestParam(value = "email", required = false) String paramEmail,
            jakarta.servlet.http.HttpServletRequest request) {
        String email = extractEmail(pathEmail, paramEmail, request);
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Please specify email parameter e.g. /api/v1/auth/make-super-admin?email=your-email@gmail.com");
        }
        String baseUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromContextPath(request).build().toUriString();
        return ResponseEntity.ok(authService.makeSuperAdmin(email.trim().toLowerCase(), baseUrl));
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

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping(value = {"/verify-super-admin", "/confirm-super-admin-link"}, produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> confirmSuperAdminLink(@RequestParam("token") String token) {
        try {
            String resultMessage = authService.confirmSuperAdminViaToken(token);
            String targetFrontend = (frontendUrl != null && !frontendUrl.trim().isEmpty()) ? frontendUrl.trim() : "http://localhost:5173";
            if (targetFrontend.endsWith("/")) {
                targetFrontend = targetFrontend.substring(0, targetFrontend.length() - 1);
            }
            String dashboardUrl = targetFrontend + "/admin/dashboard";

            String htmlResponse = "<!DOCTYPE html><html><head><title>Super Admin Confirmation</title>"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<style>"
                    + "body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0B0D17; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }"
                    + ".card { background: #161B2E; border: 1px solid #00F0FF; box-shadow: 0 0 25px rgba(0,240,255,0.2); border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; width: 100%; }"
                    + ".icon { font-size: 48px; margin-bottom: 16px; }"
                    + "h1 { color: #00F0FF; font-size: 24px; margin-bottom: 12px; font-weight: 700; }"
                    + "p { color: #94A3B8; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }"
                    + ".btn { background: linear-gradient(90deg, #00F0FF, #00A8FF); color: #000000; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; font-size: 15px; display: inline-block; box-shadow: 0 4px 14px rgba(0,240,255,0.4); margin-top: 10px; }"
                    + "</style>"
                    + "<script>"
                    + "setTimeout(function() { window.location.href = '" + dashboardUrl + "'; }, 3000);"
                    + "</script>"
                    + "</head><body>"
                    + "<div class=\"card\">"
                    + "<div class=\"icon\">👑</div>"
                    + "<div class=\"badge\">ESPORTS ARENA SECURITY</div>"
                    + "<h1>Super Admin Privileges Activated!</h1>"
                    + "<p>" + resultMessage + "</p>"
                    + "<p style=\"font-size:13px; color:#64748B;\">Redirecting to Super Admin Dashboard in 3 seconds...</p>"
                    + "<a href=\"" + dashboardUrl + "\" class=\"btn\">OPEN SUPER ADMIN DASHBOARD</a>"
                    + "</div></body></html>";
            return ResponseEntity.ok(htmlResponse);
        } catch (Exception e) {
            String htmlError = "<!DOCTYPE html><html><head><title>Confirmation Failed</title>"
                    + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                    + "<style>"
                    + "body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0B0D17; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }"
                    + ".card { background: #161B2E; border: 1px solid #EF4444; box-shadow: 0 0 25px rgba(239,68,68,0.2); border-radius: 16px; padding: 40px; text-align: center; max-width: 480px; width: 100%; }"
                    + ".icon { font-size: 48px; margin-bottom: 16px; }"
                    + "h1 { color: #EF4444; font-size: 24px; margin-bottom: 12px; font-weight: 700; }"
                    + "p { color: #94A3B8; font-size: 15px; line-height: 1.6; }"
                    + "</style></head><body>"
                    + "<div class=\"card\">"
                    + "<div class=\"icon\">❌</div>"
                    + "<h1>Confirmation Link Invalid or Expired</h1>"
                    + "<p>" + e.getMessage() + "</p>"
                    + "</div></body></html>";
            return ResponseEntity.status(400).body(htmlError);
        }
    }

    @GetMapping("/super-admin-status")
    public ResponseEntity<com.esports.dto.AuthResponse> getSuperAdminStatus(@RequestParam("email") String email) {
        com.esports.dto.AuthResponse response = authService.checkSuperAdminStatus(email);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}
