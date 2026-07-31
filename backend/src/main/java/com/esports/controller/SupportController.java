package com.esports.controller;

import com.esports.dto.SupportTicketDto;
import com.esports.dto.SupportTicketReplyRequest;
import com.esports.dto.SupportTicketRequest;
import com.esports.service.SupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicketDto> createTicket(
            @RequestBody SupportTicketRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(supportService.createTicket(
                authentication.getName(),
                request.getSubject(),
                request.getMessage()
        ));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<SupportTicketDto>> getUserTickets(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(supportService.getUserTickets(authentication.getName()));
    }

    @GetMapping("/admin/tickets")
    public ResponseEntity<List<SupportTicketDto>> getAllTickets(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(supportService.getAllTickets(authentication.getName()));
    }

    @PostMapping("/admin/tickets/{id}/reply")
    public ResponseEntity<SupportTicketDto> replyToTicket(
            @PathVariable("id") UUID ticketId,
            @RequestBody SupportTicketReplyRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return ResponseEntity.ok(supportService.replyToTicket(
                ticketId,
                request.getReply(),
                authentication.getName()
        ));
    }
}
