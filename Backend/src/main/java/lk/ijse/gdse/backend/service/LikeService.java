package lk.ijse.gdse.backend.service;

public interface LikeService {
    String toggleLike(Long articleId, String username);
    Long getLikes(Long articleId);
}
