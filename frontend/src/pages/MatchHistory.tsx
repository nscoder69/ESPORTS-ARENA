import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trophy, ChevronRight, Calendar, Map, CheckCircle, Key, Copy, Clock, X, Shield, Check, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/obitoloo.png';
import { getMyRegisteredTournaments, getTournamentResults, getRoomCredentials } from '../services/tournamentService';
import ResultsModal from '../components/ResultsModal';
import TeamMembersModal from '../components/TeamMembersModal';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchHistory = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  // Team Members Modal state
  const [isTeamMembersModalOpen, setIsTeamMembersModalOpen] = useState(false);
  const [teamMembersModalData, setTeamMembersModalData] = useState<{ id: string; name: string } | null>(null);

  const handleOpenTeamMembers = (tournament: any) => {
    if (tournament.registeredTeamId) {
      setTeamMembersModalData({
        id: tournament.registeredTeamId,
        name: tournament.registeredTeamName || tournament.name
      });
      setIsTeamMembersModalOpen(true);
    }
  };

  // Results Modal state
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [tournamentResults, setTournamentResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState('');

  // Room Credentials Modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getMyRegisteredTournaments();
        setTournaments(data || []);
      } catch (err) {
        console.error('Failed to load match history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

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

  const openRoomModal = async (tournament: any) => {
    setSelectedTournament(tournament);
    setIsRoomModalOpen(true);
    setRoomLoading(true);
    setRoomError('');
    setRoomData(null);

    try {
      const data = await getRoomCredentials(tournament.id);
      setRoomData(data);
    } catch (err: any) {
      setRoomError(err.response?.data?.message || 'Failed to load room details.');
    } finally {
      setRoomLoading(false);
    }
  };

  const finishedTournaments = tournaments.filter(t => t.status === 'Finished');
  const activeTournaments = tournaments.filter(t => t.status !== 'Finished');

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-10 overflow-y-auto bg-background">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center shadow-fire-sm">
            <History className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">Match History & Results</h2>
            <p className="text-xs sm:text-sm text-textSecondary mt-0.5">Review your past tournaments, squad credentials, and official leaderboards.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.img
              src={logo}
              alt="Loading..."
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-12 h-12 object-contain mb-4"
            />
            <p className="text-textSecondary text-sm animate-pulse">Loading history...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-borderColor rounded-2xl p-10 sm:p-12 text-center shadow-card-dark"
          >
            <div className="w-20 h-20 bg-elevated border border-borderColor rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-textSecondary/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Match History Found</h3>
            <p className="text-textSecondary text-sm mb-6 max-w-md mx-auto leading-relaxed">
              You haven't participated in any tournaments yet. Join a team and register for an upcoming tournament to start building your legacy!
            </p>
            <Link to="/tournaments" className="btn-primary inline-flex items-center justify-center gap-2 max-w-xs mx-auto">
              Browse Tournaments <ChevronRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Finished Tournaments Section */}
            {finishedTournaments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2 border-b border-borderColor pb-3">
                  <CheckCircle className="text-emerald-400" size={18} /> Finished Tournaments ({finishedTournaments.length})
                </h3>
                <div className="space-y-4">
                  {finishedTournaments.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-5 border border-borderColor hover:border-primary/40 rounded-2xl shadow-card-dark transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-elevated text-textSecondary border border-borderColor text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            Finished
                          </span>
                          <span className="text-xs text-textSecondary flex items-center gap-1">
                            <Map size={12} className="text-primary" /> {t.gameMode} ({t.gameMap})
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base sm:text-lg">{t.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-textSecondary mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-textSecondary" /> {t.matchTiming ? new Date(t.matchTiming).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="text-gold font-bold">
                            Prize Pool: ₹{t.prizePool}
                          </span>
                        </div>

                        {/* Registered Team Credentials */}
                        {t.registeredTeamName && (
                          <div className="mt-3.5 p-3 bg-elevated border border-borderColor rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Shield size={14} className="text-primary" />
                              <span className="text-white">{t.registeredTeamName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.registeredTeamId && (
                                <button
                                  onClick={() => handleOpenTeamMembers(t)}
                                  className="bg-inputBg hover:bg-card border border-borderColor hover:border-primary/50 text-primary p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                  title="View Team Members"
                                >
                                  <Users size={14} />
                                </button>
                              )}
                              {t.registeredTeamInviteCode && (
                                <div className="flex items-center gap-1.5 bg-inputBg px-2.5 py-1 rounded-lg border border-borderColor">
                                  <Key size={12} className="text-primary" />
                                  <span className="text-[10px] text-textSecondary uppercase font-bold">Invite Code:</span>
                                  <span className="font-mono text-white text-[11px] font-bold tracking-wider">
                                    {t.registeredTeamInviteCode}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(t.registeredTeamInviteCode);
                                      setCopiedInviteCode(t.registeredTeamInviteCode);
                                      setTimeout(() => setCopiedInviteCode(null), 2000);
                                    }}
                                    className="ml-1 p-1 text-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                    title="Copy Invite Code"
                                  >
                                    {copiedInviteCode === t.registeredTeamInviteCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedInviteCode === t.registeredTeamInviteCode ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openResultsModal(t)}
                          className="bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-gold-sm transition-all"
                        >
                          <Trophy size={14} /> View Leaderboard
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Active / Registered Tournaments Section */}
            {activeTournaments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2 border-b border-borderColor pb-3">
                  <Trophy className="text-primary" size={18} /> Active & Upcoming Tournaments ({activeTournaments.length})
                </h3>
                <div className="space-y-4">
                  {activeTournaments.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card p-5 border border-borderColor hover:border-primary/40 rounded-2xl shadow-card-dark transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                            t.status?.toLowerCase().includes('live')
                              ? 'bg-secondary/15 text-secondary border-secondary/40 shadow-red-sm'
                              : 'bg-primary/15 text-primary border-primary/30 shadow-fire-sm'
                          }`}>
                            {t.status || 'Upcoming'}
                          </span>
                          <span className="text-xs text-textSecondary flex items-center gap-1">
                            <Map size={12} className="text-primary" /> {t.gameMode} ({t.gameMap})
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base sm:text-lg">{t.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-textSecondary mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-textSecondary" /> {t.matchTiming ? new Date(t.matchTiming).toLocaleString() : 'TBD'}
                          </span>
                          <span className="text-primary font-bold">
                            Entry: {t.entryFee > 0 ? `₹${t.entryFee}` : 'FREE'}
                          </span>
                        </div>

                        {/* Registered Team Credentials */}
                        {t.registeredTeamName && (
                          <div className="mt-3.5 p-3 bg-elevated border border-borderColor rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Shield size={14} className="text-primary" />
                              <span className="text-white">{t.registeredTeamName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {t.registeredTeamId && (
                                <button
                                  onClick={() => handleOpenTeamMembers(t)}
                                  className="bg-inputBg hover:bg-card border border-borderColor hover:border-primary/50 text-primary p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                                  title="View Team Members"
                                >
                                  <Users size={14} />
                                </button>
                              )}
                              {t.registeredTeamInviteCode && (
                                <div className="flex items-center gap-1.5 bg-inputBg px-2.5 py-1 rounded-lg border border-borderColor">
                                  <Key size={12} className="text-primary" />
                                  <span className="text-[10px] text-textSecondary uppercase font-bold">Invite Code:</span>
                                  <span className="font-mono text-white text-[11px] font-bold tracking-wider">
                                    {t.registeredTeamInviteCode}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(t.registeredTeamInviteCode);
                                      setCopiedInviteCode(t.registeredTeamInviteCode);
                                      setTimeout(() => setCopiedInviteCode(null), 2000);
                                    }}
                                    className="ml-1 p-1 text-primary hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                    title="Copy Invite Code"
                                  >
                                    {copiedInviteCode === t.registeredTeamInviteCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    <span>{copiedInviteCode === t.registeredTeamInviteCode ? 'Copied' : 'Copy'}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => openRoomModal(t)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Key size={14} /> Get ID & PWD
                        </button>
                        <Link
                          to="/tournaments?mode=registered"
                          className="bg-elevated hover:bg-card border border-borderColor hover:border-primary/50 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors flex items-center gap-1"
                        >
                          Details <ChevronRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Modal */}
        <ResultsModal
          isOpen={isResultsModalOpen}
          onClose={() => setIsResultsModalOpen(false)}
          selectedTournament={selectedTournament}
          tournamentResults={tournamentResults}
          loading={resultsLoading}
          error={resultsError}
        />

        {/* Room Credentials Modal */}
        {isRoomModalOpen && selectedTournament && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-borderColor rounded-2xl shadow-card-dark max-w-md w-full p-6 sm:p-7 relative"
            >
              <button onClick={() => setIsRoomModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <Key size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">Free Fire Room Details</h3>
                  <span className="text-[10px] text-textSecondary uppercase tracking-wider">Custom Room Access</span>
                </div>
              </div>
              <p className="text-textSecondary text-xs mb-6">Tournament: <strong className="text-white">{selectedTournament.name}</strong></p>

              {roomLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <LoadingSpinner size={28} className="mb-2" />
                  <p className="text-textSecondary text-xs animate-pulse">Fetching Room Credentials...</p>
                </div>
              ) : roomError ? (
                <div className="bg-secondary/15 text-secondary text-xs font-semibold p-4 rounded-xl border border-secondary/30 text-center">
                  {roomError}
                </div>
              ) : !(roomData?.isUpdated || roomData?.updated) ? (
                <div className="bg-elevated border border-borderColor rounded-xl p-5 text-center text-primary">
                  <Clock className="mx-auto mb-2 text-primary animate-pulse" size={28} />
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Room ID & Password Not Set Yet</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    The Admin has not set the Free Fire Room ID and Password for this tournament yet. Please check back closer to the match start time!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-elevated border border-borderColor rounded-xl p-4">
                    <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">Free Fire Room ID</label>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl font-mono font-extrabold text-white tracking-widest">{roomData.roomId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomData.roomId);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy ID</>}
                      </button>
                    </div>
                  </div>

                  <div className="bg-elevated border border-borderColor rounded-xl p-4">
                    <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">Room Password</label>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl font-mono font-extrabold text-primary tracking-widest">{roomData.roomPassword}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomData.roomPassword);
                          setCopiedPwd(true);
                          setTimeout(() => setCopiedPwd(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-all flex items-center gap-1 cursor-pointer shadow-fire-sm"
                      >
                        {copiedPwd ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy Password</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Team Members Modal */}
        <TeamMembersModal
          isOpen={isTeamMembersModalOpen}
          onClose={() => setIsTeamMembersModalOpen(false)}
          teamId={teamMembersModalData?.id}
          teamName={teamMembersModalData?.name}
        />
      </div>
    </div>
  );
};

export default MatchHistory;
