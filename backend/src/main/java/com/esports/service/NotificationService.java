package com.esports.service;

import com.esports.entity.Notification;
import java.util.List;
import java.util.UUID;

public interface NotificationService {
    List<Notification> getUserNotifications(String userEmail);
    void markAsRead(UUID notificationId, String userEmail);
    void markAllAsRead(String userEmail);
    Notification createNotification(com.esports.entity.User user, String title, String message);
}
