package com.esports.service;

import com.esports.dto.DepositRequest;
import com.esports.dto.WithdrawRequest;
import com.esports.dto.TransactionDto;
import com.esports.dto.WalletDto;
import java.util.List;

public interface WalletService {
    WalletDto getWalletBalance(String userEmail);
    List<TransactionDto> getTransactionHistory(String userEmail);
    WalletDto depositFunds(String userEmail, DepositRequest request);
    WalletDto withdrawFunds(String userEmail, WithdrawRequest request);
    List<TransactionDto> getUserTransactionHistory(java.util.UUID userId, String adminEmail);
    WalletDto getUserWalletBalance(java.util.UUID userId, String adminEmail);
    com.esports.dto.RazorpayOrderResponse createRazorpayOrder(String userEmail, java.math.BigDecimal amount);
    WalletDto verifyRazorpayPayment(String userEmail, com.esports.dto.RazorpayPaymentVerificationDto request);
    java.util.List<com.esports.dto.TransactionDto> getAllPendingDeposits(String adminEmail);
    WalletDto approveManualDeposit(String adminEmail, java.util.UUID transactionId, boolean approve);
    java.util.List<com.esports.dto.TransactionDto> getAllPendingWithdrawals(String adminEmail);
    WalletDto approveWithdrawal(String adminEmail, java.util.UUID transactionId, boolean approve);
}
