package com.esports.repository;

import com.esports.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);
    List<Transaction> findByTransactionTypeAndStatusOrderByCreatedAtDesc(
            com.esports.entity.TransactionType transactionType, 
            com.esports.entity.TransactionStatus status
    );
}
