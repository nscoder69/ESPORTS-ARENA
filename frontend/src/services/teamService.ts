import API from './api';

export const getAllTeams = async () => {
  const response = await API.get('/teams');
  return response.data;
};

export const createTeam = async (data: any) => {
  const response = await API.post('/teams', data);
  return response.data;
};

export const getMyTeams = async () => {
  const response = await API.get('/teams/my-teams');
  return response.data;
};

export const getTeamMembers = async (teamId: string) => {
  const response = await API.get(`/teams/${teamId}/members`);
  return response.data;
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  const response = await API.delete(`/teams/${teamId}/members/${userId}`);
  return response.data;
};

export const joinTeam = async (inviteCode: string) => {
  const response = await API.post('/teams/join', { inviteCode });
  return response.data;
};

export const deleteTeam = async (teamId: string) => {
  const response = await API.delete(`/teams/${teamId}`);
  return response.data;
};
