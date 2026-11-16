import { motion } from 'framer-motion';
import { Trophy, Map, Clock, Users, ArrowRight, Trash2, Key, Shield, Flame } from 'lucide-react';
import fullmapBg from '../assets/fullmap.webp';
import clashsquadBg from '../assets/clashsquad.jpg';

interface TournamentCardProps {
  tournament: any;
  onRegisterClick?: (tournament: any) => void;
  onParticipantsClick?: (tournament: any) => void;
  onDeleteClick?: (tournament: any) => void;
  onResultClick?: (tournament: any) => void;
  onRoomCredentialsClick?: (tournament: any) => void;
  onTeamMembersClick?: (tournament: any) => void;
  onClick?: (tournament: any) => void;
  isUserRegistered?: boolean;
}

export default function TournamentCard({ tournament, onRegisterClick, onParticipantsClick, onDeleteClick, onResultClick, onRoomCredentialsClick, onTeamMembersClick, onClick, isUserRegistered }: TournamentCardProps) {
  const isRegistrationClosed = tournament.registrationClosingTime ? new Date(tournament.registrationClosingTime) < new Date() : false;
  const isLive = tournament.status?.toLowerCase().includes('live');
  const isFinished = tournament.status === 'Finished';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card border border-borderColor hover:border-primary/50 rounded-2xl shadow-card-dark overflow-hidden group cursor-pointer transition-all duration-300 flex flex-col"
      onClick={() => onClick && onClick(tournament)}
    >
      <div className="h-32 bg-elevated relative flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {tournament.gameMode.includes('Clash Squad') || tournament.gameMode === 'CLASH_SQUAD' ? (
            <img src={clashsquadBg} alt="Clash Squad" className="w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity duration-500" />
          ) : (
            <img src={fullmapBg} alt="Full Map" className="w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity duration-500" />
          )}
        </div>

        {/* Status Badge */}
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 z-20 ${
          isLive 
            ? 'bg-secondary/20 text-secondary border-secondary/40 shadow-red-sm'
            : isFinished
              ? 'bg-elevated/90 text-textSecondary border-borderColor'
              : 'bg-primary/20 text-primary border-primary/40 shadow-fire-sm'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            isLive ? 'bg-secondary animate-pulse' : isFinished ? 'bg-textSecondary' : 'bg-primary animate-pulse'
          }`}></span>
          {tournament.status}
        </span>

        {/* Delete Button (Admin Only) */}
        {onDeleteClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteClick(tournament); }}
            className="absolute top-3 left-3 bg-secondary/20 text-secondary p-2 rounded-lg hover:bg-secondary hover:text-white transition-colors z-20 border border-secondary/40 shadow-red-sm"
            title="Delete Tournament"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 to-transparent z-10"></div>

        <Trophy size={48} className="text-primary/25 group-hover:text-primary/70 transition-colors duration-300 relative z-20" />
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug group-hover:text-primary transition-colors">{tournament.name}</h3>
        <p className="text-textSecondary text-[11px] sm:text-xs mb-4 line-clamp-2 leading-relaxed">{tournament.description}</p>

        {/* Prize Pool and Entry Fee Cards */}
        <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-4">
          <div className="bg-inputBg rounded-xl p-2.5 sm:p-3 border border-borderColor">
            <span className="block text-[9px] sm:text-[10px] uppercase text-textSecondary font-bold tracking-wider mb-1">Prize Pool</span>
            <span className="block text-gold font-extrabold text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">₹{tournament.prizePool}</span>
          </div>
          <div className="bg-inputBg rounded-xl p-2.5 sm:p-3 border border-borderColor">
            <span className="block text-[9px] sm:text-[10px] uppercase text-textSecondary font-bold tracking-wider mb-1">Entry Fee</span>
            <span className={`block font-bold text-xs sm:text-sm ${tournament.entryFee > 0 ? 'text-primary' : 'text-emerald-400'}`}>
              {tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'FREE'}
            </span>
          </div>
        </div>

        {/* Prize Breakdown */}
        {(tournament.firstPrize > 0 || tournament.secondPrize > 0 || tournament.thirdPrize > 0 || tournament.perKillPrize > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
            {tournament.firstPrize > 0 && (
              <div className="bg-gold/15 border border-gold/40 px-2 py-0.5 rounded text-[10px] font-bold text-gold flex items-center gap-1 shadow-gold-sm">
                <Trophy className="w-2.5 h-2.5 text-gold" /> 1st: ₹{tournament.firstPrize}
              </div>
            )}
            {tournament.secondPrize > 0 && (
              <div className="bg-[#C0C0C0]/15 border border-[#C0C0C0]/40 px-2 py-0.5 rounded text-[10px] font-bold text-[#C0C0C0] flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5 text-[#C0C0C0]" /> 2nd: ₹{tournament.secondPrize}
              </div>
            )}
            {tournament.thirdPrize > 0 && (
              <div className="bg-[#CD7F32]/15 border border-[#CD7F32]/40 px-2 py-0.5 rounded text-[10px] font-bold text-[#CD7F32] flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5 text-[#CD7F32]" /> 3rd: ₹{tournament.thirdPrize}
              </div>
            )}
            {tournament.perKillPrize > 0 && (
              <div className="bg-primary/15 border border-primary/30 px-2 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-fire-sm">
                <Flame className="w-2.5 h-2.5 text-primary" /> KILL: ₹{tournament.perKillPrize}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] sm:text-xs text-textSecondary mb-4">
          <div className="flex items-center gap-1.5">
            <Map className="w-3.5 h-3.5 text-primary flex-shrink-0" /> <span>{tournament.gameMap}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" /> <span>{tournament.gameMode}</span>
          </div>
          <div className="flex items-center gap-1 text-gold font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
            <Shield className="w-3 h-3 flex-shrink-0 text-gold" /> <span>Lvl: {tournament.minLevel || 1}+</span>
          </div>
        </div>

        {tournament.matchTiming && (
          <div className="mb-3 flex items-center justify-center gap-1.5 bg-elevated border border-borderColor rounded-lg py-1.5 px-2 text-primary text-xs font-semibold text-center">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="break-all sm:break-normal">{new Date(tournament.matchTiming).toLocaleString()}</span>
          </div>
        )}

        {tournament.registrationClosingTime && (
          <div className={`mb-4 text-center text-[11px] font-medium ${isRegistrationClosed ? 'text-secondary font-bold' : 'text-primary/90'}`}>
            {isRegistrationClosed ? 'Registration Closed' : `Closes: ${new Date(tournament.registrationClosingTime).toLocaleString()}`}
          </div>
        )}

        {/* Capacity / Registration progress */}
        {(tournament.registeredCount !== undefined && tournament.maxCapacity !== undefined && tournament.maxCapacity !== 999) && (
          <div className="mb-4">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] uppercase text-textSecondary font-bold tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3 flex-shrink-0 text-primary" /> Progress
              </span>
              <span className="text-xs font-bold text-white">
                {tournament.registeredCount} / {tournament.maxCapacity} {tournament.gameMode && tournament.gameMode.toLowerCase().includes('solo') ? 'Players' : 'Teams'}
              </span>
            </div>
            <div className="w-full bg-inputBg rounded-full h-1.5 border border-borderColor overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${tournament.registeredCount >= tournament.maxCapacity ? 'bg-secondary' : 'bg-gradient-to-r from-primary to-[#FF733B]'}`}
                style={{ width: `${Math.min(100, (tournament.registeredCount / tournament.maxCapacity) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
          {tournament.status === 'Finished' ? (
            <>
              {onParticipantsClick ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onParticipantsClick(tournament); }}
                  className="w-full bg-elevated border border-borderColor hover:bg-surface text-textSecondary hover:text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center cursor-pointer"
                >
                  Participants
                </button>
              ) : null}
              {onResultClick ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onResultClick(tournament); }}
                  className="w-full bg-gold/20 hover:bg-gold/30 border border-gold/40 text-gold font-bold py-2 sm:py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 shadow-gold-sm cursor-pointer"
                >
                  <span>Results</span> <Trophy className="w-3 h-3" />
                </button>
              ) : (
                !onParticipantsClick && (
                  <button
                    className="w-full col-span-2 bg-gold/20 border border-gold/40 text-gold font-bold py-2 sm:py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center gap-1"
                  >
                    View Results <Trophy className="w-3 h-3" />
                  </button>
                )
              )}
            </>
          ) : (
            <>
              {onParticipantsClick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onParticipantsClick(tournament); }}
                  className="w-full bg-elevated border border-borderColor hover:bg-surface text-textSecondary hover:text-white font-semibold py-2 sm:py-2.5 rounded-lg transition-colors text-xs flex items-center justify-center cursor-pointer"
                >
                  Participants
                </button>
              )}
              {onRegisterClick ? (
                isUserRegistered ? (
                  <div className="w-full flex items-center gap-1.5 col-span-2">
                    {onTeamMembersClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTeamMembersClick(tournament);
                        }}
                        className="p-2 sm:p-2.5 bg-elevated hover:bg-surface border border-borderColor hover:border-primary/50 text-primary font-bold rounded-lg transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        title="View Team Members"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRoomCredentialsClick) onRoomCredentialsClick(tournament);
                      }}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold py-2 sm:py-2.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-sm"
                      title="Click to view Free Fire Room ID & Password"
                    >
                      <Key className="w-3.5 h-3.5" /> Get ID & PWD
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRegistrationClosed) onRegisterClick(tournament);
                    }}
                    disabled={isRegistrationClosed}
                    className={`w-full font-bold py-2 sm:py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      isRegistrationClosed 
                        ? 'bg-elevated text-textSecondary cursor-not-allowed border border-borderColor' 
                        : 'bg-gradient-to-r from-primary via-[#FF6A28] to-primary hover:brightness-110 text-white shadow-fire-sm hover:shadow-fire-md'
                    }`}
                  >
                    {isRegistrationClosed ? 'Closed' : 'Register'} {!isRegistrationClosed && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )
              ) : (
                !onParticipantsClick && (
                  <button
                    className={`w-full col-span-2 font-bold py-2 sm:py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-1 cursor-pointer ${
                      isRegistrationClosed
                        ? 'bg-elevated border border-borderColor text-textSecondary'
                        : 'bg-gradient-to-r from-primary via-[#FF6A28] to-primary hover:brightness-110 text-white shadow-fire-sm'
                    }`}
                  >
                    {isRegistrationClosed ? 'View Details' : 'Register Now'} {!isRegistrationClosed && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
