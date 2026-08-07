package com.esports.serviceImpl;

import com.esports.dto.SupportTicketDto;
import com.esports.entity.SupportTicket;
import com.esports.entity.User;
import com.esports.repository.SupportTicketRepository;
import com.esports.repository.UserRepository;
import com.esports.service.MailService;
import com.esports.service.NotificationService;
import com.esports.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportServiceImpl implements SupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final NotificationService notificationService;
    private final com.esports.service.RealtimeEventPublisher realtimeEventPublisher;

    @Override
    @Transactional
    public SupportTicketDto createTicket(String userEmail, String subject, String message) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setMessage(message);
        ticket.setStatus("Pending");

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        // Send complaint email to admin
        SupportTicketDto dto = mapToDto(savedTicket);
        realtimeEventPublisher.publishUserSupportUpdate(userEmail, dto);
        realtimeEventPublisher.publishAdminUpdate("SUPPORT_TICKET_CREATED", dto);

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketDto> getUserTickets(String userEmail) {
        return supportTicketRepository.findByUser_EmailOrderByCreatedAtDesc(userEmail)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketDto> getAllTickets(String adminEmail) {
        verifyAdmin(adminEmail);
        return supportTicketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportTicketDto replyToTicket(UUID ticketId, String reply, String adminEmail) {
        verifyAdmin(adminEmail);

        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Support ticket not found"));

        ticket.setReply(reply);
        ticket.setStatus("Resolved");

        SupportTicket updatedTicket = supportTicketRepository.save(ticket);

        // Send a notification to the user
        String notificationTitle = "Support Ticket Reply: " + ticket.getSubject();
        String notificationMessage = "An administrator has replied to your support ticket:\n\n" + reply;
        notificationService.createNotification(ticket.getUser(), notificationTitle, notificationMessage);

        SupportTicketDto dto = mapToDto(updatedTicket);
        if (ticket.getUser() != null && ticket.getUser().getEmail() != null) {
            realtimeEventPublisher.publishUserSupportUpdate(ticket.getUser().getEmail(), dto);
        }
        realtimeEventPublisher.publishAdminUpdate("SUPPORT_TICKET_REPLIED", dto);

        return dto;
    }

    private void verifyAdmin(String email) {
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin user not found"));
        String role = admin.getRole() != null ? admin.getRole().getName() : null;
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_SUPER_ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized: Only admins can perform this action");
        }
        if ("ROLE_ADMIN".equals(role)) {
            verifyPermission(admin, "MANAGE_SUPPORT");
        }
    }

    private void verifyPermission(User admin, String requiredPermission) {
        if ("ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            return;
        }
        String permissions = admin.getPermissions();
        if (permissions == null || permissions.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
        }
        java.util.List<String> permList = java.util.Arrays.asList(permissions.split(","));
        if (!permList.contains(requiredPermission)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
        }
    }

    private SupportTicketDto mapToDto(SupportTicket ticket) {
        SupportTicketDto dto = new SupportTicketDto();
        dto.setId(ticket.getId());
        dto.setSubject(ticket.getSubject());
        dto.setMessage(ticket.getMessage());
        dto.setStatus(ticket.getStatus());
        dto.setReply(ticket.getReply());
        dto.setCreatedAt(ticket.getCreatedAt());
        if (ticket.getUser() != null) {
            dto.setUserEmail(ticket.getUser().getEmail());
            dto.setUser(new SupportTicketDto.UserSummary(ticket.getUser().getEmail(), ticket.getUser().getGameName()));
        }
        return dto;
    }
}
