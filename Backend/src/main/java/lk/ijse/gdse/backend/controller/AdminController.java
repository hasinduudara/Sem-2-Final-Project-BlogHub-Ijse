package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.AdminProfileResponseDTO;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ✅ Get admin profile
    @GetMapping("/profile/{id}")
    public ResponseEntity<AdminProfileResponseDTO> getAdminProfile(@PathVariable Long id) {
        UserEntity admin = adminService.getAdminProfile(id);
        return ResponseEntity.ok(new AdminProfileResponseDTO(admin));
    }

    // ✅ Update logged-in admin profile
    @PutMapping("/profile/{id}")
    public ResponseEntity<AdminProfileResponseDTO> updateProfile(@PathVariable Long id, @RequestBody UserDTO updatedData) {
        UserEntity admin = adminService.updateAdminProfile(id, updatedData);
        return ResponseEntity.ok(new AdminProfileResponseDTO(admin));
    }

    // ✅ Add new admin
    @PostMapping("/register-new")
    public ResponseEntity<UserEntity> addNewAdmin(@RequestBody UserDTO newAdmin) {
        return ResponseEntity.ok(adminService.addNewAdmin(newAdmin));
    }
}
