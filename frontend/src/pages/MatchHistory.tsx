import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trophy, ChevronRight, Calendar, Map, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/obitoloo.png';
import { getMyRegisteredTournaments, getTournamentResults } from '../services/tournamentService';
import ResultsModal from '../components/ResultsModal';

const MatchHistory = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);

  // Results Modal state
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [tournamentResults, setTournamentResults] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState('');

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
      </div>
    </div>
  );
};

export default MatchHistory;
