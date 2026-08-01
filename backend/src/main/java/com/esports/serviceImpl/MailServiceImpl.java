package com.esports.serviceImpl;

import com.esports.service.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailServiceImpl implements MailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.brevo.api-key:}")
    private String brevoApiKey;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtp(String email, String otp) {
        log.info("==================================================");
        log.info("               ESPORTS ARENA MAIL SERVICE         ");
        log.info("==================================================");
        log.info("SENDING OTP TO: {}", email);
        log.info("OTP CODE: {}", otp);
        log.info("==================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            String subject = "🎮 Esports Arena - Verification Code: " + otp;
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0D17; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1F293D;\">"
                    + "<h2 style=\"color: #00F0FF; text-align: center; font-size: 24px; margin-bottom: 20px;\">🎮 ESPORTS ARENA</h2>"
                    + "<p style=\"color: #94A3B8; font-size: 15px;\">Welcome! Use the 6-digit verification code below to complete your registration:</p>"
                    + "<div style=\"background: #161B2E; border: 2px dashed #00F0FF; padding: 18px; border-radius: 8px; text-align: center; margin: 25px 0;\">"
                    + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00F0FF;\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #64748B; font-size: 13px; text-align: center;\">This code is valid for 10 minutes. Please do not share it with anyone.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #1F293D; margin: 20px 0;\" />"
                    + "<p style=\"color: #475569; font-size: 12px; text-align: center;\">Esports Arena Team — Ultimate 4vs4 Tournament Hub</p>"
                    + "</div>";

            // Try Brevo HTTP REST API first (uses HTTPS port 443 - never blocked on Render)
            if (sendViaBrevoHttpApi(email, subject, htmlContent)) {
                return;
            }

            // Fallback to standard JavaMailSender if Brevo is not available
            if (mailSender != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena");
                    helper.setTo(email);
                    helper.setSubject(subject);
                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("OTP Email sent successfully via SMTP to {}", email);
                } catch (Exception e) {
                    log.error("Failed to send HTML email via SMTP to {}. Error: {}", email, e.getMessage());
                }
            } else {
                log.warn("JavaMailSender is not initialized.");
            }
        });
    }

    @Override
    public void sendSupportReport(String fromUserEmail, String subject, String messageText) {
        log.info("==================================================");
        log.info("               NEW SUPPORT TICKET SUBMITTED        ");
        log.info("==================================================");
        log.info("FROM: {}", fromUserEmail);
        log.info("SUBJECT: {}", subject);
        log.info("MESSAGE: {}", messageText);
        log.info("==================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            String fullSubject = "🎫 Esports Arena Support Ticket: " + subject;
            String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; background: #0B0D17; color: #FFF;\">"
                    + "<h3 style=\"color: #00F0FF;\">New Support Ticket</h3>"
                    + "<p><strong>From:</strong> " + fromUserEmail + "</p>"
                    + "<p><strong>Subject:</strong> " + subject + "</p>"
                    + "<p><strong>Message:</strong></p>"
                    + "<blockquote style=\"background: #161B2E; padding: 15px; border-left: 4px solid #00F0FF;\">" + messageText + "</blockquote>"
                    + "</div>";

            if (sendViaBrevoHttpApi(fromEmail, fullSubject, htmlContent)) {
                return;
            }

            if (mailSender != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena Support");
                    helper.setTo(fromEmail);
                    helper.setSubject(fullSubject);
                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("Support ticket report email sent successfully to admin.");
                } catch (Exception e) {
                    log.error("Failed to send support ticket email to admin via SMTP: {}", e.getMessage());
                }
            }
        });
    }

    @Override
    public void sendResetPasswordOtp(String email, String otp) {
        log.info("==================================================");
        log.info("               ESPORTS ARENA PASSWORD RESET       ");
        log.info("==================================================");
        log.info("SENDING RESET OTP TO: {}", email);
        log.info("OTP CODE: {}", otp);
        log.info("==================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            String subject = "🔑 Esports Arena - Reset Password Code: " + otp;
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0D17; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1F293D;\">"
                    + "<h2 style=\"color: #00F0FF; text-align: center; font-size: 24px; margin-bottom: 20px;\">🔑 PASSWORD RESET</h2>"
                    + "<p style=\"color: #94A3B8; font-size: 15px;\">You requested a password reset. Use the code below to set a new password:</p>"
                    + "<div style=\"background: #161B2E; border: 2px dashed #00F0FF; padding: 18px; border-radius: 8px; text-align: center; margin: 25px 0;\">"
                    + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00F0FF;\">" + otp + "</span>"
                    + "</div>"
                    + "<p style=\"color: #64748B; font-size: 13px; text-align: center;\">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>"
                    + "</div>";

            if (sendViaBrevoHttpApi(email, subject, htmlContent)) {
                return;
            }

            if (mailSender != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena");
                    helper.setTo(email);
                    helper.setSubject(subject);
                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("Password Reset OTP Email sent successfully to {}", email);
                } catch (Exception e) {
                    log.error("Failed to send password reset email via SMTP to {}. Error: {}", email, e.getMessage());
                }
            } else {
                log.warn("JavaMailSender is not initialized.");
            }
        });
    }

    @Override
    public void sendSuperAdminPromotionConfirmation(String toOwnerEmail, String targetUserEmail, String confirmationCode) {
        log.info("==================================================");
        log.info("         SUPER ADMIN PROMOTION CONFIRMATION       ");
        log.info("==================================================");
        log.info("SENDING CONFIRMATION TO OWNER EMAIL: {}", toOwnerEmail);
        log.info("TARGET USER PROMOTED TO SUPER ADMIN: {}", targetUserEmail);
        log.info("CONFIRMATION CODE: {}", confirmationCode);
        log.info("==================================================");

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            String subject = "🚨 Security Alert: Super Admin Promotion Confirmation Code: " + confirmationCode;
            String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0D17; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 550px; margin: auto; border: 1px solid #F59E0B;\">"
                    + "<h2 style=\"color: #F59E0B; text-align: center; font-size: 22px; margin-bottom: 20px;\">🚨 SUPER ADMIN PROMOTION ATTEMPT</h2>"
                    + "<p style=\"color: #94A3B8; font-size: 14px;\">An attempt has been made to promote the following account to <strong>SUPER ADMIN</strong> privileges:</p>"
                    + "<div style=\"background: #161B2E; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 6px; margin: 20px 0;\">"
                    + "<p style=\"margin: 0; color: #FFFFFF;\"><strong>Target Email:</strong> " + targetUserEmail + "</p>"
                    + "</div>"
                    + "<p style=\"color: #94A3B8; font-size: 14px;\">To authorize this Super Admin promotion, enter the 6-digit security code below into the Admin Dashboard:</p>"
                    + "<div style=\"background: #161B2E; border: 2px dashed #F59E0B; padding: 18px; border-radius: 8px; text-align: center; margin: 25px 0;\">"
                    + "<span style=\"font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #F59E0B;\">" + confirmationCode + "</span>"
                    + "</div>"
                    + "<p style=\"color: #EF4444; font-size: 13px; text-align: center; font-weight: bold;\">⚠️ If you did NOT initiate this request, DO NOT share this code and review system access immediately.</p>"
                    + "<hr style=\"border: none; border-top: 1px solid #1F293D; margin: 20px 0;\" />"
                    + "<p style=\"color: #475569; font-size: 12px; text-align: center;\">Esports Arena Security Operations</p>"
                    + "</div>";

            if (sendViaBrevoHttpApi(toOwnerEmail, subject, htmlContent)) {
                return;
            }

            if (mailSender != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena Security");
                    helper.setTo(toOwnerEmail);
                    helper.setSubject(subject);
                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("Super Admin confirmation code sent successfully to owner email {}", toOwnerEmail);
                } catch (Exception e) {
                    log.error("Failed to send Super Admin confirmation code via SMTP to {}: {}", toOwnerEmail, e.getMessage());
                }
            }
        });
    }

    private boolean sendViaBrevoHttpApi(String toEmail, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            log.warn("BREVO_API_KEY is empty or not set in Environment Variables.");
            return false;
        }
        try {
            java.net.URL url = new java.net.URL("https://api.brevo.com/v3/smtp/email");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("accept", "application/json");
            conn.setRequestProperty("api-key", brevoApiKey.trim());
            conn.setRequestProperty("content-type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            String safeHtml = htmlContent.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
            String safeSubject = subject.replace("\"", "\\\"");

            String jsonPayload = "{"
                    + "\"sender\":{\"name\":\"Esports Arena\",\"email\":\"" + fromEmail + "\"},"
                    + "\"to\":[{\"email\":\"" + toEmail + "\"}],"
                    + "\"subject\":\"" + safeSubject + "\","
                    + "\"htmlContent\":\"" + safeHtml + "\""
                    + "}";

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                log.info("Successfully sent email via Brevo REST API (HTTPS port 443) to {}", toEmail);
                return true;
            } else {
                try (java.io.BufferedReader br = new java.io.BufferedReader(new java.io.InputStreamReader(conn.getErrorStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    log.error("Brevo REST API returned status code {}: {}", responseCode, response.toString());
                }
                return false;
            }
        } catch (Exception e) {
            log.error("Failed to send email via Brevo REST API: {}", e.getMessage());
            return false;
        }
    }
}
