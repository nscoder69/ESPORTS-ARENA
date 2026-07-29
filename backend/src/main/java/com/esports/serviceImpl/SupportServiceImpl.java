package com.esports.serviceImpl;

import com.esports.entity.SupportTicket;
import com.esports.entity.User;
import com.esports.repository.SupportTicketRepository;
import com.esports.repository.UserRepository;
import com.esports.service.MailService;
import com.esports.service.NotificationService;
import com.esports.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public SupportTicket createTicket(String userEmail, String subject, String message) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setMessage(message);
        ticket.setStatus("Pending");

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        // Send complaint email to admin
        mailService.sendSupportReport(userEmail, subject, message);

        return savedTicket;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> getUserTickets(String userEmail) {
        return supportTicketRepository.findByUser_EmailOrderByCreatedAtDesc(userEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicket> getAllTickets(String adminEmail) {
        verifyAdmin(adminEmail);
        return supportTicketRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public SupportTicket replyToTicket(UUID ticketId, String reply, String adminEmail) {
        verifyAdmin(adminEmail);

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found"));

        ticket.setReply(reply);
        ticket.setStatus("Resolved");

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        // Send a notification to the user
        String notificationTitle = "Support Ticket Reply: " + ticket.getSubject();
        String notificationMessage = "An administrator has replied to your support ticket:\n\n" + reply;
        notificationService.createNotification(ticket.getUser(), notificationTitle, notificationMessage);

        return updatedTicket;
    }

    private void verifyAdmin(String email) {
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized: Only admins can perform this action");
        }
    }
}
