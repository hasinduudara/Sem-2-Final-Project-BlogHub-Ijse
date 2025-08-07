package lk.ijse.gdse.backend.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
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
    public String registerUser(@RequestBody UserDTO userDTO, HttpServletResponse response) {
        String result = userService.registerUser(userDTO);

        if (result.equals("Registration Successful!")) {
            Cookie cookie = new Cookie("userEmail", userDTO.getEmail());
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7 Days
            response.addCookie(cookie);
        }

        return result;
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

        return new ApiResponse(200, "Login Success", user.getUsername() + " logged in");
    }

}
