package com.esports.serviceImpl;

import com.esports.dto.PaymentSettingsDto;
import com.esports.entity.SystemSetting;
import com.esports.entity.User;
import com.esports.repository.SystemSettingRepository;
import com.esports.repository.UserRepository;
import com.esports.service.FileUploadService;
import com.esports.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    @Override
    public PaymentSettingsDto getPaymentSettings() {
        String upiId = systemSettingRepository.findBySettingKey("upi_id")
                .map(SystemSetting::getSettingValue)
                .orElse("ultimatebackup112-1@okaxis");

        String upiQrUrl = systemSettingRepository.findBySettingKey("upi_qr_url")
                .map(SystemSetting::getSettingValue)
                .orElse("");

        return PaymentSettingsDto.builder()
                .upiId(upiId)
                .upiQrUrl(upiQrUrl)
                .build();
    }

    @Override
    @Transactional
    public PaymentSettingsDto updatePaymentSettings(String adminEmail, String upiId, MultipartFile qrImage) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));

        if (!"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Access Denied: Only Super Admin (Primary Developer Admin) can update platform Payment QR Code & UPI ID.");
        }

        if (upiId != null && !upiId.trim().isEmpty()) {
            SystemSetting upiSetting = systemSettingRepository.findBySettingKey("upi_id")
                    .orElse(new SystemSetting("upi_id", "", null));
            upiSetting.setSettingValue(upiId.trim());
            systemSettingRepository.save(upiSetting);
        }

        if (qrImage != null && !qrImage.isEmpty()) {
            try {
                String uploadedUrl = fileUploadService.saveQrCode(qrImage);
                SystemSetting qrSetting = systemSettingRepository.findBySettingKey("upi_qr_url")
                        .orElse(new SystemSetting("upi_qr_url", "", null));
                qrSetting.setSettingValue(uploadedUrl);
                systemSettingRepository.save(qrSetting);
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload QR Code image: " + e.getMessage());
            }
        }

        return getPaymentSettings();
    }
}
