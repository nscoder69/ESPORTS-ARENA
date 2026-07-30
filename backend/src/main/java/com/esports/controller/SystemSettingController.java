package com.esports.controller;

import com.esports.dto.PaymentSettingsDto;
import com.esports.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping("/public/settings/payment")
    public ResponseEntity<PaymentSettingsDto> getPublicPaymentSettings() {
        return ResponseEntity.ok(systemSettingService.getPaymentSettings());
    }

    @PostMapping(value = "/admin/settings/payment", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaymentSettingsDto> updatePaymentSettings(
            Authentication authentication,
            @RequestParam(value = "upiId", required = false) String upiId,
            @RequestParam(value = "qrImage", required = false) MultipartFile qrImage) {
        
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(systemSettingService.updatePaymentSettings(adminEmail, upiId, qrImage));
    }
}
