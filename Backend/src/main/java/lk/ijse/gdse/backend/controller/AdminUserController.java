package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.AdminDeleteRequest;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // Get all users by role
    @GetMapping
    public ResponseEntity<List<UserDTO>> getUsersByRole(@RequestParam("role") String role) {
        return ResponseEntity.ok(adminUserService.getUsersByRole(role));
    }

    // Remove user with reason
    @DeleteMapping("/{id}")
    public ResponseEntity<String> removeUser(
            @PathVariable Long id,
            @RequestBody AdminDeleteRequest requestDTO) {

        adminUserService.removeUser(id, requestDTO.getReason());
        return ResponseEntity.ok("User removed and notified successfully.");
    }
}
