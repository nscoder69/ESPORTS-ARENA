package com.esports.controller;

import com.esports.dto.AuthResponse;
import com.esports.entity.User;
import com.esports.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PutMapping(value = "/profile", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestParam(value = "gameName", required = false) String gameName,
            @RequestParam(value = "freeFireUid", required = false) String freeFireUid,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            Authentication authentication) {

        User updatedUser = userService.updateProfile(authentication.getName(), gameName, freeFireUid, avatar);

        // We return the same structure as AuthResponse (minus the token, or we can just omit token)
        // Actually, returning the updated user details is enough. The frontend expects the new user object.
        AuthResponse response = AuthResponse.builder()
                .id(updatedUser.getId())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().getName())
                .gameName(updatedUser.getGameName())
                .freeFireUid(updatedUser.getFreeFireUid())
                .avatarUrl(updatedUser.getAvatarUrl())
                // token is not refreshed here, frontend keeps using the old one
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.esports.dto.UserDto>> getAllUsers(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllUsers(authentication.getName()));
    }

    @PutMapping("/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable java.util.UUID userId, Authentication authentication) {
        userService.blockUser(userId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable java.util.UUID userId, Authentication authentication) {
        userService.unblockUser(userId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable java.util.UUID userId, Authentication authentication) {
        userService.deleteUser(userId, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
