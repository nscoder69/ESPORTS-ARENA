package com.esports.security;

import com.esports.entity.User;
import com.esports.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                !Boolean.TRUE.equals(user.getIsDeleted()), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                !Boolean.TRUE.equals(user.getIsBlocked()), // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().getName()))
        );
    }
}
