package com.esports.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private final String UPLOAD_DIR = "uploads/avatars/";

    public String saveAvatar(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // Also save to disk if path is writable
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception ignored) {}

        // Convert to Base64 data URL for container persistent storage
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            contentType = "image/png";
        }
        String base64Data = java.util.Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + contentType + ";base64," + base64Data;
    }

    private final String QR_UPLOAD_DIR = "uploads/qr/";

    public String saveQrCode(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path uploadPath = Paths.get(QR_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            String originalFilename = file.getOriginalFilename();
            String extension = ".png";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = "qr_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception ignored) {}

        // Convert to Base64 data URL for container persistent storage
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            contentType = "image/png";
        }
        String base64Data = java.util.Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + contentType + ";base64," + base64Data;
    }
}
