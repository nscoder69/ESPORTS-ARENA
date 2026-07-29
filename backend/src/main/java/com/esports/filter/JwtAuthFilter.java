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

    private void updateUserLastActive(String email) {
        try {
            userRepository.findByEmail(email).ifPresent(user -> {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                if (user.getLastActiveAt() == null || user.getLastActiveAt().isBefore(now.minusMinutes(1))) {
                    user.setLastActiveAt(now);
                    userRepository.save(user);
                }
            });
        } catch (Exception e) {
            // Ignore exceptions to not block request processing
        }
    }
}
