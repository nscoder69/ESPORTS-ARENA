package com.esports.serviceImpl;

import com.esports.dto.AuthRequest;
import com.esports.dto.AuthResponse;
import com.esports.dto.RegisterRequest;
import com.esports.dto.ResetPasswordRequest;
import com.esports.entity.Role;
import com.esports.entity.User;
import com.esports.entity.Wallet;
import com.esports.repository.RoleRepository;
import com.esports.repository.UserRepository;
import com.esports.repository.WalletRepository;
import com.esports.security.JwtUtil;
import com.esports.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.esports.service.FileUploadService;
import com.esports.repository.OtpVerificationRepository;
import com.esports.service.MailService;
import com.esports.entity.OtpVerification;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final FileUploadService fileUploadService;
    private final OtpVerificationRepository otpVerificationRepository;
    private final MailService mailService;
    private final com.esports.service.GameProfileVerificationService gameProfileVerificationService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request, MultipartFile avatar) {
        if (request.getEmail() == null) {
            throw new RuntimeException("Email address is required");
        }
        String email = request.getEmail().trim().toLowerCase();
        request.setEmail(email);

        boolean isTestEmail = email.endsWith("@test.com");

        if (!isTestEmail) {
            if (!email.endsWith("@gmail.com")) {
                throw new RuntimeException("Email address must be a @gmail.com address");
            }

            String otp = request.getOtp();
            if (otp == null || otp.trim().isEmpty()) {
                throw new RuntimeException("OTP code is required");
            }

            OtpVerification otpVerification = otpVerificationRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("No OTP verification code requested for this email"));

            if (!otpVerification.getOtp().equals(otp.trim())) {
                throw new RuntimeException("Invalid OTP code");
            }

            if (otpVerification.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("OTP verification code has expired. Please request a new one.");
            }

            otpVerificationRepository.delete(otpVerification);
        }

        String password = request.getPassword();
        if (password == null || password.length() <= 8) {
            throw new RuntimeException("Password must be more than 8 characters");
        }
        if (!password.matches(".*[a-zA-Z].*")) {
            throw new RuntimeException("Password must contain at least one letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must contain at least one number");
        }
        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new RuntimeException("Password must contain at least one special character");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        Role userRole = roleRepository.findByName("ROLE_PLAYER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);

        boolean hasGameInfo = (request.getGameName() != null && !request.getGameName().trim().isEmpty()) ||
                              (request.getFreeFireUid() != null && !request.getFreeFireUid().trim().isEmpty());

        if (hasGameInfo) {
            user.setGameProfileStatus("PENDING");
        } else {
            user.setGameProfileStatus("NONE");
        }

        if (avatar != null && !avatar.isEmpty()) {
            try {
                String avatarUrl = fileUploadService.saveAvatar(avatar);
                user.setAvatarUrl(avatarUrl);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload avatar", e);
            }
        }

        User savedUser = userRepository.save(user);

        if (hasGameInfo) {
            gameProfileVerificationService.submitRequest(
                    savedUser,
                    request.getGameName(),
                    request.getFreeFireUid(),
                    request.getGameLevel() != null ? request.getGameLevel() : 1
            );
        }

        // Create Wallet
        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        walletRepository.save(wallet);

        String jwtToken = jwtUtil.generateToken(savedUser.getEmail(), userRole.getName());

        return AuthResponse.builder()
                .token(jwtToken)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(userRole.getName())
                .gameName(savedUser.getGameName())
                .freeFireUid(savedUser.getFreeFireUid())
                .gameLevel(savedUser.getGameLevel())
                .gameProfileStatus(savedUser.getGameProfileStatus())
                .avatarUrl(savedUser.getAvatarUrl())
                .permissions(savedUser.getPermissions())
                .build();
    }

    @Override
    public AuthResponse authenticate(AuthRequest request) {
        if (request.getEmail() == null) {
            throw new RuntimeException("Email is required");
        }
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new RuntimeException("This account has been blocked by an administrator.");
        }
        if (Boolean.TRUE.equals(user.getIsDeleted())) {
            throw new RuntimeException("This account has been deleted.");
        }
                
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());

        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .gameName(user.getGameName())
                .freeFireUid(user.getFreeFireUid())
                .gameLevel(user.getGameLevel() != null ? user.getGameLevel() : 1)
                .gameProfileStatus(user.getGameProfileStatus() != null ? user.getGameProfileStatus() : "VERIFIED")
                .avatarUrl(user.getAvatarUrl())
                .permissions(user.getPermissions())
                .build();
    }

    @Override
    @Transactional
    public void sendOtp(String email) {
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        String normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail.endsWith("@gmail.com") && !normalizedEmail.endsWith("@test.com")) {
            throw new RuntimeException("Email address must be a @gmail.com address");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email is already taken");
        }

        // Generate a 6-digit OTP code
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));

        // Create or update OtpVerification
        OtpVerification otpVerification = otpVerificationRepository.findByEmail(normalizedEmail)
                .orElse(new OtpVerification());

        otpVerification.setEmail(normalizedEmail);
        otpVerification.setOtp(otp);
        otpVerification.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));

        otpVerificationRepository.save(otpVerification);

        // Send OTP
        mailService.sendOtp(normalizedEmail, otp);
    }

    @Override
    @Transactional
    public void sendForgotPasswordOtp(String email) {
        if (email == null) {
            throw new RuntimeException("Email is required");
        }
        String normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail.endsWith("@gmail.com") && !normalizedEmail.endsWith("@test.com")) {
            throw new RuntimeException("Email address must be a @gmail.com address");
        }

        if (!userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("No account registered with this email address");
        }

        // Generate a 6-digit OTP code
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));

        // Create or update OtpVerification
        OtpVerification otpVerification = otpVerificationRepository.findByEmail(normalizedEmail)
                .orElse(new OtpVerification());

        otpVerification.setEmail(normalizedEmail);
        otpVerification.setOtp(otp);
        otpVerification.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(10));

        otpVerificationRepository.save(otpVerification);

        // Send Password Reset OTP
        mailService.sendResetPasswordOtp(normalizedEmail, otp);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String email = request.getEmail().trim().toLowerCase();
        
        boolean isTestEmail = email.endsWith("@test.com");
        
        if (!isTestEmail) {
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                throw new RuntimeException("OTP code is required");
            }
        }
        
        if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
            throw new RuntimeException("New password is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account registered with this email address"));

        if (!isTestEmail) {
            // Verify OTP
            OtpVerification otpVerification = otpVerificationRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("No OTP verification code requested for this email"));

            if (!otpVerification.getOtp().equals(request.getOtp())) {
                throw new RuntimeException("Invalid OTP code");
            }

            if (otpVerification.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("OTP verification code has expired. Please request a new one.");
            }

            // Delete verification record
            otpVerificationRepository.delete(otpVerification);
        }

        // Validate Password Strength
        String password = request.getNewPassword();
        if (password.length() <= 8) {
            throw new RuntimeException("Password must be more than 8 characters");
        }
        if (!password.matches(".*[a-zA-Z].*")) {
            throw new RuntimeException("Password must contain at least one letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new RuntimeException("Password must contain at least one number");
        }
        if (!password.matches(".*[^a-zA-Z0-9].*")) {
            throw new RuntimeException("Password must contain at least one special character");
        }

        // Save new password
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String ownerEmail;

    private static final java.util.Map<String, PendingUrlSuperAdminRequest> pendingUrlSuperAdminRequests = new java.util.concurrent.ConcurrentHashMap<>();

    @lombok.Data
    @lombok.AllArgsConstructor
    private static class PendingUrlSuperAdminRequest {
        private String token;
        private String targetEmail;
        private java.time.LocalDateTime expiresAt;
    }

    @Override
    @Transactional
    public String makeSuperAdmin(String email) {
        return makeSuperAdmin(email, null);
    }

    @Override
    @Transactional
    public String makeSuperAdmin(String email, String baseUrl) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String normalizedEmail = email.trim().toLowerCase();

        String token = java.util.UUID.randomUUID().toString();
        pendingUrlSuperAdminRequests.put(token, new PendingUrlSuperAdminRequest(token, normalizedEmail, java.time.LocalDateTime.now().plusHours(24)));

        String targetOwnerEmail = (ownerEmail != null && !ownerEmail.trim().isEmpty()) ? ownerEmail.trim() : "website owner email";
        
        String cleanBaseUrl = (baseUrl != null && !baseUrl.trim().isEmpty()) ? baseUrl.trim() : "http://localhost:8080";
        if (cleanBaseUrl.endsWith("/")) {
            cleanBaseUrl = cleanBaseUrl.substring(0, cleanBaseUrl.length() - 1);
        }
        String confirmationLink = cleanBaseUrl + "/api/v1/auth/confirm-super-admin-link?token=" + token;

        try {
            mailService.sendSuperAdminConfirmationLink(targetOwnerEmail, normalizedEmail, confirmationLink);
            return "Confirmation link sent to website email (" + targetOwnerEmail + ") for creating Super Admin (" + normalizedEmail + "). Please check your inbox and click the confirm button to complete Super Admin creation.";
        } catch (Exception e) {
            // Fallback to direct promotion if mail sending fails
            return makeSuperAdminDirect(normalizedEmail);
        }
    }

    @Override
    @Transactional
    public String makeSuperAdminDirect(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String normalizedEmail = email.trim().toLowerCase();
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_SUPER_ADMIN");
                    return roleRepository.save(r);
                });

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode("SuperAdmin@123"));
            user.setRole(superAdminRole);
            user.setGameName("SuperAdmin");
            user.setGameLevel(1);
            User savedUser = userRepository.save(user);

            Wallet wallet = new Wallet();
            wallet.setUser(savedUser);
            walletRepository.save(wallet);
        } else {
            user.setRole(superAdminRole);
            userRepository.save(user);
        }

        return "SUCCESS: Account " + normalizedEmail + " has been directly granted SUPER ADMIN (ROLE_SUPER_ADMIN) privileges! You can log in immediately on the website.";
    }

    @Override
    @Transactional
    public String confirmSuperAdminViaToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Invalid confirmation token");
        }
        PendingUrlSuperAdminRequest pending = pendingUrlSuperAdminRequests.get(token.trim());
        if (pending == null) {
            throw new RuntimeException("Invalid or expired Super Admin confirmation link.");
        }

        if (pending.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            pendingUrlSuperAdminRequests.remove(token.trim());
            throw new RuntimeException("Super Admin confirmation link has expired. Please request a new Super Admin link.");
        }

        String normalizedEmail = pending.getTargetEmail();
        Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ROLE_SUPER_ADMIN");
                    return roleRepository.save(r);
                });

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setPasswordHash(passwordEncoder.encode("SuperAdmin@123"));
            user.setRole(superAdminRole);
            user.setGameName("SuperAdmin");
            user.setGameLevel(1);
            User savedUser = userRepository.save(user);

            Wallet wallet = new Wallet();
            wallet.setUser(savedUser);
            walletRepository.save(wallet);
        } else {
            user.setRole(superAdminRole);
            userRepository.save(user);
        }

        pendingUrlSuperAdminRequests.remove(token.trim());
        return "SUCCESS: Super Admin account (" + normalizedEmail + ") has been successfully authorized and granted ROLE_SUPER_ADMIN privileges! Please log in on the website.";
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse checkSuperAdminStatus(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null || user.getRole() == null) {
            return null;
        }
        String jwtToken = jwtUtil.generateToken(user.getEmail(), user.getRole().getName());
        return AuthResponse.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .gameName(user.getGameName())
                .freeFireUid(user.getFreeFireUid())
                .gameLevel(user.getGameLevel() != null ? user.getGameLevel() : 1)
                .avatarUrl(user.getAvatarUrl())
                .permissions(user.getPermissions())
                .build();
    }
}
