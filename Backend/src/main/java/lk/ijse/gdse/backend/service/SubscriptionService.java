package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.ApiResponse;

public interface SubscriptionService {
    ApiResponse subscribePublisher(String email, String plan, String orderId, String paymentStatus);
    ApiResponse getSubscriptionStatus(String email);
    void updateSubscriptionStatus(String orderId, String status);
}
