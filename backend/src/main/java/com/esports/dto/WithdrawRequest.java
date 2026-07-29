package com.esports.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WithdrawRequest {
    private BigDecimal amount;
    private String method; // "UPI" or "BANK"
    private String upiId;
    private String accountNumber;
    private String accountHolderName;
    private String ifscCode;
}
