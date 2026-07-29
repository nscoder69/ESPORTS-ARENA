package com.esports.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RazorpayPaymentVerificationDto {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private BigDecimal amount;
}
