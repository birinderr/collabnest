package com.collabflow.backend.service;

import com.collabflow.backend.dto.AuthResponse;
import com.collabflow.backend.dto.LoginRequest;
import com.collabflow.backend.dto.RegisterRequest;
import com.collabflow.backend.entity.User;
import com.collabflow.backend.exception.AppException;
import com.collabflow.backend.repository.UserRepository;
import com.collabflow.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        // Build new user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)
                .build();

        // Save to database
        userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole().name());
    }
}