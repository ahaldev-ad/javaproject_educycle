package com.educycle.service;

import com.educycle.dto.AuthRequest;
import com.educycle.dto.AuthResponse;
import com.educycle.dto.RegisterRequest;
import com.educycle.entity.User;
import com.educycle.repository.UserRepository;
import com.educycle.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        if (req.getPassword() == null || req.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required!");
        }

        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setCollege(req.getCollege());
        user.setDepartment(req.getDepartment());
        user.setRole("USER");
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());
        String name = (savedUser.getFirstName() != null ? savedUser.getFirstName() : "") + " " +
                     (savedUser.getLastName() != null ? savedUser.getLastName() : "");
        return new AuthResponse(token, savedUser.getUserId(), savedUser.getEmail(), name.trim(), savedUser.getRole());
    }

    public AuthResponse login(AuthRequest authRequest) {
        User user = userRepository.findByEmail(authRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + authRequest.getEmail()));

        if (user.isCurrentlySuspended()) {
            String msg = "Your account has been temporarily suspended by an administrator";
            if (user.getSuspendedUntil() != null) {
                msg += " until " + user.getSuspendedUntil().toString().replace('T', ' ');
            }
            if (user.getSuspensionReason() != null && !user.getSuspensionReason().trim().isEmpty()) {
                msg += ". Reason: " + user.getSuspensionReason();
            }
            throw new com.educycle.exception.AccountSuspendedException(msg, user.getSuspendedUntil(), user.getSuspensionReason());
        }

        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials!");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        String name = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                     (user.getLastName() != null ? user.getLastName() : "");
        return new AuthResponse(token, user.getUserId(), user.getEmail(), name.trim(), user.getRole());
    }
}
