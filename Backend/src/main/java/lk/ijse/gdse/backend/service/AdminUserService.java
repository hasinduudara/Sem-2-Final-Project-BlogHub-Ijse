package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.UserDTO;
import java.util.List;

public interface AdminUserService {
    List<UserDTO> getUsersByRole(String role);
    void removeUser(Long userId, String reason);
}
