import { motion } from 'framer-motion';
import { Trophy, X, Users, Crown, Medal } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-borderColor rounded-2xl shadow-card-dark max-w-2xl w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl sm:text-2xl font-extrabold font-display text-white mb-1 flex items-center gap-2">
          <Trophy size={22} className="text-gold" /> Tournament Leaderboard
        </h3>
        <p className="text-textSecondary text-xs mb-6">
          Official scoreboard for <strong className="text-white">{selectedTournament.name}</strong>
        </p>

        {error && (
          <div className="bg-secondary/15 text-secondary text-xs font-semibold p-3.5 rounded-xl border border-secondary/30 mb-4">
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
                    <div className="w-14 h-14 rounded-xl bg-elevated border-2 border-[#C0C0C0]/50 overflow-hidden flex items-center justify-center relative shadow-md">
                      {tournamentResults.find(r => r.placement === 2).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 2).teamLogoUrl)}
                          alt="2nd logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Medal size={22} className="text-[#C0C0C0]" />
                      )}
                    </div>
                    <div className="bg-[#C0C0C0]/15 border border-[#C0C0C0]/40 rounded-full px-2.5 py-0.5 mt-2 text-[10px] font-extrabold text-[#C0C0C0] uppercase">
                      2nd Place
                    </div>
                    <span className="text-xs font-bold text-white mt-1.5 truncate max-w-full">
                      {tournamentResults.find(r => r.placement === 2).teamName}
                    </span>
                  </div>
                )}

                {/* 1st Place */}
                {tournamentResults.find(r => r.placement === 1) && (
                  <div className="flex flex-col items-center">
                    <div className="w-18 h-18 rounded-2xl bg-elevated border-2 border-gold/70 overflow-hidden flex items-center justify-center relative shadow-gold-sm scale-110 -translate-y-2">
                      {tournamentResults.find(r => r.placement === 1).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 1).teamLogoUrl)}
                          alt="1st logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Crown size={28} className="text-gold" />
                      )}
                    </div>
                    <div className="bg-gold/20 border border-gold/50 rounded-full px-3 py-0.5 mt-1 text-[11px] font-extrabold text-gold uppercase shadow-gold-sm scale-110 -translate-y-1">
                      Champion 👑
                    </div>
                    <span className="text-sm font-extrabold text-white mt-1.5 truncate max-w-full scale-105 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">
                      {tournamentResults.find(r => r.placement === 1).teamName}
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {tournamentResults.find(r => r.placement === 3) && (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl bg-elevated border-2 border-[#CD7F32]/50 overflow-hidden flex items-center justify-center relative shadow-md">
                      {tournamentResults.find(r => r.placement === 3).teamLogoUrl ? (
                        <img
                          src={getImageUrl(tournamentResults.find(r => r.placement === 3).teamLogoUrl)}
                          alt="3rd logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Medal size={22} className="text-[#CD7F32]" />
                      )}
                    </div>
                    <div className="bg-[#CD7F32]/15 border border-[#CD7F32]/40 rounded-full px-2.5 py-0.5 mt-2 text-[10px] font-extrabold text-[#CD7F32] uppercase">
                      3rd Place
                    </div>
                    <span className="text-xs font-bold text-white mt-1.5 truncate max-w-full">
                      {tournamentResults.find(r => r.placement === 3).teamName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Table details */}
            <div className="border border-borderColor rounded-xl overflow-hidden shadow-card-dark">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-elevated border-b border-borderColor text-textSecondary text-xs uppercase font-bold tracking-wider">
                      <th className="py-3 px-3.5">Rank</th>
                      <th className="py-3 px-3.5">Team / Player</th>
                      <th className="py-3 px-3.5 text-center">Slot</th>
                      <th className="py-3 px-3.5 text-center">Kills</th>
                      <th className="py-3 px-3.5 text-right">Prize Won</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderColor/60 bg-inputBg">
                    {tournamentResults.map((res, index) => {
                      let prize = 0;
                      if (res.placement === 1 && selectedTournament.firstPrize) prize += selectedTournament.firstPrize;
                      if (res.placement === 2 && selectedTournament.secondPrize) prize += selectedTournament.secondPrize;
                      if (res.placement === 3 && selectedTournament.thirdPrize) prize += selectedTournament.thirdPrize;
                      if (res.kills && selectedTournament.perKillPrize) prize += res.kills * selectedTournament.perKillPrize;

                      const isFirst = res.placement === 1;
                      const isSecond = res.placement === 2;
                      const isThird = res.placement === 3;

                      return (
                        <tr key={res.id || index} className="hover:bg-elevated/60 transition-colors">
                          <td className="py-3 px-3.5 font-display font-bold text-sm">
                            {res.placement ? (
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-extrabold inline-block ${
                                  isFirst
                                    ? 'bg-gold/20 text-gold border border-gold/40 shadow-gold-sm'
                                    : isSecond
                                    ? 'bg-[#C0C0C0]/20 text-[#C0C0C0] border border-[#C0C0C0]/40'
                                    : isThird
                                    ? 'bg-[#CD7F32]/20 text-[#CD7F32] border border-[#CD7F32]/40'
                                    : 'bg-primary/15 text-primary border border-primary/30'
                                }`}
                              >
                                #{res.placement}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs font-bold text-primary bg-primary/10 border border-primary/20">
                                #{index + 1}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-elevated border border-borderColor overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {res.teamLogoUrl ? (
                                  <img src={getImageUrl(res.teamLogoUrl)} alt="logo" className="w-full h-full object-cover" />
                                ) : (
                                  <Users size={14} className="text-textSecondary" />
                                )}
                              </div>
                              <span className={`font-bold text-sm ${isFirst ? 'text-gold' : 'text-white'}`}>{res.teamName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-center text-xs text-textSecondary font-semibold">
                            {res.slotNumber !== null && res.slotNumber !== undefined ? `Slot ${res.slotNumber}` : '-'}
                          </td>
                          <td className="py-3 px-3.5 text-center text-xs font-bold text-white">
                            {res.kills || 0}
                          </td>
                          <td className="py-3 px-3.5 text-right font-extrabold text-sm text-gold">
                            {prize > 0 ? `₹${prize.toFixed(2)}` : '₹0.00'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
