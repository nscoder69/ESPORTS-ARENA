package com.esports.serviceImpl;

import com.esports.service.MailService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailServiceImpl implements MailService {

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

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

        if (mailSender != null) {
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena");
                    helper.setTo(email);
                    helper.setSubject("🎮 Esports Arena - Verification Code: " + otp);

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

                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("OTP Email sent successfully via HTML MimeMessage to {}", email);
                } catch (Exception e) {
                    log.error("Failed to send HTML email via SMTP to {}. Error: {}", email, e.getMessage(), e);
                }
            });
        } else {
            log.warn("JavaMailSender is not initialized. Verify your application properties settings.");
        }
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

        if (mailSender != null) {
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena Support");
                    helper.setTo("r28223078@gmail.com");
                    helper.setSubject("🎫 Esports Arena Support Ticket: " + subject);

                    String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; background: #0B0D17; color: #FFF;\">"
                            + "<h3 style=\"color: #00F0FF;\">New Support Ticket</h3>"
                            + "<p><strong>From:</strong> " + fromUserEmail + "</p>"
                            + "<p><strong>Subject:</strong> " + subject + "</p>"
                            + "<p><strong>Message:</strong></p>"
                            + "<blockquote style=\"background: #161B2E; padding: 15px; border-left: 4px solid #00F0FF;\">" + messageText + "</blockquote>"
                            + "</div>";

                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("Support ticket report email sent successfully to admin.");
                } catch (Exception e) {
                    log.error("Failed to send support ticket email to admin via SMTP: {}", e.getMessage());
                }
            });
        }
    }

    @Override
    public void sendResetPasswordOtp(String email, String otp) {
        log.info("==================================================");
        log.info("               ESPORTS ARENA PASSWORD RESET       ");
        log.info("==================================================");
        log.info("SENDING RESET OTP TO: {}", email);
        log.info("OTP CODE: {}", otp);
        log.info("==================================================");

        if (mailSender != null) {
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setFrom(fromEmail, "Esports Arena");
                    helper.setTo(email);
                    helper.setSubject("🔑 Esports Arena - Reset Password Code: " + otp);

                    String htmlContent = "<div style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #0B0D17; color: #FFFFFF; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1F293D;\">"
                            + "<h2 style=\"color: #00F0FF; text-align: center; font-size: 24px; margin-bottom: 20px;\">🔑 PASSWORD RESET</h2>"
                            + "<p style=\"color: #94A3B8; font-size: 15px;\">You requested a password reset. Use the code below to set a new password:</p>"
                            + "<div style=\"background: #161B2E; border: 2px dashed #00F0FF; padding: 18px; border-radius: 8px; text-align: center; margin: 25px 0;\">"
                            + "<span style=\"font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #00F0FF;\">" + otp + "</span>"
                            + "</div>"
                            + "<p style=\"color: #64748B; font-size: 13px; text-align: center;\">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>"
                            + "</div>";

                    helper.setText(htmlContent, true);

                    mailSender.send(mimeMessage);
                    log.info("Password Reset OTP Email sent successfully to {}", email);
                } catch (Exception e) {
                    log.error("Failed to send password reset email via SMTP to {}. Error: {}", email, e.getMessage(), e);
                }
            });
        } else {
            log.warn("JavaMailSender is not initialized. Verify your application properties settings.");
        }
    }
}
