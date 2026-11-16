import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createTeam, getMyTeams, joinTeam } from '../services/teamService';
import { Users, Shield, Plus, ArrowRight, Hash, Key, Gamepad2, Copy, Check, LogIn } from 'lucide-react';
import logo from '../assets/obitoloo.png';

export default function CreateTeam() {
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const hasGameProfile = user && user.gameName && user.freeFireUid;
  const userFreeFireUid = user.freeFireUid || 'Not Set';

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams = await getMyTeams();
        setMyTeams(teams);
      } catch (err) {
        console.error("Failed to fetch user teams", err);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTeam({ name });
      const teams = await getMyTeams();
      setMyTeams(teams);
      setShowCreateForm(false);
      setName('');
    } catch {
      setError('Failed to create team. Ensure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoiningTeam(true);
    setError('');
    try {
      const response: any = await joinTeam(inviteCodeInput);
      if (response && response.success === false) {
        setError(response.message || 'Failed to join team.');
        setJoiningTeam(false);
        return;
      }
      const teams = await getMyTeams();
      setMyTeams(teams);
      setShowJoinForm(false);
      setInviteCodeInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join team. Invalid code or already a member.');
    } finally {
      setJoiningTeam(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-10 overflow-y-auto bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card border border-borderColor rounded-2xl shadow-card-dark p-6 sm:p-8 w-full max-w-lg my-auto flex-shrink-0"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-fire-sm">
            <Shield className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">Register Your Squad</h2>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">Create or join a team to compete in Free Fire tournaments.</p>
        </div>
        
        <div>
          {loadingTeams ? (
            <div className="flex justify-center py-10">
              <motion.img 
                src={logo}
                alt="Loading..."
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-12 h-12 object-contain"
              />
            </div>
          ) : (!showCreateForm && !showJoinForm) ? (
            <div className="space-y-6">
              {!hasGameProfile && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 text-center text-gold mb-6 shadow-gold-sm">
                  <Gamepad2 className="mx-auto mb-2 text-gold animate-pulse" size={24} />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Gaming Identity Required</h4>
                  <p className="text-xs text-textSecondary mt-1 mb-4 leading-relaxed">
                    You must update your In-Game Name and Free Fire UID in your profile before you can join or create teams.
                  </p>
                  <Link 
                    to="/profile/edit" 
                    className="inline-block bg-gradient-to-r from-primary to-[#FF733B] text-white hover:brightness-110 font-bold px-5 py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider shadow-fire-sm"
                  >
                    Configure Profile
                  </Link>
                </div>
              )}
              <h3 className="text-lg font-bold text-white mb-3">Your Teams</h3>
              
              {myTeams.length > 0 ? (
                <div className="space-y-3">
                {myTeams.map((team: any) => (
                  <div key={team.id} className="flex flex-col gap-3 bg-elevated border border-borderColor p-4 sm:p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-inputBg flex items-center justify-center border border-borderColor text-primary shadow-fire-sm">
                          <Shield size={22} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{team.name}</h4>
                          <p className="text-[10px] text-primary uppercase tracking-wider font-extrabold mt-0.5">Captain</p>
                        </div>
                      </div>
                      <Link to={`/teams/${team.id}`} className="p-2 text-textSecondary hover:text-primary transition-colors flex items-center gap-1 text-xs uppercase tracking-wider font-bold">
                        Details <ArrowRight size={15} />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2.5 mt-1">
                      <div className="bg-inputBg p-2.5 rounded-xl border border-borderColor relative group">
                        <span className="flex items-center gap-1 text-[9px] text-textSecondary uppercase tracking-wider font-bold mb-1">
                          <Hash size={11} className="text-primary" /> Team ID
                        </span>
                        <span className="text-white font-mono text-xs block truncate pr-7 font-bold">{team.id.substring(0, 8)}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(team.id); setCopiedId(team.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-textSecondary hover:text-white bg-card rounded transition-all cursor-pointer"
                          title="Copy Team ID"
                        >
                          {copiedId === team.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <div className="bg-inputBg p-2.5 rounded-xl border border-borderColor relative group">
                        <span className="flex items-center gap-1 text-[9px] text-gold uppercase tracking-wider font-bold mb-1">
                          <Key size={11} className="text-gold" /> Invite Code
                        </span>
                        <span className="text-white font-mono text-xs block tracking-widest font-extrabold">{team.inviteCode}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(team.inviteCode); setCopiedId(team.inviteCode); setTimeout(() => setCopiedId(null), 2000); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary hover:text-white bg-card rounded transition-all cursor-pointer"
                          title="Copy Invite Code"
                        >
                          {copiedId === team.inviteCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center text-textSecondary text-xs bg-elevated py-8 rounded-xl border border-borderColor border-dashed">
                  You are not part of any team yet.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <button 
                  onClick={() => {
                    if (!hasGameProfile) return;
                    setShowJoinForm(true);
                  }}
                  disabled={!hasGameProfile}
                  className="w-full py-3 border border-borderColor bg-elevated hover:bg-card hover:border-primary/50 rounded-xl text-white transition-all flex items-center justify-center gap-2 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <LogIn size={16} className="text-primary" /> Join a Team
                </button>
                <button 
                  onClick={() => {
                    if (!hasGameProfile) return;
                    setShowCreateForm(true);
                  }}
                  disabled={!hasGameProfile}
                  className="w-full py-3 bg-gradient-to-r from-primary via-[#FF6A28] to-primary hover:brightness-110 text-white rounded-xl shadow-fire-sm hover:shadow-fire-md transition-all flex items-center justify-center gap-2 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={16} /> Create New Team
                </button>
              </div>
            </div>
          ) : showJoinForm ? (
            <>
              {error && (
                <div className="bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold p-3 rounded-xl mb-6 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoinSubmit} className="space-y-5">
                <div>
                  <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Team Invite Code *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                      <Key size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="input-field pl-10 text-center font-mono font-bold tracking-widest text-base"
                      value={inviteCodeInput}
                      onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                      required
                      placeholder="e.g. A1B2C3"
                    />
                  </div>
                  <p className="text-[11px] text-textSecondary mt-2">Enter the 6-character code provided by the team captain.</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={joiningTeam || !inviteCodeInput}
                  className="btn-primary mt-4"
                >
                  {joiningTeam ? 'Joining Team...' : 'Join Team'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowJoinForm(false); setError(''); }}
                  className="w-full text-center mt-3 text-xs text-textSecondary hover:text-white transition-colors cursor-pointer"
                >
                  Cancel and back to My Teams
                </button>
              </form>
            </>
          ) : (
            <>
              {error && (
                <div className="bg-secondary/15 border border-secondary/30 text-secondary text-xs font-semibold p-3 rounded-xl mb-6 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Team Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                      <Users size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="input-field pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Fire Sentinels"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Captain Free Fire UID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
                      <Gamepad2 size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="input-field pl-10 bg-inputBg border-borderColor text-textSecondary cursor-not-allowed"
                      value={userFreeFireUid}
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="text-[10px] text-textSecondary mt-2">This team will be permanently linked to your Free Fire UID.</p>
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary mt-4"
                >
                  {isLoading ? 'Creating Team...' : 'Create Team'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowCreateForm(false); setError(''); }}
                  className="w-full text-center mt-3 text-xs text-textSecondary hover:text-white transition-colors cursor-pointer"
                >
                  Cancel and back to My Teams
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
