package com.esports.dto;

import com.esports.entity.TransactionStatus;
import com.esports.entity.TransactionType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionDto {
    private UUID id;
    private BigDecimal amount;
    private TransactionType transactionType;
    private TransactionStatus status;
    private String description;
    private String paymentReference;
    private String userEmail;
    private String username;
    private LocalDateTime createdAt;
}
