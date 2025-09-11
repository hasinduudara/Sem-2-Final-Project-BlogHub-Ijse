package lk.ijse.gdse.backend.service.impl;

import jakarta.transaction.Transactional;
import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.entity.SubscriptionEntity;
import lk.ijse.gdse.backend.repository.SubscriptionRepository;
import lk.ijse.gdse.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional
    public ApiResponse subscribePublisher(String email, String plan, String orderId, String paymentStatus) {
        // Check if user already has a subscription
        if (subscriptionRepository.existsByPublisherEmail(email)) {
            Optional<SubscriptionEntity> existingSubscription = subscriptionRepository.findByPublisherEmail(email);
            if (existingSubscription.isPresent() &&
                existingSubscription.get().getStatus() == SubscriptionEntity.SubscriptionStatus.ACTIVE) {
                return new ApiResponse(409, "CONFLICT", "You already have an active subscription.");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = plan.equalsIgnoreCase("YEARLY") ? now.plusYears(1) : now.plusMonths(1);
        double amount = plan.equalsIgnoreCase("YEARLY") ? 49999.0 : 4999.0;

        // Determine subscription status based on payment status
        SubscriptionEntity.SubscriptionStatus status = SubscriptionEntity.SubscriptionStatus.PENDING;
        if ("COMPLETED".equals(paymentStatus)) {
            status = SubscriptionEntity.SubscriptionStatus.ACTIVE;
        }

        SubscriptionEntity subscription = SubscriptionEntity.builder()
                .publisherEmail(email)
                .plan(plan)
                .amount(amount)
                .subscribedAt(now)
                .expiryDate(expiry)
                .orderId(orderId)
                .paymentStatus(paymentStatus)
                .status(status)
                .build();

        subscriptionRepository.save(subscription);

        if ("COMPLETED".equals(paymentStatus)) {
            return new ApiResponse(200, "SUCCESS", "Subscription activated successfully! You now have full access to premium features.");
        } else {
            return new ApiResponse(200, "PENDING", "Subscription created. Waiting for payment confirmation.");
        }
    }

    @Override
    public ApiResponse getSubscriptionStatus(String email) {
        Optional<SubscriptionEntity> subscription = subscriptionRepository.findByPublisherEmail(email);

        if (subscription.isEmpty()) {
            return new ApiResponse(404, "NOT_FOUND", "No subscription found for this email.");
        }

        SubscriptionEntity sub = subscription.get();

        // Check if subscription has expired
        if (sub.getExpiryDate().isBefore(LocalDateTime.now()) &&
            sub.getStatus() == SubscriptionEntity.SubscriptionStatus.ACTIVE) {
            sub.setStatus(SubscriptionEntity.SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
        }

        return new ApiResponse(200, "SUCCESS", "Subscription found");
    }

    @Override
    @Transactional
    public void updateSubscriptionStatus(String orderId, String status) {
        Optional<SubscriptionEntity> subscription = subscriptionRepository.findByOrderId(orderId);

        if (subscription.isPresent()) {
            SubscriptionEntity sub = subscription.get();

            if ("ACTIVE".equals(status)) {
                sub.setStatus(SubscriptionEntity.SubscriptionStatus.ACTIVE);
                sub.setPaymentStatus("COMPLETED");
            } else if ("FAILED".equals(status)) {
                sub.setStatus(SubscriptionEntity.SubscriptionStatus.FAILED);
                sub.setPaymentStatus("FAILED");
            }

            subscriptionRepository.save(sub);
        }
    }
}