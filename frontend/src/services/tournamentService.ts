import API from './api';

export const getAllTournaments = async () => {
  const response = await API.get('/tournaments');
  return response.data;
};

export const createTournament = async (data: any) => {
  const response = await API.post('/tournaments', data);
  return response.data;
};

export const registerForTournament = async (tournamentId: string, teamId: string) => {
  const response = await API.post(`/tournaments/${tournamentId}/register`, { teamId });
  return response.data;
};

export const registerSolo = async (tournamentId: string) => {
  const response = await API.post(`/tournaments/${tournamentId}/register-solo`);
  return response.data;
};

// Export for joining a tournament using an invite code
export const joinTournamentViaInvite = async (tournamentId: string, inviteCode: string) => {
  const response = await API.post(`/tournaments/${tournamentId}/join-via-invite`, { inviteCode });
  return response.data;
};

export const getMyRegisteredTournaments = async () => {
  const response = await API.get('/tournaments/my-registered');
  return response.data;
};

export const getRegistrationsForTournament = async (tournamentId: string) => {
  const response = await API.get(`/tournaments/${tournamentId}/registrations`);
  return response.data;
};

export const getRegisteredTeamsForParticipant = async (tournamentId: string) => {
  const response = await API.get(`/tournaments/${tournamentId}/registered-teams`);
  return response.data;
};

export const cancelTournament = async (tournamentId: string) => {
  const response = await API.put(`/tournaments/${tournamentId}/cancel`);
  return response.data;
};

export const rescheduleTournament = async (tournamentId: string, matchTiming: string) => {
  const response = await API.put(`/tournaments/${tournamentId}/reschedule`, { matchTiming });
  return response.data;
};

export const removeTeamFromTournament = async (tournamentId: string, teamId: string) => {
  const response = await API.delete(`/tournaments/${tournamentId}/registrations/${teamId}`);
  return response.data;
};

export const deleteTournament = async (tournamentId: string) => {
  const response = await API.delete(`/tournaments/${tournamentId}`);
  return response.data;
};

export const updateTournamentResults = async (tournamentId: string, resultData: any) => {
  const response = await API.put(`/tournaments/${tournamentId}/result`, resultData);
  return response.data;
};

export const getTournamentResults = async (tournamentId: string) => {
  const response = await API.get(`/tournaments/${tournamentId}/results`);
  return response.data;
};

export const getUserRegisteredTournaments = async (userId: string) => {
  const response = await API.get(`/tournaments/user/${userId}/registered`);
  return response.data;
};

export const updateRoomCredentials = async (tournamentId: string, roomId: string, roomPassword: string) => {
  const response = await API.put(`/tournaments/${tournamentId}/room-credentials`, { roomId, roomPassword });
  return response.data;
};

export const getRoomCredentials = async (tournamentId: string) => {
  const response = await API.get(`/tournaments/${tournamentId}/room-credentials`);
  return response.data;
};
