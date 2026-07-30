import API from './api';

export const login = async (data: any) => {
  const response = await API.post('/auth/login', data);
  return response.data;
};

export const sendOtp = async (email: string) => {
  const response = await API.post(`/auth/send-otp?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const sendForgotPasswordOtp = async (email: string) => {
  const response = await API.post(`/auth/forgot-password/send-otp?email=${encodeURIComponent(email)}`);
  return response.data;
};

export const resetPassword = async (data: any) => {
  const response = await API.post('/auth/forgot-password/reset', data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });

  const response = await API.post('/auth/register', formData);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await API.get('/users');
  return response.data;
};

export const blockUser = async (userId: string) => {
  await API.put(`/users/${userId}/block`);
};

export const unblockUser = async (userId: string) => {
  await API.put(`/users/${userId}/unblock`);
};

export const deleteUser = async (userId: string) => {
  await API.delete(`/users/${userId}`);
};
