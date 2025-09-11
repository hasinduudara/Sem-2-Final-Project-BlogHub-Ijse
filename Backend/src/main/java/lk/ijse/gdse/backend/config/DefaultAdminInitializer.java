package lk.ijse.gdse.backend.config;

import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DefaultAdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        String adminEmail = "admin@gmail.com";

        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            System.out.println("Creating default admin user...");

            UserEntity adminUser = new UserEntity();
            adminUser.setUsername("admin");
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode("123")); // Change this password!
            adminUser.setRole(UserRole.ADMIN);

            UserEntity savedAdmin = userRepository.save(adminUser);
            System.out.println("Admin user created successfully!");
            System.out.println("Email: " + savedAdmin.getEmail());
            System.out.println("Username: " + savedAdmin.getUsername());
            System.out.println("Role: " + savedAdmin.getRole().name());
            System.out.println("ID: " + savedAdmin.getId());
            System.out.println("Password: admin123 (CHANGE THIS IN PRODUCTION!)");
        } else {
            UserEntity existingAdmin = userRepository.findByEmail(adminEmail).get();
            System.out.println("Admin user already exists:");
            System.out.println("Email: " + existingAdmin.getEmail());
            System.out.println("Username: " + existingAdmin.getUsername());
            System.out.println("Role: " + existingAdmin.getRole().name());
            System.out.println("ID: " + existingAdmin.getId());
        }

        // List all users for debugging
        System.out.println("\n=== ALL USERS IN DATABASE ===");
        userRepository.findAll().forEach(user -> {
            System.out.println("ID: " + user.getId() +
                    " | Email: " + user.getEmail() +
                    " | Username: " + user.getUsername() +
                    " | Role: " + user.getRole().name());
        });
        System.out.println("==============================\n");
    }
}