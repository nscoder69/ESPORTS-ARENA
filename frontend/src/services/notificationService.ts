import API from './api';

export const getUserNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await API.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.put('/notifications/read-all');
  return response.data;
};
