package com.esports.controller;

import com.esports.dto.DepositRequest;
import com.esports.dto.WithdrawRequest;
import com.esports.dto.TransactionDto;
import com.esports.dto.WalletDto;
import com.esports.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<WalletDto> getWalletBalance(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getWalletBalance(email));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactionHistory(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getTransactionHistory(email));
    }

    @PostMapping("/deposit")
    public ResponseEntity<WalletDto> depositFunds(
            @RequestBody DepositRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.depositFunds(email, request));
    }

    @PostMapping("/razorpay-order")
    public ResponseEntity<com.esports.dto.RazorpayOrderResponse> createRazorpayOrder(
            @RequestBody java.util.Map<String, java.math.BigDecimal> request,
            Authentication authentication) {
        String email = authentication.getName();
        java.math.BigDecimal amount = request.get("amount");
        if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid order amount");
        }
        return ResponseEntity.ok(walletService.createRazorpayOrder(email, amount));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<WalletDto> verifyRazorpayPayment(
            @RequestBody com.esports.dto.RazorpayPaymentVerificationDto request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.verifyRazorpayPayment(email, request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletDto> withdrawFunds(
            @RequestBody WithdrawRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.withdrawFunds(email, request));
    }

    @GetMapping("/user/{userId}/transactions")
    public ResponseEntity<List<TransactionDto>> getUserTransactionHistory(
            @PathVariable java.util.UUID userId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getUserTransactionHistory(userId, email));
    }

    @GetMapping("/user/{userId}/balance")
    public ResponseEntity<WalletDto> getUserWalletBalance(
            @PathVariable java.util.UUID userId,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getUserWalletBalance(userId, email));
    }

    @GetMapping("/admin/pending-deposits")
    public ResponseEntity<List<TransactionDto>> getAllPendingDeposits(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getAllPendingDeposits(email));
    }

    @PutMapping("/admin/verify-deposit/{transactionId}")
    public ResponseEntity<WalletDto> approveManualDeposit(
            @PathVariable java.util.UUID transactionId,
            @RequestParam boolean approve,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.approveManualDeposit(email, transactionId, approve));
    }

    @GetMapping("/admin/pending-withdrawals")
    public ResponseEntity<List<TransactionDto>> getAllPendingWithdrawals(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.getAllPendingWithdrawals(email));
    }

    @PutMapping("/admin/verify-withdrawal/{transactionId}")
    public ResponseEntity<WalletDto> approveWithdrawal(
            @PathVariable java.util.UUID transactionId,
            @RequestParam boolean approve,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(walletService.approveWithdrawal(email, transactionId, approve));
    }
}
