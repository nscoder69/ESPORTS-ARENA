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
}
