package com.myownspringapp.mankatbank;

import com.myownspringapp.mankatbank.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ownerName;

    private long balance;

    // NEW: link account -> user (nullable for now so existing rows/endpoints won't break)
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id")
    private User user;

    protected Account() {
        // required by JPA
    }

    public Account(String ownerName) {
        this.ownerName = ownerName;
        this.balance = 0L;
    }

    public Long getId() {
        return id;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public long getBalance() {
        return balance;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void deposit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit amount must be positive");
        this.balance += amount;
    }

    public void withdraw(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdraw amount must be positive");
        if (this.balance < amount) throw new IllegalArgumentException("Insufficient funds");
        this.balance -= amount;
    }
}
