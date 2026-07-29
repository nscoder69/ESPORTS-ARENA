package com.esports.service;

import com.esports.entity.SupportTicket;
import java.util.List;
import java.util.UUID;

public interface SupportService {
    SupportTicket createTicket(String userEmail, String subject, String message);
    List<SupportTicket> getUserTickets(String userEmail);
    List<SupportTicket> getAllTickets(String adminEmail);
    SupportTicket replyToTicket(UUID ticketId, String reply, String adminEmail);
}
