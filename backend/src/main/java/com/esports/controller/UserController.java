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
public class UserController {

    private final UserService userService;

    @RequestMapping(value = "/profile", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestParam(value = "gameName", required = false) String gameName,
            @RequestParam(value = "freeFireUid", required = false) String freeFireUid,
            @RequestParam(value = "gameLevel", required = false) Integer gameLevel,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            Authentication authentication) {

        User updatedUser = userService.updateProfile(authentication.getName(), gameName, freeFireUid, gameLevel, avatar);

        AuthResponse response = AuthResponse.builder()
                .id(updatedUser.getId())
                .email(updatedUser.getEmail())
                .role(updatedUser.getRole().getName())
                .gameName(updatedUser.getGameName())
                .freeFireUid(updatedUser.getFreeFireUid())
                .gameLevel(updatedUser.getGameLevel())
                .avatarUrl(updatedUser.getAvatarUrl())
                .permissions(updatedUser.getPermissions())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<java.util.List<com.esports.dto.UserDto>> getAllUsers(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllUsers(authentication.getName()));
    }

    @GetMapping("/admins")
    public ResponseEntity<java.util.List<com.esports.dto.UserDto>> getAllAdmins(Authentication authentication) {
        return ResponseEntity.ok(userService.getAllAdmins(authentication.getName()));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<com.esports.dto.UserDto> updateUserRoleAndPermissions(
            @PathVariable java.util.UUID userId,
            @RequestBody com.esports.dto.UpdateAdminRoleRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(userService.updateUserRoleAndPermissions(userId, request, authentication.getName()));
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
