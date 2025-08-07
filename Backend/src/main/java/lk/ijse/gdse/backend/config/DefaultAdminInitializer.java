package lk.ijse.gdse.backend.config;

import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DefaultAdminInitializer {

    @Bean
    public CommandLineRunner createDefaultAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@gmail.com"; // ⚠️ Default admin email
            String adminUsername = "admin";

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                UserEntity admin = new UserEntity();
                admin.setUsername(adminUsername);
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode("123")); // ⚠️ Default password
                admin.setRole(UserRole.ADMIN);

                userRepository.save(admin);
                System.out.println("✅ Default ADMIN user created: " + adminEmail);
            } else {
                System.out.println("ℹ️ ADMIN user already exists.");
            }
        };
    }
}
