import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/obitoloo.png';

const MatchHistory = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // In the future, fetch actual match history from backend
    // For now, simulate loading and empty state
    setTimeout(() => {
      setMatches([]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center">
            <History className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Match History</h2>
            <p className="text-sm text-textSecondary">Review your past performances and tournament results.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.img 
              src={logo}
              alt="Loading..."
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-12 h-12 object-contain mb-4"
            />
            <p className="text-textSecondary animate-pulse">Loading history...</p>
          </div>
        ) : matches.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-12 text-center"
          >
            <div className="w-20 h-20 bg-surfaceHighlight/50 border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-textSecondary/50" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Matches Played Yet</h3>
            <p className="text-textSecondary mb-6 max-w-md mx-auto">
              You haven't participated in any tournaments yet. Join a team and register for an upcoming tournament to start building your legacy!
            </p>
            <Link to="/tournaments" className="btn-primary inline-flex items-center gap-2">
              Browse Tournaments <ChevronRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Future implementation of match cards here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchHistory;
