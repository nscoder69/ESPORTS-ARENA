import { motion } from 'framer-motion';
import { Trophy, X, Users } from 'lucide-react';
import logo from '../assets/obitoloo.png';
import { getImageUrl } from '../services/api';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTournament: any;
  tournamentResults: any[];
  loading: boolean;
  error: string;
}

export default function ResultsModal({
  isOpen,
  onClose,
  selectedTournament,
  tournamentResults,
  loading,
  error
}: ResultsModalProps) {
  if (!isOpen || !selectedTournament) return null;

  const isKillOnly =
    (!selectedTournament.firstPrize || Number(selectedTournament.firstPrize) === 0) &&
    (!selectedTournament.secondPrize || Number(selectedTournament.secondPrize) === 0) &&
    (!selectedTournament.thirdPrize || Number(selectedTournament.thirdPrize) === 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold font-display text-white mb-1 flex items-center gap-2">
          <Trophy size={20} className="text-primary" /> Tournament Results
        </h3>
        <p className="text-textSecondary text-xs mb-6">
          Official scoreboard for <strong className="text-white">{selectedTournament.name}</strong>
        </p>

        {error && (
          <div className="bg-rose-500/10 text-rose-400 text-sm p-3 rounded-lg border border-rose-500/20 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.img
              src={logo}
              alt="Loading..."
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-10 h-10 object-contain mb-3"
            />
            <p className="text-textSecondary text-xs">Loading leaderboard...</p>
          </div>
        ) : tournamentResults.length === 0 ? (
          <div className="text-center py-8 text-textSecondary text-sm">
            No results have been published for this tournament yet.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Podium for top 3 */}
            {!isKillOnly && (
              <div className="grid grid-cols-3 gap-3 pt-4 pb-2 items-end text-center">
                {/* 2nd Place */}
                {tournamentResults.find(r => r.placement === 2) && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded bg-surfaceHighlight border border-[#C0C0C0]/30 overflow-hidden flex items-center justify-center relative">
                      {tournamentResults.find(r => r.placement === 2).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 2).teamLogoUrl)}
                          alt="2nd logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={18} className="text-textSecondary" />
                      )}
                    </div>
                    <div className="bg-[#C0C0C0]/10 border border-[#C0C0C0]/20 rounded px-2 py-0.5 mt-2 text-[10px] font-bold text-[#C0C0C0] uppercase">
                      2nd Place
                    </div>
                    <span className="text-xs font-bold text-white mt-1 truncate max-w-full">
                      {tournamentResults.find(r => r.placement === 2).teamName}
                    </span>
                  </div>
                )}

                {/* 1st Place */}
                {tournamentResults.find(r => r.placement === 1) && (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded bg-surfaceHighlight border border-[#FFD700]/30 overflow-hidden flex items-center justify-center relative scale-110 -translate-y-2">
                      {tournamentResults.find(r => r.placement === 1).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 1).teamLogoUrl)}
                          alt="1st logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Trophy size={24} className="text-[#FFD700]" />
                      )}
                    </div>
                    <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded px-2.5 py-0.5 mt-1 text-[10px] font-bold text-[#FFD700] uppercase scale-110 -translate-y-1">
                      Champion
                    </div>
                    <span className="text-sm font-bold text-white mt-1 truncate max-w-full scale-105">
                      {tournamentResults.find(r => r.placement === 1).teamName}
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {tournamentResults.find(r => r.placement === 3) && (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded bg-surfaceHighlight border border-[#CD7F32]/30 overflow-hidden flex items-center justify-center relative">
                      {tournamentResults.find(r => r.placement === 3).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 3).teamLogoUrl)}
                          alt="3rd logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users size={18} className="text-textSecondary" />
                      )}
                    </div>
                    <div className="bg-[#CD7F32]/10 border border-[#CD7F32]/20 rounded px-2 py-0.5 mt-2 text-[10px] font-bold text-[#CD7F32] uppercase">
                      3rd Place
                    </div>
                    <span className="text-xs font-bold text-white mt-1 truncate max-w-full">
                      {tournamentResults.find(r => r.placement === 3).teamName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Table details */}
            <div className="border-t border-white/10 pt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Team / Player</th>
                    <th className="py-2.5 px-3 text-center">Slot</th>
                    <th className="py-2.5 px-3 text-center">Kills</th>
                    <th className="py-2.5 px-3 text-right">Prize Won</th>
                  </tr>
                </thead>
                <tbody>
                  {tournamentResults.map((res, index) => {
                    let prize = 0;
                    if (res.placement === 1 && selectedTournament.firstPrize) prize += selectedTournament.firstPrize;
                    if (res.placement === 2 && selectedTournament.secondPrize) prize += selectedTournament.secondPrize;
                    if (res.placement === 3 && selectedTournament.thirdPrize) prize += selectedTournament.thirdPrize;
                    if (res.kills && selectedTournament.perKillPrize) prize += res.kills * selectedTournament.perKillPrize;

                    return (
                      <tr key={res.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-display font-bold text-sm text-textSecondary">
                          {res.placement ? (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                res.placement === 1
                                  ? 'text-[#FFD700]'
                                  : res.placement === 2
                                  ? 'text-[#C0C0C0]'
                                  : 'text-[#CD7F32]'
                              }`}
                            >
                              #{res.placement}
                            </span>
                          ) : (
                            <span className="pl-2">#{index + 1}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-surfaceHighlight border border-white/5 overflow-hidden flex-shrink-0">
                              {res.teamLogoUrl ? (
                                <img src={getImageUrl(res.teamLogoUrl)} alt="logo" className="w-full h-full object-cover" />
                              ) : (
                                <Users size={12} className="text-textSecondary m-auto mt-1" />
                              )}
                            </div>
                            <span className="font-bold text-white text-sm">{res.teamName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-sm text-textSecondary">
                          {res.slotNumber !== null && res.slotNumber !== undefined ? `Slot ${res.slotNumber}` : '-'}
                        </td>
                        <td className="py-3 px-3 text-center text-sm text-white">
                          {res.kills || 0}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-sm text-primary">
                          {prize > 0 ? `₹${prize.toFixed(2)}` : '₹0.00'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
