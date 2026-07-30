package com.esports.filter;

import com.esports.security.CustomUserDetailsService;
import com.esports.security.JwtUtil;
import com.esports.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtUtil.extractUsername(jwt);
        } catch (Exception e) {
            // Token is malformed, expired, or signature is invalid - proceed without setting security authentication context
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            if (!userDetails.isAccountNonLocked()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"Your account has been blocked. Please contact customer support.\"}");
                return;
            }
            if (!userDetails.isEnabled()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\": \"Your account has been deleted.\"}");
                return;
            }
            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                updateUserLastActive(userEmail);
            }
        }
        filterChain.doFilter(request, response);
    }

    private final java.util.concurrent.ConcurrentHashMap<String, java.time.Instant> lastActiveCache = new java.util.concurrent.ConcurrentHashMap<>();

    private void updateUserLastActive(String email) {
        java.time.Instant now = java.time.Instant.now();
        java.time.Instant lastUpdated = lastActiveCache.get(email);

        // Only update DB at most once every 5 minutes per user
        if (lastUpdated != null && lastUpdated.isAfter(now.minusSeconds(300))) {
            return;
        }

        lastActiveCache.put(email, now);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                userRepository.findByEmail(email).ifPresent(user -> {
                    java.time.LocalDateTime localNow = java.time.LocalDateTime.now();
                    if (user.getLastActiveAt() == null || user.getLastActiveAt().isBefore(localNow.minusMinutes(5))) {
                        user.setLastActiveAt(localNow);
                        userRepository.save(user);
                    }
                });
            } catch (Exception e) {
                // Ignore exceptions to not block request processing
            }
        });
    }
}
