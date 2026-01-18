package com.myownspringapp.mankatbank;

import com.myownspringapp.mankatbank.user.User;
import com.myownspringapp.mankatbank.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public AccountController(AccountRepository accountRepository,
                             TransactionRepository transactionRepository,
                             UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || authentication.getDetails() == null) {
            throw new RuntimeException("Unauthenticated");
        }
        return Long.valueOf(authentication.getDetails().toString());
    }

    private Account requireOwnedAccount(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getUser() == null || !account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        return account;
    }

    @PostMapping
    public AccountResponse createAccount(@RequestBody CreateAccountRequest request,
                                         Authentication authentication) {

        if (request.ownerName() == null || request.ownerName().isBlank()) {
            throw new IllegalArgumentException("ownerName is required");
        }

        Long userId = currentUserId(authentication);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = new Account(request.ownerName());
        account.setUser(user);

        Account saved = accountRepository.save(account);
        return toResponse(saved);
    }


    // ✅ ONLY accounts for logged-in user
    @GetMapping
    public List<AccountResponse> getAllAccounts(Authentication authentication) {
        Long userId = currentUserId(authentication);

        return accountRepository.findByUser_Id(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ Only your account
    @GetMapping("/{id}")
    public AccountResponse getAccount(@PathVariable Long id, Authentication authentication) {
        Long userId = currentUserId(authentication);
        Account account = requireOwnedAccount(id, userId);
        return toResponse(account);
    }

    // ✅ Only your account’s transactions
    @GetMapping("/{id}/transactions")
    public java.util.List<Transaction> getTransactions(@PathVariable Long id, Authentication authentication) {
        Long userId = currentUserId(authentication);
        requireOwnedAccount(id, userId);
        return transactionRepository.findByAccountId(id);
    }

    // TEMP dev endpoint — only allows assigning yourself, and only if account is unassigned or already yours
    @Transactional
    @PostMapping("/{id}/assign-user/{userId}")
    public AccountResponse assignUser(@PathVariable Long id,
                                      @PathVariable Long userId,
                                      Authentication authentication) {

        Long currentUserId = currentUserId(authentication);

        if (!currentUserId.equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getUser() != null && !account.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Forbidden");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        account.setUser(user);
        Account saved = accountRepository.save(account);

        return toResponse(saved);
    }

    @Transactional
    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable Long id,
                                   @RequestBody MoneyRequest request,
                                   Authentication authentication) {

        Long userId = currentUserId(authentication);
        Account account = requireOwnedAccount(id, userId);

        account.deposit(request.amount());
        Account saved = accountRepository.save(account);

        transactionRepository.save(new Transaction(id, "DEPOSIT", request.amount()));

        return toResponse(saved);
    }

    @Transactional
    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable Long id,
                                    @RequestBody MoneyRequest request,
                                    Authentication authentication) {

        Long userId = currentUserId(authentication);
        Account account = requireOwnedAccount(id, userId);

        account.withdraw(request.amount());
        Account saved = accountRepository.save(account);

        transactionRepository.save(new Transaction(id, "WITHDRAW", request.amount()));

        return toResponse(saved);
    }

    @Transactional
    @PostMapping("/transfer")
    public String transfer(@RequestBody TransferRequest request,
                           Authentication authentication) {

        Long userId = currentUserId(authentication);

        if (request.amount() <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }
        if (request.fromId().equals(request.toId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        Account from = requireOwnedAccount(request.fromId(), userId);

        Account to = accountRepository.findById(request.toId())
                .orElseThrow(() -> new RuntimeException("To account not found"));

        // for now allow transfer into any existing account
        from.withdraw(request.amount());
        to.deposit(request.amount());

        accountRepository.save(from);
        accountRepository.save(to);

        transactionRepository.save(new Transaction(from.getId(), "TRANSFER_OUT", request.amount()));
        transactionRepository.save(new Transaction(to.getId(), "TRANSFER_IN", request.amount()));

        return "Transfer complete";
    }

    private AccountResponse toResponse(Account account) {
        Long userId = (account.getUser() == null) ? null : account.getUser().getId();
        return new AccountResponse(
                account.getId(),
                account.getOwnerName(),
                account.getBalance(),
                userId
        );
    }
}
