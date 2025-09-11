package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface UserRepository extends JpaRepository <UserEntity,Long> {
    Optional<UserEntity> findByEmail(String email);

    List<UserEntity> findByRole(UserRole role);
}
