import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Crown, Gamepad2 } from 'lucide-react';
import { getTeamMembers } from '../services/teamService';
import { getImageUrl } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

interface TeamMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string | null;
  teamName?: string;
}

export default function TeamMembersModal({ isOpen, onClose, teamId, teamName }: TeamMembersModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && teamId) {
      const fetchMembers = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await getTeamMembers(teamId);
          setMembers(data || []);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load team members.');
        } finally {
          setLoading(false);
        }
      };
      fetchMembers();
    }
  }, [isOpen, teamId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-borderColor rounded-2xl shadow-card-dark max-w-md w-full p-6 sm:p-7 relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-fire-sm">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                {teamName ? teamName : 'Team Members'}
              </h3>
              <p className="text-xs text-textSecondary">Registered Team Roster</p>
            </div>
          </div>

          <div className="mt-4 mb-4 flex justify-between items-center bg-elevated p-2.5 rounded-xl border border-borderColor">
            <span className="text-xs text-textSecondary font-bold uppercase tracking-wider">
              Roster Status
            </span>
            <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-md text-xs font-bold border border-primary/40 shadow-fire-sm">
              {members.length}/4 Members Joined
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <LoadingSpinner size={28} className="mb-2" />
              <p className="text-textSecondary text-xs animate-pulse">Loading Team Members...</p>
            </div>
          ) : error ? (
            <div className="bg-secondary/15 text-secondary text-xs font-semibold p-4 rounded-xl border border-secondary/30 text-center">
              {error}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 text-textSecondary text-xs">
              No members found in this team yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="bg-elevated border border-borderColor p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-inputBg border border-borderColor flex items-center justify-center flex-shrink-0">
                      {member.avatarUrl ? (
                        <img src={getImageUrl(member.avatarUrl)} alt={member.gameName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {member.gameName ? member.gameName.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                        {member.gameName || 'Unknown Player'}
                        {member.memberRole === 'Captain' && (
                          <Crown size={14} className="text-gold flex-shrink-0" />
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-textSecondary mt-0.5">
                        <Gamepad2 size={11} className="text-primary flex-shrink-0" /> UID: {member.freeFireUid || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    member.memberRole === 'Captain' 
                      ? 'bg-gold/15 text-gold border border-gold/40 shadow-gold-sm' 
                      : 'bg-inputBg text-textSecondary border border-borderColor'
                  }`}>
                    {member.memberRole || 'Player'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
