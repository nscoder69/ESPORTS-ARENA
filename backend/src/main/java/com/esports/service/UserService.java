package com.esports.service;

import com.esports.entity.User;
import com.esports.dto.UserDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

public interface UserService {
    User updateProfile(String email, String gameName, String freeFireUid, MultipartFile avatar);
    List<UserDto> getAllUsers(String adminEmail);
    void blockUser(UUID userId, String adminEmail);
    void unblockUser(UUID userId, String adminEmail);
    void deleteUser(UUID userId, String adminEmail);
}
