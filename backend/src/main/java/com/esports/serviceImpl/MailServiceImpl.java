package com.esports.serviceImpl;

import com.esports.service.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
        System.out.println("\n>>> [OTP SENT] Email: " + email + " | Code: " + otp + " <<<\n");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(email);
                message.setSubject("Esports Arena - Email Verification OTP");
                message.setText("Welcome to Esports Arena!\n\nYour 6-digit OTP verification code is: " + otp + "\n\nThis OTP is valid for 10 minutes. Please enter this code on the registration page to verify your email.\n\nBest regards,\nEsports Arena Team");
                
                mailSender.send(message);
                log.info("OTP Email sent successfully to {}", email);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP. Falling back to console verification. Error: {}", e.getMessage());
            }
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
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo("r28223078@gmail.com");
                message.setSubject("Esports Arena Support - " + subject);
                message.setText("New support request received from user: " + fromUserEmail + "\n\nSubject: " + subject + "\n\nMessage:\n" + messageText + "\n\nBest regards,\nEsports Arena Support System");

                mailSender.send(message);
                log.info("Support ticket report email sent successfully to admin.");
            } catch (Exception e) {
                log.error("Failed to send support ticket email to admin via SMTP: {}", e.getMessage());
            }
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
        System.out.println("\n>>> [PASSWORD RESET OTP SENT] Email: " + email + " | Code: " + otp + " <<<\n");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(email);
                message.setSubject("Esports Arena - Password Reset OTP");
                message.setText("Welcome to Esports Arena!\n\nYour 6-digit OTP code to reset your password is: " + otp + "\n\nThis OTP is valid for 10 minutes. Please enter this code on the reset page to set a new password.\n\nBest regards,\nEsports Arena Team");
                
                mailSender.send(message);
                log.info("Password Reset OTP Email sent successfully to {}", email);
            } catch (Exception e) {
                log.error("Failed to send real email via SMTP. Falling back to console verification. Error: {}", e.getMessage());
            }
        } else {
            log.warn("JavaMailSender is not initialized. Verify your application properties settings.");
        }
    }
}
