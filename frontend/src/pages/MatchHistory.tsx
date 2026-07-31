import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trophy, ChevronRight, Calendar, Map, CheckCircle, Key, Copy, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/obitoloo.png';
import { getMyRegisteredTournaments, getTournamentResults, getRoomCredentials } from '../services/tournamentService';
import ResultsModal from '../components/ResultsModal';
import LoadingSpinner from '../components/LoadingSpinner';

const MatchHistory = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);

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
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
            <History className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Match History & Results</h2>
            <p className="text-sm text-textSecondary">Review your past performances, joined tournaments, and official scores.</p>
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
            <p className="text-textSecondary animate-pulse">Loading history...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 text-center"
          >
            <div className="w-20 h-20 bg-surfaceHighlight/50 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-textSecondary/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Match History Found</h3>
            <p className="text-textSecondary mb-6 max-w-md mx-auto">
              You haven't participated in any tournaments yet. Join a team and register for an upcoming tournament to start building your legacy!
            </p>
            <Link to="/tournaments" className="btn-primary inline-flex items-center gap-2">
              Browse Tournaments <ChevronRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Finished Tournaments Section */}
            {finishedTournaments.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <CheckCircle className="text-emerald-400" size={18} /> Finished Tournaments ({finishedTournaments.length})
                </h3>
                <div className="space-y-4">
                  {finishedTournaments.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-5 border border-white/10 hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            Finished
                          </span>
                          <span className="text-xs text-textSecondary flex items-center gap-1">
                            <Map size={12} /> {t.gameMode} ({t.gameMap})
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base">{t.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-textSecondary mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {t.matchTiming ? new Date(t.matchTiming).toLocaleDateString() : 'N/A'}
                          </span>
                          <span className="text-primary font-semibold">
                            Prize Pool: ₹{t.prizePool}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openResultsModal(t)}
                          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer"
                        >
                          <Trophy size={14} /> View Result
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
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <Trophy className="text-amber-400" size={18} /> Active & Upcoming Tournaments ({activeTournaments.length})
                </h3>
                <div className="space-y-4">
                  {activeTournaments.map(t => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-panel p-5 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {t.status || 'Upcoming'}
                          </span>
                          <span className="text-xs text-textSecondary flex items-center gap-1">
                            <Map size={12} /> {t.gameMode} ({t.gameMap})
                          </span>
                        </div>
                        <h4 className="text-white font-bold text-base">{t.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-textSecondary mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {t.matchTiming ? new Date(t.matchTiming).toLocaleString() : 'TBD'}
                          </span>
                          <span className="text-amber-400 font-semibold">
                            Entry: {t.entryFee > 0 ? `₹${t.entryFee}` : 'FREE'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openRoomModal(t)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Key size={14} /> Get ID & PWD
                        </button>
                        <Link
                          to="/tournaments?mode=registered"
                          className="bg-surfaceHighlight border border-white/10 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-md text-xs transition-colors flex items-center gap-1"
                        >
                          View Details <ChevronRight size={14} />
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
              className="glass-panel max-w-md w-full p-6 relative border border-emerald-500/20 shadow-2xl"
            >
              <button onClick={() => setIsRoomModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer">
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <Key size={24} className="text-emerald-400" />
                <h3 className="text-xl font-bold font-display text-white">Free Fire Room Details</h3>
              </div>
              <p className="text-textSecondary text-xs mb-6">Tournament: <strong className="text-white">{selectedTournament.name}</strong></p>

              {roomLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <LoadingSpinner size={28} className="mb-2" />
                  <p className="text-textSecondary text-sm animate-pulse">Fetching Room Credentials...</p>
                </div>
              ) : roomError ? (
                <div className="bg-rose-500/10 text-rose-400 text-sm p-4 rounded-xl border border-rose-500/20 text-center font-medium">
                  {roomError}
                </div>
              ) : !(roomData?.isUpdated || roomData?.updated) ? (
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
                      <span className="text-xl font-mono font-extrabold text-white tracking-widest">{roomData.roomId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomData.roomId);
                          setCopiedId(true);
                          setTimeout(() => setCopiedId(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId ? <><CheckCircle size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy ID</>}
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-1">Room Password</label>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl font-mono font-extrabold text-white tracking-widest">{roomData.roomPassword}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(roomData.roomPassword);
                          setCopiedPwd(true);
                          setTimeout(() => setCopiedPwd(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedPwd ? <><CheckCircle size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy Password</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
