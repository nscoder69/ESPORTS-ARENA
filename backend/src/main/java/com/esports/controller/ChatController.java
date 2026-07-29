package com.esports.controller;

import com.esports.dto.ChatMessageDto;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {

    @MessageMapping("/chat/{tournamentId}")
    @SendTo("/topic/tournament/{tournamentId}")
    public ChatMessageDto sendMessage(@DestinationVariable String tournamentId, @Payload ChatMessageDto chatMessageDto) {
        // Here we could also save the message to the database via ChatMessageRepository
        chatMessageDto.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
        return chatMessageDto;
    }
}
