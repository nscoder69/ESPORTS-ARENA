package com.esports.service;

public interface MailService {
    void sendOtp(String email, String otp);
    void sendResetPasswordOtp(String email, String otp);
    void sendSupportReport(String fromUserEmail, String subject, String messageText);
}
