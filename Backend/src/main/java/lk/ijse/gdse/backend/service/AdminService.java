package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;

public interface AdminService {
    UserEntity getAdminProfile(Long adminId);
    UserEntity updateAdminProfile(Long adminId, UserDTO updatedData);
    UserEntity addNewAdmin(UserDTO newAdmin);
}
