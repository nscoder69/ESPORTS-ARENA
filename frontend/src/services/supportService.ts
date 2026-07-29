import API from './api';

export const createSupportTicket = async (data: { subject: string; message: string }) => {
  const response = await API.post('/support/tickets', data);
  return response.data;
};

export const getUserSupportTickets = async () => {
  const response = await API.get('/support/tickets');
  return response.data;
};

export const getAdminSupportTickets = async () => {
  const response = await API.get('/support/admin/tickets');
  return response.data;
};

export const replyToSupportTicket = async (ticketId: string, reply: string) => {
  const response = await API.post(`/support/admin/tickets/${ticketId}/reply`, { reply });
  return response.data;
};
