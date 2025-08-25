package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.CommentDTO;

import java.util.List;

public interface CommentService {
    CommentDTO addComment(CommentDTO dto, String username);
    List<CommentDTO> getCommentsByArticle(Long articleId);
}
