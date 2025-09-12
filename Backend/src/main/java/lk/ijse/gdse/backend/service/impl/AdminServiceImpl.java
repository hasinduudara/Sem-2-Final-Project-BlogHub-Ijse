package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserEntity getAdminProfile(Long adminId) {
        return userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @Override
    public UserEntity updateAdminProfile(Long adminId, UserDTO updatedData) {
        UserEntity admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (updatedData.getUsername() != null && !updatedData.getUsername().isBlank()) {
            admin.setUsername(updatedData.getUsername());
        }
        if (updatedData.getEmail() != null && !updatedData.getEmail().isBlank()) {
            admin.setEmail(updatedData.getEmail());
        }

        return userRepository.save(admin);
    }

    @Override
    public UserEntity addNewAdmin(UserDTO newAdmin) {
        if (userRepository.findByEmail(newAdmin.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists!");
        }

        UserEntity admin = new UserEntity();
        admin.setUsername(newAdmin.getUsername());
        admin.setEmail(newAdmin.getEmail());
        admin.setPassword(passwordEncoder.encode(newAdmin.getPassword()));
        admin.setRole(UserRole.ADMIN);

        return userRepository.save(admin);
    }
}
