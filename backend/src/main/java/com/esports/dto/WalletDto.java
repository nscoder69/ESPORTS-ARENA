package com.esports.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class WalletDto {
    private UUID id;
    private BigDecimal balance;
}
