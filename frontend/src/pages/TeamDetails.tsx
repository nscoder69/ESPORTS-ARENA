import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Gamepad2, UserMinus, Crown, Trash2, Copy, Check, Key, Hash } from 'lucide-react';
import { getMyTeams, getTeamMembers, removeTeamMember, deleteTeam } from '../services/teamService';
import { getImageUrl } from '../services/api';
import logo from '../assets/obitoloo.png';

export default function TeamDetails() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      window.location.href = '/create-team';
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
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
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
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-background px-4">
        <div className="bg-card border border-borderColor rounded-2xl shadow-card-dark p-8 text-center max-w-md w-full">
          <p className="text-secondary font-semibold mb-6">{error}</p>
          <Link to="/create-team" className="btn-primary inline-block">Back to Teams</Link>
        </div>
      </div>
    );
  }

  const isCaptain = currentUser.id 
    ? currentUser.id === team.captainId 
    : currentUser.freeFireUid === team.captainFreeFireUid;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 bg-background">
      <Link to="/create-team" className="inline-flex items-center gap-2 text-textSecondary hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-wider">
        <ArrowLeft size={16} /> Back to My Teams
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-borderColor rounded-2xl shadow-card-dark p-6 sm:p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          <div className="w-24 h-24 rounded-2xl bg-elevated flex items-center justify-center border border-borderColor text-primary shadow-fire-sm flex-shrink-0">
            {team.logoUrl ? (
              <img src={getImageUrl(team.logoUrl)} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Shield size={44} />
            )}
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mb-2">{team.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm mb-4">
              <span className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                members.length >= 4 ? 'bg-secondary/20 text-secondary border-secondary/40 shadow-red-sm' : 'bg-primary/20 text-primary border-primary/40 shadow-fire-sm'
              }`}>
                {members.length}/4 Members (Max 4 Players)
              </span>
            </div>

            {/* Team Shareable Credentials Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-left">
              {/* Invite Code */}
              <div className="bg-elevated border border-borderColor p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <Key size={12} /> Team Invite Code (Share)
                  </span>
                  <span className="text-white font-mono text-base font-extrabold tracking-widest block mt-0.5">
                    {team.inviteCode || 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(team.inviteCode);
                    setCopiedField('inviteCode');
                    setTimeout(() => setCopiedField(null), 2000);
                  }}
                  className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-fire-sm"
                  title="Copy Invite Code"
                >
                  {copiedField === 'inviteCode' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedField === 'inviteCode' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Team ID */}
              <div className="bg-elevated border border-borderColor p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-textSecondary uppercase tracking-wider">
                    <Hash size={12} className="text-primary" /> Team ID
                  </span>
                  <span className="text-white font-mono text-xs font-bold block mt-1 truncate max-w-[150px]">
                    {team.id}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(team.id);
                    setCopiedField('teamId');
                    setTimeout(() => setCopiedField(null), 2000);
                  }}
                  className="px-3 py-1.5 bg-inputBg hover:bg-card border border-borderColor text-textSecondary hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy Team ID"
                >
                  {copiedField === 'teamId' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedField === 'teamId' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold font-display text-white">Team Roster</h2>
        {!isCaptain ? (
          <button 
            onClick={handleLeaveTeam}
            className="text-xs font-bold px-4 py-2 border border-secondary/40 text-secondary hover:bg-secondary/15 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-red-sm"
          >
            <UserMinus size={14} /> Leave Team
          </button>
        ) : (
          <button 
            onClick={handleDeleteTeam}
            className="text-xs font-bold px-4 py-2 border border-secondary/40 text-secondary hover:bg-secondary/15 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-red-sm"
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
            className="bg-card border border-borderColor p-4 rounded-xl flex items-center justify-between group hover:border-primary/40 transition-all shadow-card-dark"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-elevated border border-borderColor flex items-center justify-center flex-shrink-0">
                {member.avatarUrl ? (
                  <img src={getImageUrl(member.avatarUrl)} alt={member.gameName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {member.gameName ? member.gameName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                  {member.gameName || 'Unknown Player'} 
                  {member.memberRole === 'Captain' && <Crown size={15} className="text-gold" />}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-textSecondary mt-0.5">
                  <Gamepad2 size={12} className="text-primary" /> UID: {member.freeFireUid || 'No UID'}
                </div>
              </div>
            </div>

            {isCaptain && member.userId !== currentUser.id && (
              <button 
                onClick={() => handleRemoveMember(member.userId)}
                className="p-2 text-secondary opacity-0 group-hover:opacity-100 hover:bg-secondary/10 rounded-lg transition-all cursor-pointer"
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
