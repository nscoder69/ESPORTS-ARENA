package com.esports.service;

import com.esports.dto.AuthRequest;
import com.esports.dto.AuthResponse;
import com.esports.dto.RegisterRequest;
import com.esports.dto.ResetPasswordRequest;

import org.springframework.web.multipart.MultipartFile;

public interface AuthService {
    AuthResponse register(RegisterRequest request, MultipartFile avatar);
    AuthResponse authenticate(AuthRequest request);
    void sendOtp(String email);
    void sendForgotPasswordOtp(String email);
    void resetPassword(ResetPasswordRequest request);
    String makeSuperAdmin(String email);
    String makeSuperAdmin(String email, String baseUrl);
    String confirmSuperAdminViaToken(String token);
}
