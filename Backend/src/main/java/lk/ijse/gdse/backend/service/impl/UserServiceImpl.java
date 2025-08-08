package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            return "Email already exists!";
        }

        UserEntity user = new UserEntity();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        try {
            user.setRole(UserRole.valueOf(userDTO.getRole().toUpperCase()));
        } catch (IllegalArgumentException e) {
            return "Invalid role selected!";
        }

        userRepository.save(user);
        return "Registration Successful!";
    }

    @Override
    public UserEntity validateLogin(String email, String rawPassword) {
        return userRepository.findByEmail(email)
                .filter(user -> rawPassword != null && passwordEncoder.matches(rawPassword, user.getPassword()))
                .orElse(null);
    }

    @Override
    public UserEntity findByEmail(String email) { // ✅ No password check for JWT validation
        return userRepository.findByEmail(email).orElse(null);
    }

}
