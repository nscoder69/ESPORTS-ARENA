package com.esports.service;

import com.esports.dto.PaymentSettingsDto;
import org.springframework.web.multipart.MultipartFile;

public interface SystemSettingService {
    PaymentSettingsDto getPaymentSettings();
    PaymentSettingsDto updatePaymentSettings(String adminEmail, String upiId, MultipartFile qrImage);
}
