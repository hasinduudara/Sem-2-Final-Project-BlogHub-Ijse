package lk.ijse.gdse.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.LoginResponse;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ApiResponse registerUser(@RequestBody UserDTO userDTO, HttpServletResponse response) {
        String result = userService.registerUser(userDTO);

        if (result.equals("Registration Successful!")) {
            // Generate JWT token using username or email
            String token = jwtUtil.generateToken(userDTO.getUsername());

            // Set token in cookie
            Cookie jwtCookie = new Cookie("jwtToken", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(7 * 24 * 60 * 60); // 7 Days
            response.addCookie(jwtCookie);

            // Optionally set another cookie to store username (non-HTTP-only, accessible to frontend if needed)
            Cookie userCookie = new Cookie("username", userDTO.getUsername());
            userCookie.setPath("/");
            userCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(userCookie);

            return new ApiResponse(201, "Registration Successful!", "JWT Token: " + token);
        }

        return new ApiResponse(400, "Registration Failed", result);
    }


    @GetMapping("/roles")
    public UserRole[] getAllRoles() {
        return UserRole.values();
    }

    @PostMapping("/login")
    public ApiResponse login(@RequestBody UserDTO userDTO, HttpServletResponse response) {
        UserEntity user = userService.validateLogin(userDTO.getEmail(), userDTO.getPassword());

        if (user == null) {
            return new ApiResponse(401, "Login Failed", "Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        Cookie jwtCookie = new Cookie("jwtToken", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
        response.addCookie(jwtCookie);

        // ✅ Show token directly in API response
        return new ApiResponse(200, "Login Success", new LoginResponse(user.getUsername(), token));
    }

    @GetMapping("/users/{email}")
    public UserEntity getUserByEmail(@PathVariable String email) {
        UserEntity user = userService.findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
        return user;
    }

    @PostMapping("/logout")
    public ApiResponse logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie("jwtToken", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // expire immediately
        response.addCookie(jwtCookie);

        Cookie userCookie = new Cookie("username", null);
        userCookie.setPath("/");
        userCookie.setMaxAge(0);
        response.addCookie(userCookie);

        return new ApiResponse(200, "Logout Successful", null);
    }

}