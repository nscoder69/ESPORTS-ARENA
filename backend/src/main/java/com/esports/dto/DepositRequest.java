package com.esports.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DepositRequest {
    private BigDecimal amount;
    private String paymentReference; // Mock payment ID from frontend
}
