import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Trophy, Users, Map, Swords } from 'lucide-react';
import { useState, useEffect } from 'react';
import fullmapBg from '../assets/fullmap.webp';
import clashsquadBg from '../assets/clashsquad.jpg';
import { getAllTournaments } from '../services/tournamentService';
import TournamentCard from '../components/TournamentCard';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchTournaments();
    }
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await getAllTournaments();
      setTournaments(data);
    } catch (err) {
      console.error("Failed to fetch tournaments", err);
    }
  };

  const upcomingTournaments = tournaments.filter(t => !t.matchTiming || new Date(t.matchTiming) >= new Date());
  const fullMapTournaments = upcomingTournaments.filter(t => t.gameMode.includes('Full Map') || t.gameMode === 'SQUAD' || t.gameMode === 'DUO' || t.gameMode === 'SOLO').slice(0, 3);
  const clashSquadTournaments = upcomingTournaments.filter(t => t.gameMode === 'Clash Squad' || t.gameMode === 'CLASH_SQUAD').slice(0, 3);

  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-12 text-center"
        >
          <h1 className="text-4xl font-bold font-display text-white mb-3">Select Tournament Mode</h1>
          <p className="text-textSecondary text-base">Choose your battleground and team size to compete</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Full Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-5 sm:p-8 border border-primary/20 bg-surface/50 relative overflow-hidden group flex flex-col"
          >
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-500">
              <img src={fullmapBg} alt="Full Map Background" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 z-0"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Map className="text-primary" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white">Full Map Tournament</h2>
            </div>
            <p className="text-textSecondary text-sm mb-8 relative z-10">Survival of the fittest. Drop in, loot up, and be the last one standing on the massive battleground.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto relative z-10">
              <Link to="/tournaments?mode=full-map-solo" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-surfaceHighlight hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group">
                <div className="h-10 flex items-center">
                  <Users size={20} className="text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-semibold">Solo</span>
                <span className="text-[10px] uppercase tracking-wider text-textSecondary mt-1 font-semibold">1v49</span>
              </Link>

              <Link to="/tournaments?mode=full-map-duo" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-surfaceHighlight hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group">
                <div className="h-10 flex items-center gap-1">
                  <Users size={20} className="text-textSecondary group-hover:text-primary transition-colors" />
                  <Users size={20} className="text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-semibold">Duo</span>
                <span className="text-[10px] uppercase tracking-wider text-textSecondary mt-1 font-semibold">2 Players</span>
              </Link>

              <Link to="/tournaments?mode=full-map-squad" className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl bg-surfaceHighlight hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group">
                <div className="h-10 flex items-center gap-1">
                  <Users size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-semibold">Squad</span>
                <span className="text-[10px] uppercase tracking-wider text-textSecondary mt-1 font-semibold">4 Players</span>
              </Link>
            </div>
          </motion.div>

          {/* Clash Squad Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-5 sm:p-8 border border-accent/20 bg-surface/50 relative overflow-hidden group flex flex-col"
          >
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-500">
              <img src={clashsquadBg} alt="Clash Squad Background" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -mr-10 -mt-10 z-0"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Swords className="text-accent" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-white">Clash Squad Tournament</h2>
            </div>
            <p className="text-textSecondary text-sm mb-8 relative z-10">Intense 4v4 tactical battles. Purchase weapons, coordinate with your team, and win 4 rounds to claim victory.</p>

            <Link to="/tournaments?mode=clash-squad" className="w-full flex items-center justify-between p-4 sm:p-6 rounded-xl bg-surfaceHighlight hover:bg-accent/20 border border-white/5 hover:border-accent/50 transition-all group flex-grow mt-auto relative z-10 min-h-[90px] sm:min-h-[136px]">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="grid grid-cols-2 gap-1 p-2 bg-background/50 rounded-lg">
                  <Users size={16} className="text-textSecondary group-hover:text-accent transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-accent transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-accent transition-colors" />
                  <Users size={16} className="text-textSecondary group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <span className="block text-white font-semibold text-base sm:text-lg">Squad Battle</span>
                  <span className="text-xs text-textSecondary mt-1">4v4 Combat</span>
                </div>
              </div>
              <ChevronRight className="text-textSecondary group-hover:text-accent transition-colors" size={24} />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Tournament Lists */}
        {tournaments.length > 0 && (
          <div className="w-full mt-16 space-y-16">
            {/* Full Map Tournaments */}
            {fullMapTournaments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2"><Map className="text-primary" /> Latest Full Map Tournaments</h2>
                  <Link to="/tournaments" className="text-sm font-semibold text-primary hover:text-white transition-colors flex items-center gap-1">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fullMapTournaments.map(t => (
                    <TournamentCard key={t.id} tournament={t} onClick={() => navigate('/tournaments')} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Clash Squad Tournaments */}
            {clashSquadTournaments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2"><Swords className="text-accent" /> Latest Clash Squad Tournaments</h2>
                  <Link to="/tournaments?mode=clash-squad" className="text-sm font-semibold text-accent hover:text-white transition-colors flex items-center gap-1">View All <ChevronRight size={16} /></Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clashSquadTournaments.map(t => (
                    <TournamentCard key={t.id} tournament={t} onClick={() => navigate('/tournaments')} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-white/10 text-xs font-medium text-textSecondary mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            Season 1 is now live
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold font-display tracking-tight text-white mb-6 leading-tight">
            The Competitive Platform for <span className="text-primary">Champions</span>
          </h1>
          <p className="text-lg md:text-xl text-textSecondary mb-10">
            Build your legacy. Compete in daily tournaments, manage your team, and climb the global leaderboards in the most advanced esports ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm">
              Get Started for Free <ChevronRight size={16} />
            </Link>
            <Link to="/tournaments" className="bg-surface hover:bg-surfaceHighlight border border-white/10 text-white font-semibold px-8 py-3.5 rounded-md transition-colors text-sm flex items-center justify-center">
              View Tournaments
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8">
            <Trophy className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Automated Tournaments</h3>
            <p className="text-textSecondary text-sm leading-relaxed">Instant bracket generation, automatic score reporting, and instant prize distribution to your digital wallet.</p>
          </div>
          <div className="glass-panel p-8">
            <Users className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Team Management</h3>
            <p className="text-textSecondary text-sm leading-relaxed">Advanced role-based access control, roster management, and historical team statistics all in one place.</p>
          </div>
          <div className="glass-panel p-8">
            <Shield className="text-primary mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Fair Play Security</h3>
            <p className="text-textSecondary text-sm leading-relaxed">Built-in anti-cheat integrations and comprehensive dispute resolution systems to ensure competitive integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
