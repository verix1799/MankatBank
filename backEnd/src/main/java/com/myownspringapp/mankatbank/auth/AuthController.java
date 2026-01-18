package com.myownspringapp.mankatbank.auth;

import com.myownspringapp.mankatbank.Account;
import com.myownspringapp.mankatbank.AccountRepository;
import com.myownspringapp.mankatbank.user.User;
import com.myownspringapp.mankatbank.user.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountRepository accountRepository;
    private final RevokedTokenRepository revokedTokenRepository;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          AccountRepository accountRepository,
                          RevokedTokenRepository revokedTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.accountRepository = accountRepository;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new IllegalArgumentException("Full name is required");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use");
        }

        String hash = passwordEncoder.encode(request.password());
        User user = new User(request.email(), request.fullName(), hash);
        User savedUser = userRepository.save(user);

        // create default account for the user
        Account account = new Account(savedUser.getFullName());
        account.setUser(savedUser);
        accountRepository.save(account);

        return new UserResponse(savedUser.getId(), savedUser.getEmail(), savedUser.getFullName());
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.createToken(user.getId(), user.getEmail());
        return new LoginResponse(user.getId(), user.getEmail(), token);
    }

    // ✅ Logout = revoke the current token (server will reject it afterwards)
    @PostMapping("/logout")
    public java.util.Map<String, String> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing Bearer token");
        }

        String token = authHeader.substring("Bearer ".length()).trim();
        Claims claims = jwtService.parse(token);

        String jti = claims.getId();
        Instant expiresAt = claims.getExpiration().toInstant();

        if (jti != null && !revokedTokenRepository.existsByJti(jti)) {
            revokedTokenRepository.save(new RevokedToken(jti, expiresAt));
        }

        return java.util.Map.of("message", "Logged out");
    }
}
