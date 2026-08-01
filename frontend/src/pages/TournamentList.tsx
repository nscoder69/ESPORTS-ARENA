import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getAllTournaments, deleteTournament } from '../services/tournamentService';
import { Trophy, X, Gamepad2, Key, Clock, Copy, CheckCircle } from 'lucide-react';
import logo from '../assets/obitoloo.png';
import LoadingSpinner from '../components/LoadingSpinner';
import { createTeam } from '../services/teamService';
import { registerForTournament, getRegisteredTeamsForParticipant, joinTournamentViaInvite, getMyRegisteredTournaments, registerSolo, getTournamentResults, getRoomCredentials } from '../services/tournamentService';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import TournamentCard from '../components/TournamentCard';
import ResultsModal from '../components/ResultsModal';
import { getWalletBalance } from '../services/walletService';
import { getImageUrl } from '../services/api';

export default function TournamentList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Read mode from URL if present
  const getInitialFilter = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'clash-squad') return 'Clash Squad';
    if (mode === 'full-map-solo') return 'Full Map - Solo';
    if (mode === 'full-map-duo') return 'Full Map - Duo';
    if (mode === 'full-map-squad') return 'Full Map - Squad';
    if (mode === 'live') return 'Live';
    if (mode === 'registered') return 'Registered';
    return 'All';
  }, [location.search]);

  const [filterType, setFilterType] = useState(getInitialFilter());

  useEffect(() => {
    setFilterType(getInitialFilter());
  }, [getInitialFilter]);

  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [registrationMode, setRegistrationMode] = useState<'select' | 'create' | 'join' | 'success' | 'solo'>('select');
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdInviteCode, setCreatedInviteCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [registeredTournamentIds, setRegisteredTournamentIds] = useState<Set<string>>(new Set());
  const hasGameProfile = !!(user && user.gameName && user.freeFireUid);

  // Participants Modal State
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantTeams, setParticipantTeams] = useState<any[]>([]);
  const [participantsError, setParticipantsError] = useState('');

  // Results Modal State
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [tournamentResults, setTournamentResults] = useState<any[]>([]);
  const [resultsError, setResultsError] = useState('');

  // Room Credentials Modal State
  const [isRoomCredentialsModalOpen, setIsRoomCredentialsModalOpen] = useState(false);
  const [roomCredentialsData, setRoomCredentialsData] = useState<any>(null);
  const [loadingRoomCredentials, setLoadingRoomCredentials] = useState(false);
  const [roomCredentialsError, setRoomCredentialsError] = useState('');
  const [copiedField, setCopiedField] = useState<'id' | 'pwd' | null>(null);

  const handleGetRoomCredentials = async (tournament: any) => {
    setSelectedTournament(tournament);
    setIsRoomCredentialsModalOpen(true);
    setLoadingRoomCredentials(true);
    setRoomCredentialsError('');
    setRoomCredentialsData(null);
    setCopiedField(null);

    try {
      const data = await getRoomCredentials(tournament.id);
      setRoomCredentialsData(data);
    } catch (err: any) {
      setRoomCredentialsError(err.response?.data?.message || 'Failed to retrieve Room ID and Password.');
    } finally {
      setLoadingRoomCredentials(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    const fetchTournaments = async () => {
      try {
        const [data, registeredData] = await Promise.all([
          getAllTournaments(),
          userStr ? getMyRegisteredTournaments() : Promise.resolve([])
        ]);
        setTournaments(data);
        if (registeredData.length > 0) {
          const ids = new Set<string>(registeredData.map((t: any) => t.id));
          setRegisteredTournamentIds(ids);
        }
      } catch (err) {
        console.error("Failed to fetch tournaments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const openRegisterModal = async (tournament: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedTournament(tournament);
    setRegistrationMode(tournament.gameMode === 'Full Map - Solo' ? 'solo' : 'select');
    setTeamName('');
    setInviteCode('');
    setCreatedInviteCode('');
    setModalError('');
    setModalSuccess('');
    setIsModalOpen(true);

    try {
      const w = await getWalletBalance();
      setWalletBalance(w.balance);
    } catch (err) {
      console.error("Failed to fetch wallet balance", err);
      setWalletBalance(null);
    }
  };

  const handleSoloRegister = async () => {
    setIsRegistering(true);
    setModalError('');
    try {
      await registerSolo(selectedTournament.id);

      setModalSuccess('Successfully registered as a solo player!');
      setRegistrationMode('success');
      setRegisteredTournamentIds(prev => new Set(prev).add(selectedTournament.id));
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCreateAndRegister = async () => {
    if (!teamName.trim()) {
      setModalError('Please enter a team name.');
      return;
    }

    setIsRegistering(true);
    setModalError('');
    try {
      const newTeam = await createTeam({ name: teamName });
      try {
        await registerForTournament(selectedTournament.id, newTeam.id);
        setCreatedInviteCode(newTeam.inviteCode);
        setModalSuccess('Successfully created team and registered!');
        setRegistrationMode('success');
        setRegisteredTournamentIds(prev => new Set(prev).add(selectedTournament.id));
        window.dispatchEvent(new Event('walletUpdated'));
      } catch (regErr: any) {
        const errMsg = regErr.response?.data?.message || '';
        if (errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('already a member')) {
          setCreatedInviteCode(newTeam.inviteCode);
          setModalSuccess('Successfully created team and registered!');
          setRegistrationMode('success');
          setRegisteredTournamentIds(prev => new Set(prev).add(selectedTournament.id));
          window.dispatchEvent(new Event('walletUpdated'));
        } else {
          throw regErr;
        }
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to register.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleJoinViaInvite = async () => {
    if (!inviteCode.trim()) {
      setModalError('Please enter an invite code.');
      return;
    }

    setIsRegistering(true);
    setModalError('');
    try {
      await joinTournamentViaInvite(selectedTournament.id, inviteCode);
      setModalSuccess('Successfully joined the team for this tournament!');
      setRegistrationMode('success');
      setRegisteredTournamentIds(prev => new Set(prev).add(selectedTournament.id));
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to join tournament. Check the code.');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdInviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openParticipantsModal = async (tournament: any) => {
    setSelectedTournament(tournament);
    setIsParticipantsModalOpen(true);
    setParticipantsLoading(true);
    setParticipantsError('');
    setParticipantTeams([]);

    try {
      const data = await getRegisteredTeamsForParticipant(tournament.id);
      setParticipantTeams(data);
    } catch (err: any) {
      setParticipantsError(err.response?.data?.message || 'Failed to load participants. You may not be registered.');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const openResultsModal = async (tournament: any) => {
    setSelectedTournament(tournament);
    setIsResultsModalOpen(true);
    setResultsLoading(true);
    setResultsError('');
    setTournamentResults([]);

    try {
      const data = await getTournamentResults(tournament.id);
      setTournamentResults(data);
    } catch (err: any) {
      setResultsError(err.response?.data?.message || 'Failed to load tournament results.');
    } finally {
      setResultsLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filterType === 'All') return true;
    if (filterType === 'Clash Squad') return t.gameMode === 'Clash Squad' || t.gameMode === 'CLASH_SQUAD';
    if (filterType === 'Full Map - Solo') return t.gameMode.includes('Solo') || t.gameMode === 'SOLO';
    if (filterType === 'Full Map - Duo') return t.gameMode.includes('Duo') || t.gameMode === 'DUO';
    if (filterType === 'Full Map - Squad') return t.gameMode === 'Full Map - Squad' || t.gameMode === 'SQUAD';
    if (filterType === 'Live') return t.matchTiming && new Date(t.matchTiming) < new Date();
    if (filterType === 'Registered') return registeredTournamentIds.has(t.id);
    return true;
  });

  const upcomingTournaments = (filterType === 'Live' ? [] : filteredTournaments.filter(t => !t.matchTiming || new Date(t.matchTiming) >= new Date()))
    .filter(t => t.status !== 'Cancelled' && t.status !== 'Finished');

  const liveTournaments = (filterType === 'Live' ? filteredTournaments : filteredTournaments.filter(t => t.matchTiming && new Date(t.matchTiming) < new Date()))
    .filter(t => {
      if (t.status === 'Cancelled') return false;
      if (t.status === 'Finished') {
        if (!t.updatedAt) return false;
        const elapsed = Date.now() - new Date(t.updatedAt).getTime();
        return elapsed < 10 * 60 * 1000; // 10 minutes in ms
      }
      return true;
    });

  const finishedTournaments = filteredTournaments.filter(t => {
    if (t.status !== 'Finished') return false;
    if (!t.updatedAt) return true;
    const elapsed = Date.now() - new Date(t.updatedAt).getTime();
    return elapsed < 10 * 60 * 1000; // Disappear 10 minutes after tournament finishes
  });

  const handleDeleteTournament = async (tournament: any) => {
    if (window.confirm(`Are you sure you want to delete ${tournament.name}?`)) {
      try {
        await deleteTournament(tournament.id);
        setTournaments(tournaments.filter(t => t.id !== tournament.id));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete tournament');
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">Tournaments</h2>
          <p className="text-textSecondary text-sm">Compete in verified tournaments and win prize pools.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setFilterType('All')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'All' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            All Modes
          </button>
          <button
            onClick={() => setFilterType('Live')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'Live' ? 'bg-rose-500 text-white border-rose-500' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            Live Tournaments
          </button>
          <button
            onClick={() => setFilterType('Clash Squad')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'Clash Squad' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            Clash Squad
          </button>
          <button
            onClick={() => setFilterType('Full Map - Squad')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'Full Map - Squad' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            FM - Squad
          </button>
          <button
            onClick={() => setFilterType('Full Map - Duo')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'Full Map - Duo' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            FM - Duo
          </button>
          <button
            onClick={() => setFilterType('Full Map - Solo')}
            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors whitespace-nowrap ${filterType === 'Full Map - Solo' ? 'bg-primary text-black border-primary' : 'bg-surface border-white/10 text-white hover:bg-surfaceHighlight'}`}
          >
            FM - Solo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.img
            src={logo}
            alt="Loading..."
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-12 h-12 object-contain"
          />
        </div>
      ) : (upcomingTournaments.length === 0 && liveTournaments.length === 0 && finishedTournaments.length === 0) ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
          <Trophy className="mx-auto text-borderDim mb-4" size={48} />
          <p className="text-textSecondary text-lg font-medium">No active tournaments</p>
        </div>
      ) : (
        <div className="space-y-12">
          {upcomingTournaments.length > 0 && (
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-4 border-b border-white/10 pb-2">Upcoming Tournaments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    isUserRegistered={registeredTournamentIds.has(tournament.id)}
                    onRegisterClick={() => openRegisterModal(tournament)}
                    onParticipantsClick={() => openParticipantsModal(tournament)}
                    onResultClick={openResultsModal}
                    onRoomCredentialsClick={handleGetRoomCredentials}
                    onDeleteClick={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' ? handleDeleteTournament : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {liveTournaments.length > 0 && (
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Live Tournaments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    isUserRegistered={registeredTournamentIds.has(tournament.id)}
                    onParticipantsClick={() => openParticipantsModal(tournament)}
                    onResultClick={openResultsModal}
                    onRoomCredentialsClick={handleGetRoomCredentials}
                    onDeleteClick={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' ? handleDeleteTournament : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {finishedTournaments.length > 0 && (
            <div>
              <h3 className="text-xl font-bold font-display text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                Finished Tournaments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finishedTournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    isUserRegistered={registeredTournamentIds.has(tournament.id)}
                    onParticipantsClick={() => openParticipantsModal(tournament)}
                    onResultClick={openResultsModal}
                    onRoomCredentialsClick={handleGetRoomCredentials}
                    onDeleteClick={user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN' ? handleDeleteTournament : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Registration Modal */}
      {isModalOpen && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-md w-full p-6 relative"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-2">Register for Tournament</h3>
            <p className="text-textSecondary text-sm mb-6">Select a team to register for <strong className="text-white">{selectedTournament.name}</strong></p>

            {modalError && <div className="bg-rose-500/10 text-rose-400 text-sm p-3 rounded-lg border border-rose-500/20 mb-4">{modalError}</div>}
            {modalSuccess && <div className="bg-emerald-500/10 text-emerald-400 text-sm p-3 rounded-lg border border-emerald-500/20 mb-4">{modalSuccess}</div>}

            {!hasGameProfile ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center text-amber-400 mt-2">
                <Gamepad2 className="mx-auto mb-2 text-amber-400 animate-pulse" size={24} />
                <h4 className="text-sm font-bold uppercase tracking-wider">Gaming Identity Required</h4>
                <p className="text-xs text-textSecondary mt-1 mb-4 leading-relaxed">
                  You must update your In-Game Name and Free Fire UID in your profile before participating in any tournament.
                </p>
                <Link
                  to="/profile/edit"
                  className="inline-block bg-amber-500 text-black hover:brightness-110 font-bold px-5 py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider w-full text-center"
                >
                  Configure Profile
                </Link>
              </div>
            ) : (
              <>
                {registrationMode === 'select' && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setRegistrationMode('create')}
                      className="w-full bg-surfaceHighlight border border-white/10 hover:border-primary/50 text-white p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors group"
                    >
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">Create Team</span>
                      <span className="text-xs text-textSecondary text-center">Create a new team, register for this tournament, and get an invite code for your friends.</span>
                    </button>
                    <div className="text-center text-xs text-textSecondary font-semibold uppercase tracking-widest my-2">OR</div>
                    <button
                      onClick={() => setRegistrationMode('join')}
                      className="w-full bg-surfaceHighlight border border-white/10 hover:border-primary/50 text-white p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors group"
                    >
                      <span className="font-bold text-lg group-hover:text-primary transition-colors">Join Team</span>
                      <span className="text-xs text-textSecondary text-center">Join an existing team that is already registered using their invite code.</span>
                    </button>
                  </div>
                )}

                {registrationMode === 'solo' && (
                  <div className="space-y-4">
                    {selectedTournament.entryFee > 0 && (
                      <div className="bg-surface border border-white/10 rounded-lg p-4 flex justify-between items-center mb-2">
                        <div>
                          <p className="text-textSecondary text-xs font-semibold uppercase">Entry Fee</p>
                          <p className="text-white font-bold text-lg font-display tracking-wider">₹{selectedTournament.entryFee}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-textSecondary text-xs font-semibold uppercase">Your Balance</p>
                          <p className={`font-bold text-lg font-display tracking-wider ${walletBalance !== null && walletBalance >= selectedTournament.entryFee ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : '...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTournament.entryFee > 0 && walletBalance !== null && walletBalance < selectedTournament.entryFee ? (
                      <div className="text-center py-2">
                        <p className="text-rose-400 text-sm mb-4 flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Insufficient Balance
                        </p>
                        <Link to="/wallet" className="btn-primary w-full inline-block text-center">
                          Add Funds to Wallet
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleSoloRegister}
                        disabled={isRegistering}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {isRegistering ? 'Registering...' : (selectedTournament.entryFee > 0 ? `Pay ₹${selectedTournament.entryFee} & Register` : 'Register for Free')}
                      </button>
                    )}
                  </div>
                )}

                {registrationMode === 'create' && (
                  <div className="space-y-4">
                    {selectedTournament.entryFee > 0 && (
                      <div className="bg-surface border border-white/10 rounded-lg p-4 flex justify-between items-center mb-2">
                        <div>
                          <p className="text-textSecondary text-xs font-semibold uppercase">Entry Fee</p>
                          <p className="text-white font-bold text-lg font-display tracking-wider">₹{selectedTournament.entryFee}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-textSecondary text-xs font-semibold uppercase">Your Balance</p>
                          <p className={`font-bold text-lg font-display tracking-wider ${walletBalance !== null && walletBalance >= selectedTournament.entryFee ? 'text-emerald-400' : 'text-rose-500'}`}>
                            {walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : '...'}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedTournament.entryFee > 0 && walletBalance !== null && walletBalance < selectedTournament.entryFee ? (
                      <div className="text-center py-4">
                        <p className="text-rose-400 text-sm mb-4 bg-rose-500/10 p-3 rounded border border-rose-500/20">
                          Insufficient wallet balance to register for this tournament. Please add funds.
                        </p>
                        <Link to="/wallet" className="btn-primary w-full block text-center py-3">
                          Add Funds to Wallet
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-textSecondary text-xs font-semibold uppercase tracking-wider mb-2">Team Name</label>
                          <input
                            type="text"
                            className="input-field w-full"
                            placeholder="Enter your team name..."
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            disabled={isRegistering}
                          />
                        </div>
                        <button
                          onClick={handleCreateAndRegister}
                          disabled={isRegistering || !teamName.trim()}
                          className="btn-primary w-full py-3 flex justify-center items-center gap-2 mt-4"
                        >
                          {isRegistering ? <><LoadingSpinner size={16} /> Creating...</> : (selectedTournament.entryFee > 0 ? `Pay ₹${selectedTournament.entryFee} & Register` : 'Create & Register')}
                        </button>
                      </>
                    )}
                    <button onClick={() => setRegistrationMode('select')} className="text-xs text-textSecondary hover:text-white w-full text-center mt-2">Back</button>
                  </div>
                )}

                {registrationMode === 'join' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-textSecondary text-xs font-semibold uppercase tracking-wider mb-2">Invite Code</label>
                      <input
                        type="text"
                        className="input-field w-full uppercase tracking-widest text-center text-lg"
                        placeholder="ENTER CODE"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                        maxLength={10}
                        disabled={isRegistering}
                      />
                    </div>
                    <button
                      onClick={handleJoinViaInvite}
                      disabled={isRegistering || !inviteCode.trim()}
                      className="btn-primary w-full py-3 flex justify-center items-center gap-2 mt-4"
                    >
                      {isRegistering ? <><LoadingSpinner size={16} /> Verifying...</> : 'Join Tournament'}
                    </button>
                    <button onClick={() => setRegistrationMode('select')} className="text-xs text-textSecondary hover:text-white w-full text-center mt-2">Back</button>
                  </div>
                )}

                {registrationMode === 'success' && (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto text-emerald-400 mb-4" size={48} />
                    <h4 className="text-xl font-bold text-white mb-2">{modalSuccess}</h4>

                    {createdInviteCode && (
                      <div className="mt-6 bg-surfaceHighlight border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-textSecondary uppercase tracking-widest font-semibold mb-3">Your Team Invite Code</p>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-2xl font-bold font-display tracking-widest text-primary">{createdInviteCode}</span>
                          <button
                            onClick={copyToClipboard}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-textSecondary hover:text-white"
                            title="Copy to clipboard"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        {copied && <p className="text-xs text-emerald-400 mt-2">Copied to clipboard!</p>}
                        <p className="text-xs text-textSecondary mt-4 leading-relaxed">
                          Share this code with your squad. They can use it by selecting <strong>Join Team</strong> on this tournament.
                        </p>
                      </div>
                    )}

                    <button onClick={() => { setIsModalOpen(false); setRegistrationMode('select'); }} className="btn-primary mt-6 w-full">Done</button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Participants Modal */}
      {isParticipantsModalOpen && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-md w-full p-6 relative"
          >
            <button onClick={() => setIsParticipantsModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold font-display text-white mb-2">Registered Teams</h3>
            <p className="text-textSecondary text-sm mb-6">Teams participating in <strong className="text-white">{selectedTournament.name}</strong></p>

            {participantsError ? (
              <div className="bg-rose-500/10 text-rose-400 text-sm p-4 rounded-lg border border-rose-500/20 text-center">
                {participantsError}
              </div>
            ) : participantsLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <LoadingSpinner size={28} className="mb-2" />
                <p className="text-textSecondary text-sm">Verifying registration...</p>
              </div>
            ) : participantTeams.length === 0 ? (
              <div className="text-center py-8 text-textSecondary text-sm">
                No teams have registered yet.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {participantTeams.map((team: any) => (
                  <div key={team.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-white/5">
                    <div className="w-8 h-8 rounded bg-background flex items-center justify-center overflow-hidden flex-shrink-0">
                      {team.logoUrl ? (
                        <img src={getImageUrl(team.logoUrl)} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Trophy size={14} className="text-textSecondary" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="text-white font-bold text-sm block truncate">{team.name}</span>
                      {(team.captainGameName || team.captainFreeFireUid) && (
                        <span className="text-xs text-primary font-semibold block truncate">
                          {team.captainGameName || 'Player'} {team.captainFreeFireUid ? `(UID: ${team.captainFreeFireUid})` : ''}
                        </span>
                      )}
                    </div>
                    {team.slotNumber && (
                      <div className="flex-shrink-0 bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded text-xs font-bold font-display">
                        Slot {team.slotNumber}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Free Fire Room Credentials Modal */}
      {isRoomCredentialsModalOpen && selectedTournament && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-md w-full p-6 relative border border-emerald-500/20 shadow-2xl"
          >
            <button onClick={() => setIsRoomCredentialsModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Key size={24} className="text-emerald-400" />
              <h3 className="text-xl font-bold font-display text-white">Free Fire Room Details</h3>
            </div>
            <p className="text-textSecondary text-xs mb-6">Tournament: <strong className="text-white">{selectedTournament.name}</strong></p>

            {loadingRoomCredentials ? (
              <div className="flex flex-col items-center justify-center py-10">
                <LoadingSpinner size={28} className="mb-2" />
                <p className="text-textSecondary text-sm animate-pulse">Fetching Room Credentials...</p>
              </div>
            ) : roomCredentialsError ? (
              <div className="bg-rose-500/10 text-rose-400 text-sm p-4 rounded-xl border border-rose-500/20 text-center font-medium">
                {roomCredentialsError}
              </div>
            ) : !(roomCredentialsData?.isUpdated || roomCredentialsData?.updated) ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center text-amber-400">
                <Clock className="mx-auto mb-2 text-amber-400 animate-pulse" size={28} />
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1">Room ID & Password Not Updated Yet</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  The Admin has not set the Free Fire Room ID and Password for this tournament yet. Please check back closer to the match start time!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                  <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">Free Fire Room ID</label>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-mono font-extrabold text-white tracking-widest">{roomCredentialsData.roomId}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomCredentialsData.roomId);
                        setCopiedField('id');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === 'id' ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy ID</>}
                    </button>
                  </div>
                </div>

                <div className="bg-surface border border-white/10 rounded-xl p-4">
                  <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">Room Password</label>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-mono font-extrabold text-primary tracking-widest">{roomCredentialsData.roomPassword}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(roomCredentialsData.roomPassword);
                        setCopiedField('pwd');
                        setTimeout(() => setCopiedField(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === 'pwd' ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Password</>}
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center text-[11px] text-textSecondary">
                  💡 Open Free Fire ➔ Select Custom Room ➔ Enter Room ID & Password to join match!
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Results / Leaderboard Modal */}
      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        selectedTournament={selectedTournament}
        tournamentResults={tournamentResults}
        loading={resultsLoading}
        error={resultsError}
      />
    </div>
  );
}
