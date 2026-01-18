package com.myownspringapp.mankatbank;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long accountId;

    private String type; // "DEPOSIT" or "WITHDRAW" (we’ll improve later)

    private long amount;

    private Instant createdAt;

    protected Transaction() {
        // JPA needs this
    }

    public Transaction(Long accountId, String type, long amount) {
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getAccountId() { return accountId; }
    public String getType() { return type; }
    public long getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
}
