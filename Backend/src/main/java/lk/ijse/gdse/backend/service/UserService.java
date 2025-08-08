package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;

public interface UserService {
    String registerUser(UserDTO userDTO);
    UserEntity validateLogin(String email, String rawPassword);
    UserEntity findByEmail(String email);
}
