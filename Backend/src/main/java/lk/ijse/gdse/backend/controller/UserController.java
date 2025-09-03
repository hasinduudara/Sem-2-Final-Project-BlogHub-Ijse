package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.LoginResponse;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // ✅ User Registration
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody UserDTO userDTO) {
        String result = userService.registerUser(userDTO);

        if ("Registration Successful!".equals(result)) {
            String token = jwtUtil.generateToken(userDTO.getEmail());
            return ResponseEntity.ok(
                    new ApiResponse(201, "Registration Successful!",
                            new LoginResponse(userDTO.getUsername(), token))
            );
        }

        return ResponseEntity.ok(new ApiResponse(400, "Registration Failed", result));
    }

    // ✅ User Login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody UserDTO userDTO) {
        UserEntity user = userService.validateLogin(userDTO.getEmail(), userDTO.getPassword());

        if (user == null) {
            return ResponseEntity.ok(new ApiResponse(401, "Login Failed", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return ResponseEntity.ok(
                new ApiResponse(200, "Login Successful",
                        new LoginResponse(user.getUsername(), token))
        );
    }

    // ✅ Get User by Email
    @GetMapping("/users/{email}")
    public UserEntity getUserByEmail(@PathVariable String email) {
        UserEntity user = userService.findByEmail(email);
        if (user == null) throw new UsernameNotFoundException("User not found");
        return user;
    }
}