package com.esports.service;

import com.esports.dto.SupportTicketDto;
import java.util.List;
import java.util.UUID;

public interface SupportService {
    SupportTicketDto createTicket(String userEmail, String subject, String message);
    List<SupportTicketDto> getUserTickets(String userEmail);
    List<SupportTicketDto> getAllTickets(String adminEmail);
    SupportTicketDto replyToTicket(UUID ticketId, String reply, String adminEmail);
}
