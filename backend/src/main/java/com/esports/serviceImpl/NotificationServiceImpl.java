package com.esports.serviceImpl;

import com.esports.entity.Notification;
import com.esports.entity.User;
import com.esports.repository.NotificationRepository;
import com.esports.service.NotificationService;
import com.esports.service.RealtimeEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final RealtimeEventPublisher realtimeEventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String userEmail) {
        return notificationRepository.findByUser_EmailOrderByCreatedAtDesc(userEmail);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, String userEmail) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        realtimeEventPublisher.publishUserNotification(userEmail, notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        notificationRepository.markAllAsReadForUser(userEmail);
        realtimeEventPublisher.publishUserNotification(userEmail, "all_read");
    }

    @Override
    @Transactional
    public Notification createNotification(User user, String title, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);
        Notification saved = notificationRepository.save(notification);
        if (user != null && user.getEmail() != null) {
            realtimeEventPublisher.publishUserNotification(user.getEmail(), saved);
        }
        return saved;
    }
}
