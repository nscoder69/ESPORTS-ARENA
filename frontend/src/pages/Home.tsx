import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Trophy, Users, Map, Swords, Flame } from 'lucide-react';
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
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary mb-3 shadow-fire-sm">
            <Flame size={14} className="text-primary animate-pulse" />
            BATTLEGROUND SELECTION
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">Select Tournament Mode</h1>
          <p className="text-textSecondary text-sm sm:text-base mt-1">Choose your battleground and team size to dominate the arena</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 w-full items-stretch">
          {/* Full Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="h-full p-5 sm:p-7 border border-borderColor hover:border-primary/50 bg-card rounded-2xl relative overflow-hidden group flex flex-col justify-between shadow-card-dark transition-all duration-300"
          >
            <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity duration-500">
              <img src={fullmapBg} alt="Full Map Background" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-card via-card/85 to-card/40"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-12 -mt-12 z-0 pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-3.5 mb-3 relative z-10">
                <div className="p-3 bg-primary/20 border border-primary/40 rounded-xl shadow-fire-sm shrink-0">
                  <Map className="text-primary" size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Battle Royale</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Full Map Tournament</h2>
                </div>
              </div>
              <p className="text-textSecondary text-xs sm:text-sm mb-6 relative z-10 leading-relaxed min-h-[40px] sm:min-h-[44px]">
                Survival of the fittest. Drop in, loot up, and be the last one standing on the massive battleground.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 relative z-10 mt-auto">
              <Link to="/tournaments?mode=full-map-solo" className="h-[92px] sm:h-[104px] flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-elevated hover:bg-[#252532] border border-borderColor hover:border-primary/60 transition-all group shadow-sm text-center">
                <div className="h-7 sm:h-8 flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm mt-1">Solo</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary mt-0.5 font-bold whitespace-nowrap">1v49</span>
              </Link>

              <Link to="/tournaments?mode=full-map-duo" className="h-[92px] sm:h-[104px] flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-elevated hover:bg-[#252532] border border-borderColor hover:border-primary/60 transition-all group shadow-sm text-center">
                <div className="h-7 sm:h-8 flex items-center justify-center gap-0.5 sm:gap-1">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-textSecondary group-hover:text-primary transition-colors" />
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm mt-1">Duo</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary mt-0.5 font-bold whitespace-nowrap">2 Players</span>
              </Link>

              <Link to="/tournaments?mode=full-map-squad" className="h-[92px] sm:h-[104px] flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl bg-elevated hover:bg-[#252532] border border-borderColor hover:border-primary/60 transition-all group shadow-sm text-center">
                <div className="h-7 sm:h-8 flex items-center justify-center gap-0.5 sm:gap-1">
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-textSecondary group-hover:text-primary transition-colors" />
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-textSecondary group-hover:text-primary transition-colors" />
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-textSecondary group-hover:text-primary transition-colors" />
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-textSecondary group-hover:text-primary transition-colors" />
                </div>
                <span className="text-white font-bold text-xs sm:text-sm mt-1">Squad</span>
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary mt-0.5 font-bold whitespace-nowrap">4 Players</span>
              </Link>
            </div>
          </motion.div>

          {/* Clash Squad Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="h-full p-5 sm:p-7 border border-borderColor hover:border-secondary/50 bg-card rounded-2xl relative overflow-hidden group flex flex-col justify-between shadow-card-dark transition-all duration-300"
          >
            <div className="absolute inset-0 z-0 opacity-25 group-hover:opacity-35 transition-opacity duration-500">
              <img src={clashsquadBg} alt="Clash Squad Background" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-card via-card/85 to-card/40"></div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl -mr-12 -mt-12 z-0 pointer-events-none"></div>

            <div>
              <div className="flex items-center gap-3.5 mb-3 relative z-10">
                <div className="p-3 bg-secondary/20 border border-secondary/40 rounded-xl shadow-red-sm shrink-0">
                  <Swords className="text-secondary" size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Tactical Combat</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Clash Squad Tournament</h2>
                </div>
              </div>
              <p className="text-textSecondary text-xs sm:text-sm mb-6 relative z-10 leading-relaxed min-h-[40px] sm:min-h-[44px]">
                Intense 4v4 tactical battles. Purchase weapons, coordinate with your team, and win 4 rounds to claim victory.
              </p>
            </div>

            <Link
              to="/tournaments?mode=clash-squad"
              className="h-[92px] sm:h-[104px] w-full flex items-center justify-between p-4 sm:p-5 rounded-xl bg-elevated hover:bg-[#252532] border border-borderColor hover:border-secondary/60 transition-all group relative z-10 shadow-sm mt-auto"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="grid grid-cols-2 gap-1 p-2 bg-inputBg border border-borderColor rounded-lg shrink-0">
                  <Users size={15} className="text-textSecondary group-hover:text-secondary transition-colors" />
                  <Users size={15} className="text-textSecondary group-hover:text-secondary transition-colors" />
                  <Users size={15} className="text-textSecondary group-hover:text-secondary transition-colors" />
                  <Users size={15} className="text-textSecondary group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <span className="block text-white font-bold text-sm sm:text-base group-hover:text-secondary transition-colors">Squad Battle</span>
                  <span className="text-[10px] sm:text-xs text-secondary font-semibold mt-0.5 block">4v4 Combat Arena</span>
                </div>
              </div>
              <ChevronRight className="text-textSecondary group-hover:text-secondary group-hover:translate-x-1 transition-all shrink-0" size={22} />
            </Link>
          </motion.div>
        </div>

        {/* Dynamic Tournament Lists */}
        {tournaments.length > 0 && (
          <div className="w-full mt-14 space-y-12">
            {/* Full Map Tournaments */}
            {fullMapTournaments.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center justify-between mb-6 border-b border-borderColor pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2.5">
                    <Map className="text-primary" size={22} /> Latest Full Map Tournaments
                  </h2>
                  <Link to="/tournaments" className="text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors flex items-center gap-1 group">
                    View All <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
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
                <div className="flex items-center justify-between mb-6 border-b border-borderColor pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white flex items-center gap-2.5">
                    <Swords className="text-secondary" size={22} /> Latest Clash Squad Tournaments
                  </h2>
                  <Link to="/tournaments?mode=clash-squad" className="text-xs sm:text-sm font-bold text-secondary hover:text-secondary-hover transition-colors flex items-center gap-1 group">
                    View All <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
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
    <div className="relative flex flex-col items-center overflow-hidden bg-background">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-elevated border border-borderColor text-xs font-bold text-textSecondary mb-8 shadow-card-dark">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-red-sm animate-pulse"></span>
            <span className="text-white">Season 1</span> is now live & competing
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-display tracking-tight text-white mb-6 leading-tight">
            The Competitive Platform for <span className="bg-gradient-to-r from-primary via-[#FF733B] to-gold bg-clip-text text-transparent">Champions</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
            Build your legacy. Compete in daily Free Fire tournaments, manage your squad, and claim massive prize pools on the ultimate esports stage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup" className="w-full sm:w-auto bg-gradient-to-r from-primary via-[#FF6A28] to-primary hover:brightness-110 text-white font-bold px-8 py-3.5 rounded-xl shadow-fire-sm hover:shadow-fire-md transition-all flex items-center justify-center gap-2 text-sm">
              <Flame size={16} /> Get Started for Free <ChevronRight size={16} />
            </Link>
            <Link to="/tournaments" className="w-full sm:w-auto bg-elevated hover:bg-card border border-borderColor hover:border-primary/50 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              <Trophy size={16} className="text-gold" /> View Tournaments
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-borderColor rounded-2xl p-7 shadow-card-dark hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center mb-5 shadow-gold-sm">
              <Trophy className="text-gold" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold transition-colors">Instant Prize Distribution</h3>
            <p className="text-textSecondary text-xs sm:text-sm leading-relaxed">Automated prize distribution straight into your digital wallet immediately upon match completion and verification.</p>
          </div>
          <div className="bg-card border border-borderColor rounded-2xl p-7 shadow-card-dark hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-5 shadow-fire-sm">
              <Users className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">Team & Squad Management</h3>
            <p className="text-textSecondary text-xs sm:text-sm leading-relaxed">Create and manage your competitive roster, track team stats, invite squad members, and compete together seamlessly.</p>
          </div>
          <div className="bg-card border border-borderColor rounded-2xl p-7 shadow-card-dark hover:border-primary/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-5 shadow-red-sm">
              <Shield className="text-secondary" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-secondary transition-colors">Fair Play & Security</h3>
            <p className="text-textSecondary text-xs sm:text-sm leading-relaxed">Admin-verified player credentials, UID anti-smurf checks, and comprehensive dispute resolution ensure competitive integrity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
