package com.esports;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner adminPasswordResetRunner(
            com.esports.repository.UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                userRepository.findByEmail("nitishnaik90@gmail.com").ifPresent(user -> {
                    user.setPasswordHash(passwordEncoder.encode("Password@123"));
                    userRepository.save(user);
                    System.out.println(">>> PASSWORD RESET FOR nitishnaik90@gmail.com to Password@123 <<<");
                });
            } catch (Exception e) {
                System.err.println(">>> Initial admin runner skipped: " + e.getMessage());
            }
        };
    }
}
