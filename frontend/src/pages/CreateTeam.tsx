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
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-8 md:p-10 w-full max-w-lg my-auto flex-shrink-0"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold font-display text-white mb-2">Register Your Squad</h2>
          <p className="text-sm text-textSecondary">Create a team to participate in professional tournaments.</p>
        </div>
        
        <div className="glass-panel p-8 md:p-10">
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
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-center text-amber-400 mb-6">
                  <Gamepad2 className="mx-auto mb-2 text-amber-400 animate-pulse" size={24} />
                  <h4 className="text-sm font-bold uppercase tracking-wider">Gaming Identity Required</h4>
                  <p className="text-xs text-textSecondary mt-1 mb-4 leading-relaxed">
                    You must update your In-Game Name and Free Fire UID in your profile before you can join or create teams.
                  </p>
                  <Link 
                    to="/profile/edit" 
                    className="inline-block bg-amber-500 text-black hover:brightness-110 font-bold px-5 py-2 rounded-lg text-xs transition-all uppercase tracking-wider"
                  >
                    Configure Profile
                  </Link>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-4">Your Teams</h3>
              
              {myTeams.length > 0 ? (
                <div className="space-y-4">
                {myTeams.map((team: any) => (
                  <div key={team.id} className="flex flex-col gap-3 bg-background/50 border border-white/10 p-5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surfaceHighlight flex items-center justify-center border border-white/20 text-primary">
                          <Shield size={24} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">{team.name}</h4>
                          <p className="text-xs text-primary uppercase tracking-wider font-bold mt-1">Captain</p>
                        </div>
                      </div>
                      <Link to={`/teams/${team.id}`} className="p-2 text-textSecondary hover:text-primary transition-colors flex items-center gap-1 text-xs uppercase tracking-wider font-semibold">
                        Details <ArrowRight size={16} />
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-surfaceHighlight/50 p-3 rounded-lg border border-white/5 relative group">
                        <span className="flex items-center gap-1.5 text-[10px] text-textSecondary uppercase tracking-wider font-semibold mb-1">
                          <Hash size={12} /> Team ID
                        </span>
                        <span className="text-white font-mono text-sm block truncate pr-8">{team.id.substring(0, 8)}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(team.id); setCopiedId(team.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-textSecondary hover:text-white bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {copiedId === team.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 relative group">
                        <span className="flex items-center gap-1.5 text-[10px] text-primary uppercase tracking-wider font-semibold mb-1">
                          <Key size={12} /> Invite Code
                        </span>
                        <span className="text-white font-mono text-sm block tracking-widest">{team.inviteCode}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(team.inviteCode); setCopiedId(team.inviteCode); setTimeout(() => setCopiedId(null), 2000); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-textSecondary hover:text-white bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-all"
                        >
                          {copiedId === team.inviteCode ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="text-center text-textSecondary text-sm bg-surfaceHighlight/30 py-8 rounded-xl border border-white/5 border-dashed">
                  You are not part of any team yet.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <button 
                  onClick={() => {
                    if (!hasGameProfile) return;
                    setShowJoinForm(true);
                  }}
                  disabled={!hasGameProfile}
                  className="w-full py-3 border border-primary/40 bg-primary/10 rounded-xl text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn size={18} /> Join a Team
                </button>
                <button 
                  onClick={() => {
                    if (!hasGameProfile) return;
                    setShowCreateForm(true);
                  }}
                  disabled={!hasGameProfile}
                  className="w-full py-3 border border-dashed border-white/20 rounded-xl text-textSecondary hover:text-white hover:border-white/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} /> Create New Team
                </button>
              </div>
            </div>
          ) : showJoinForm ? (
            <>
              {error && (
                <div className="bg-secondary/10 border border-secondary/20 text-secondary text-sm p-3 rounded-md mb-6 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoinSubmit} className="space-y-6">
                <div>
                  <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Team Invite Code *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                      <Key size={16} />
                    </div>
                    <input 
                      type="text" 
                      className="input-field pl-10"
                      value={inviteCodeInput}
                      onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                      required
                      placeholder="e.g. A1B2C3"
                    />
                  </div>
                  <p className="text-[10px] text-textSecondary mt-2">Enter the 6-character code provided by the team captain.</p>
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
                  className="w-full text-center mt-4 text-sm text-textSecondary hover:text-white transition-colors"
                >
                  Cancel and back to My Teams
                </button>
              </form>
            </>
          ) : (
            <>
              {error && (
                <div className="bg-secondary/10 border border-secondary/20 text-secondary text-sm p-3 rounded-md mb-6 text-center">
                  {error}
                </div>
              )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Team Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Users size={16} />
                </div>
                <input 
                  type="text" 
                  className="input-field pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sentinels"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Captain Free Fire UID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                  <Gamepad2 size={16} />
                </div>
                <input 
                  type="text" 
                  className="input-field pl-10 bg-surfaceHighlight/50 border-white/5 text-textSecondary"
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
              className="w-full text-center mt-4 text-sm text-textSecondary hover:text-white transition-colors"
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
