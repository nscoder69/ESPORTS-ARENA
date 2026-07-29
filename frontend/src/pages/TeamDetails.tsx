import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Gamepad2, UserMinus, Crown, Trash2 } from 'lucide-react';
import { getMyTeams, getTeamMembers, removeTeamMember, deleteTeam } from '../services/teamService';
import logo from '../assets/obitoloo.png';

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We get the team info from the "My Teams" list API for now
        // In a complete app, we'd have a specific GET /teams/:id API.
        const allMyTeams = await getMyTeams();
        const currentTeam = allMyTeams.find((t: any) => t.id === id);
        
        if (!currentTeam) {
          setError('Team not found or you do not have access.');
          setLoading(false);
          return;
        }
        
        setTeam(currentTeam);
        const teamMembers = await getTeamMembers(id!);
        setMembers(teamMembers);
      } catch {
        setError('Failed to load team details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeTeamMember(id!, userId);
      setMembers(members.filter(m => m.userId !== userId));
    } catch {
      alert('Failed to remove member. Only the captain can do this.');
    }
  };

  const handleLeaveTeam = async () => {
    if (!currentUser.id) {
      alert("Your session is outdated. Please log out and log back in to leave the team.");
      return;
    }
    if (!confirm('Are you sure you want to leave this team?')) return;
    try {
      await removeTeamMember(id!, currentUser.id);
      window.location.href = '/create-team'; // redirect to teams list
    } catch {
      alert('Failed to leave team.');
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm('WARNING: Are you sure you want to completely delete this team? This action cannot be undone and will remove all members.')) return;
    try {
      await deleteTeam(id!);
      window.location.href = '/create-team';
    } catch {
      alert('Failed to delete team.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <motion.img 
          src={logo}
          alt="Loading..."
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-16 h-16 object-contain"
        />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <p className="text-secondary mb-6">{error}</p>
          <Link to="/create-team" className="btn-primary inline-block">Back to Teams</Link>
        </div>
      </div>
    );
  }

  const isCaptain = currentUser.id 
    ? currentUser.id === team.captainId 
    : currentUser.freeFireUid === team.captainFreeFireUid;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/create-team" className="inline-flex items-center gap-2 text-textSecondary hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Back to My Teams
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-surfaceHighlight flex items-center justify-center border border-primary/20 text-primary">
            {team.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Shield size={48} />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-white mb-2">{team.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px]">
                {members.length}/4 Members
              </span>
              <span className="text-textSecondary">Team ID: <span className="font-mono text-white">{team.id.substring(0, 8)}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Team Roster</h2>
        {!isCaptain ? (
          <button 
            onClick={handleLeaveTeam}
            className="text-sm px-4 py-1.5 border border-secondary/50 text-secondary hover:bg-secondary/10 rounded-lg transition-all flex items-center gap-2"
          >
            <UserMinus size={14} /> Leave Team
          </button>
        ) : (
          <button 
            onClick={handleDeleteTeam}
            className="text-sm px-4 py-1.5 border border-rose-500/50 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete Team
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member, index) => (
          <motion.div 
            key={member.userId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-surface/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-background border border-white/10 flex items-center justify-center">
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt={member.gameName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-white font-bold text-lg">
                    {member.gameName ? member.gameName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-white font-bold flex items-center gap-2">
                  {member.gameName || 'Unknown Player'} 
                  {member.memberRole === 'Captain' && <Crown size={14} className="text-yellow-500" />}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-textSecondary mt-1">
                  <Gamepad2 size={12} /> {member.freeFireUid || 'No UID'}
                </div>
              </div>
            </div>

            {isCaptain && member.userId !== currentUser.id && (
              <button 
                onClick={() => handleRemoveMember(member.userId)}
                className="p-2 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary/10 rounded-lg transition-all"
                title="Remove Member"
              >
                <UserMinus size={18} />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
