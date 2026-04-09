package com.collabflow.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Get Authorization header
        final String authHeader = request.getHeader("Authorization");

        // If no token, skip filter
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token (remove "Bearer " prefix)
        final String token = authHeader.substring(7);

        try {
            // Extract email from token
            final String email = jwtUtil.extractEmail(token);
            final String role = jwtUtil.extractRole(token);

            // If email found and user not already authenticated
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Validate token
                if (jwtUtil.isTokenValid(token, email)) {

                    // Create authentication object
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Set authentication in Spring Security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Invalid token - just continue without authentication
            // Spring Security will block access to protected routes
        }

        filterChain.doFilter(request, response);
    }
}