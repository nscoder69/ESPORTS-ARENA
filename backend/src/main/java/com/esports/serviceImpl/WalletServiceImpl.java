package com.esports.serviceImpl;

import com.esports.dto.DepositRequest;
import com.esports.dto.WithdrawRequest;
import com.esports.dto.TransactionDto;
import com.esports.dto.WalletDto;
import com.esports.entity.Transaction;
import com.esports.entity.TransactionStatus;
import com.esports.entity.TransactionType;
import com.esports.entity.User;
import com.esports.entity.Wallet;
import com.esports.repository.TransactionRepository;
import com.esports.repository.UserRepository;
import com.esports.repository.WalletRepository;
import com.esports.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final com.razorpay.RazorpayClient razorpayClient;
    private final com.esports.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    private Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    try {
                        Wallet newWallet = new Wallet();
                        newWallet.setUser(user);
                        newWallet.setBalance(java.math.BigDecimal.ZERO);
                        return walletRepository.save(newWallet);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        return walletRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new RuntimeException("Could not create or fetch wallet"));
                    }
                });
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDto getWalletBalance(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);

        return mapToWalletDto(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDto> getTransactionHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);

        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WalletDto depositFunds(String userEmail, DepositRequest request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid deposit amount. Amount must be greater than zero.");
        }
        if (request.getPaymentReference() == null || request.getPaymentReference().trim().isEmpty()) {
            throw new RuntimeException("Payment reference (UTR / Transaction ID) is required.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);
        
        if (wallet.getBalance() == null) {
            wallet.setBalance(java.math.BigDecimal.ZERO);
        }

        // Record the transaction as PENDING. DO NOT update balance yet!
        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setPaymentReference(request.getPaymentReference().trim());
        transaction.setDescription("Manual Deposit Request (Awaiting Admin Verification)");
        
        transactionRepository.save(transaction);

        return mapToWalletDto(wallet);
    }

    @Override
    @Transactional
    public WalletDto withdrawFunds(String userEmail, WithdrawRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);
        
        if (wallet.getBalance() == null) {
            wallet.setBalance(java.math.BigDecimal.ZERO);
        }

        if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid withdrawal amount");
        }

        if (wallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        // Deduct funds from wallet balance (locked immediately)
        wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        // Record the transaction as PENDING
        Transaction transaction = new Transaction();
        transaction.setWallet(savedWallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.WITHDRAWAL);
        transaction.setStatus(TransactionStatus.PENDING);
        
        String desc = "Wallet Withdrawal";
        if ("UPI".equalsIgnoreCase(request.getMethod())) {
            desc += " to UPI: " + request.getUpiId();
        } else if ("BANK".equalsIgnoreCase(request.getMethod())) {
            desc += " to Bank A/C: " + request.getAccountNumber() + " | Holder: " + request.getAccountHolderName() + " | IFSC: " + request.getIfscCode();
        }
        transaction.setDescription(desc);
        
        transactionRepository.save(transaction);

        return mapToWalletDto(savedWallet);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDto> getUserTransactionHistory(java.util.UUID userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);

        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId())
                .stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDto getUserWalletBalance(java.util.UUID userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = getOrCreateWallet(user);

        return mapToWalletDto(wallet);
    }

    private WalletDto mapToWalletDto(Wallet wallet) {
        WalletDto dto = new WalletDto();
        dto.setId(wallet.getId());
        dto.setBalance(wallet.getBalance() != null ? wallet.getBalance() : java.math.BigDecimal.ZERO);
        return dto;
    }

    private TransactionDto mapToTransactionDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setAmount(transaction.getAmount());
        dto.setTransactionType(transaction.getTransactionType());
        dto.setStatus(transaction.getStatus());
        dto.setDescription(transaction.getDescription());
        dto.setPaymentReference(transaction.getPaymentReference());
        if (transaction.getWallet() != null && transaction.getWallet().getUser() != null) {
            dto.setUserEmail(transaction.getWallet().getUser().getEmail());
            dto.setUsername(transaction.getWallet().getUser().getGameName());
        }
        dto.setCreatedAt(transaction.getCreatedAt());
        return dto;
    }

    @Override
    @Transactional
    public com.esports.dto.RazorpayOrderResponse createRazorpayOrder(String userEmail, java.math.BigDecimal amount) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        try {
            org.json.JSONObject orderRequest = new org.json.JSONObject();
            orderRequest.put("amount", amount.multiply(new java.math.BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            
            String receiptId = "rcpt_" + java.util.UUID.randomUUID().toString().substring(0, 10);
            orderRequest.put("receipt", receiptId);
            
            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
            String orderId = order.get("id");
            
            return com.esports.dto.RazorpayOrderResponse.builder()
                    .orderId(orderId)
                    .amount(amount)
                    .currency("INR")
                    .receipt(receiptId)
                    .build();
        } catch (com.razorpay.RazorpayException e) {
            throw new RuntimeException("Razorpay error: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public WalletDto verifyRazorpayPayment(String userEmail, com.esports.dto.RazorpayPaymentVerificationDto request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        boolean isSignatureValid = verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                razorpayKeySecret
        );

        if (!isSignatureValid) {
            throw new RuntimeException("Invalid payment signature");
        }

        Wallet wallet = getOrCreateWallet(user);
        if (wallet.getBalance() == null) {
            wallet.setBalance(java.math.BigDecimal.ZERO);
        }
        wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        Wallet savedWallet = walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(savedWallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType(TransactionType.DEPOSIT);
        transaction.setStatus(TransactionStatus.SUCCESS);
        transaction.setPaymentReference(request.getRazorpayPaymentId());
        transaction.setDescription("Razorpay Deposit");
        transactionRepository.save(transaction);

        return mapToWalletDto(savedWallet);
    }

    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        try {
            String data = orderId + "|" + paymentId;
            javax.crypto.Mac sha256_HMAC = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256");
            sha256_HMAC.init(secretKeySpec);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes("UTF-8"));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equalsIgnoreCase(signature);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<TransactionDto> getAllPendingDeposits(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access: Admins only");
        }
        if ("ROLE_ADMIN".equals(admin.getRole().getName())) {
            verifyPermission(admin, "MANAGE_DEPOSITS");
        }

        return transactionRepository.findByTransactionTypeAndStatusOrderByCreatedAtDesc(
                com.esports.entity.TransactionType.DEPOSIT, com.esports.entity.TransactionStatus.PENDING)
                .stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WalletDto approveManualDeposit(String adminEmail, java.util.UUID transactionId, boolean approve) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access: Admins only");
        }
        if ("ROLE_ADMIN".equals(admin.getRole().getName())) {
            verifyPermission(admin, "MANAGE_DEPOSITS");
        }

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != com.esports.entity.TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING state");
        }

        Wallet wallet = transaction.getWallet();
        if (approve) {
            transaction.setStatus(com.esports.entity.TransactionStatus.SUCCESS);
            transaction.setDescription("Manual UPI deposit approved by admin");
            
            if (wallet.getBalance() == null) {
                wallet.setBalance(java.math.BigDecimal.ZERO);
            }
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
            walletRepository.save(wallet);

            try {
                notificationService.createNotification(
                        wallet.getUser(),
                        "Deposit Successful",
                        String.format("Your manual deposit of ₹%s has been successfully added to your wallet.", transaction.getAmount().setScale(2).toString())
                );
            } catch (Exception e) {
                // Log notification failure but don't fail transaction
            }
        } else {
            transaction.setStatus(com.esports.entity.TransactionStatus.FAILED);
            transaction.setDescription("Manual UPI deposit rejected by admin");

            try {
                notificationService.createNotification(
                        wallet.getUser(),
                        "Deposit Rejected",
                        String.format("Your manual deposit of ₹%s has been rejected. Please verify the UTR and contact support.", transaction.getAmount().setScale(2).toString())
                );
            } catch (Exception e) {
                // Log notification failure but don't fail transaction
            }
        }

        transactionRepository.save(transaction);
        return mapToWalletDto(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<TransactionDto> getAllPendingWithdrawals(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access: Admins only");
        }
        if ("ROLE_ADMIN".equals(admin.getRole().getName())) {
            verifyPermission(admin, "MANAGE_WITHDRAWALS");
        }

        return transactionRepository.findByTransactionTypeAndStatusOrderByCreatedAtDesc(
                com.esports.entity.TransactionType.WITHDRAWAL, com.esports.entity.TransactionStatus.PENDING)
                .stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WalletDto approveWithdrawal(String adminEmail, java.util.UUID transactionId, boolean approve) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (!"ROLE_ADMIN".equals(admin.getRole().getName()) && !"ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            throw new RuntimeException("Unauthorized access: Admins only");
        }
        if ("ROLE_ADMIN".equals(admin.getRole().getName())) {
            verifyPermission(admin, "MANAGE_WITHDRAWALS");
        }

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getStatus() != com.esports.entity.TransactionStatus.PENDING) {
            throw new RuntimeException("Transaction is not in PENDING state");
        }

        Wallet wallet = transaction.getWallet();
        if (approve) {
            transaction.setStatus(com.esports.entity.TransactionStatus.SUCCESS);
            transaction.setDescription(transaction.getDescription() + " - Approved by Admin");
            
            try {
                notificationService.createNotification(
                        wallet.getUser(),
                        "Withdrawal Successful",
                        String.format("Your withdrawal request of ₹%s has been approved and processed.", transaction.getAmount().setScale(2).toString())
                );
            } catch (Exception e) {
                // Log notification failure but don't fail transaction
            }
        } else {
            transaction.setStatus(com.esports.entity.TransactionStatus.FAILED);
            transaction.setDescription(transaction.getDescription() + " - Rejected by Admin");

            if (wallet.getBalance() == null) {
                wallet.setBalance(java.math.BigDecimal.ZERO);
            }
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
            walletRepository.save(wallet);

            try {
                notificationService.createNotification(
                        wallet.getUser(),
                        "Withdrawal Rejected",
                        String.format("Your withdrawal request of ₹%s has been rejected. The funds have been refunded to your wallet.", transaction.getAmount().setScale(2).toString())
                );
            } catch (Exception e) {
                // Log notification failure but don't fail transaction
            }
        }

        transactionRepository.save(transaction);
        return mapToWalletDto(wallet);
    }

    private void verifyPermission(User admin, String requiredPermission) {
        if ("ROLE_SUPER_ADMIN".equals(admin.getRole().getName())) {
            return;
        }
        String permissions = admin.getPermissions();
        if (permissions == null || permissions.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
        }
        java.util.List<String> permList = java.util.Arrays.asList(permissions.split(","));
        if (!permList.contains(requiredPermission)) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Access Denied: You do not have " + requiredPermission + " permission");
        }
    }
}
