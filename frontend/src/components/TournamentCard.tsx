import { motion } from 'framer-motion';
import { Trophy, Map, Clock, Users, ArrowRight, Trash2, CheckCircle } from 'lucide-react';
import fullmapBg from '../assets/fullmap.webp';
import clashsquadBg from '../assets/clashsquad.jpg';

interface TournamentCardProps {
  tournament: any;
  onRegisterClick?: (tournament: any) => void;
  onParticipantsClick?: (tournament: any) => void;
  onDeleteClick?: (tournament: any) => void;
  onResultClick?: (tournament: any) => void;
  onClick?: (tournament: any) => void;
  isUserRegistered?: boolean;
}

export default function TournamentCard({ tournament, onRegisterClick, onParticipantsClick, onDeleteClick, onResultClick, onClick, isUserRegistered }: TournamentCardProps) {
  const isRegistrationClosed = tournament.registrationClosingTime ? new Date(tournament.registrationClosingTime) < new Date() : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-panel overflow-hidden group cursor-pointer"
      onClick={() => onClick && onClick(tournament)}
    >
      <div className="h-32 bg-surfaceHighlight relative flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {tournament.gameMode.includes('Clash Squad') || tournament.gameMode === 'CLASH_SQUAD' ? (
            <img src={clashsquadBg} alt="Clash Squad" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          ) : (
            <img src={fullmapBg} alt="Full Map" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
          )}
        </div>

        {/* Status Badge */}
        <span className="absolute top-3 right-3 bg-accent/10 text-accent px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-accent/20 flex items-center gap-1.5 z-20">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
          {tournament.status}
        </span>

        {/* Delete Button (Admin Only) */}
        {onDeleteClick && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteClick(tournament); }}
            className="absolute top-3 left-3 bg-rose-500/20 text-rose-500 p-2 rounded-md hover:bg-rose-500 hover:text-white transition-colors z-20 border border-rose-500/30"
            title="Delete Tournament"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10"></div>

        <Trophy size={48} className="text-primary/30 group-hover:text-primary/80 transition-colors duration-300 relative z-20" />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 leading-tight">{tournament.name}</h3>
        <p className="text-textSecondary text-[11px] sm:text-xs mb-4 sm:mb-5 line-clamp-2 leading-relaxed">{tournament.description}</p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="bg-background rounded-md p-2 sm:p-3 border border-white/10">
            <span className="block text-[9px] sm:text-[10px] uppercase text-textSecondary font-semibold mb-1">Prize Pool</span>
            <span className="block text-white font-bold text-xs sm:text-sm">₹{tournament.prizePool}</span>
          </div>
          <div className="bg-background rounded-md p-2 sm:p-3 border border-white/10">
            <span className="block text-[9px] sm:text-[10px] uppercase text-textSecondary font-semibold mb-1">Entry Fee</span>
            <span className="block text-white font-bold text-xs sm:text-sm">{tournament.entryFee > 0 ? `₹${tournament.entryFee}` : 'FREE'}</span>
          </div>
        </div>

        {(tournament.firstPrize > 0 || tournament.secondPrize > 0 || tournament.thirdPrize > 0 || tournament.perKillPrize > 0) && (
          <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-6 justify-center">
            {tournament.firstPrize > 0 && <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-[#FFD700] flex items-center gap-0.5 sm:gap-1"><Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 1st: ₹{tournament.firstPrize}</div>}
            {tournament.secondPrize > 0 && <div className="bg-[#C0C0C0]/10 border border-[#C0C0C0]/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-[#C0C0C0] flex items-center gap-0.5 sm:gap-1"><Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 2nd: ₹{tournament.secondPrize}</div>}
            {tournament.thirdPrize > 0 && <div className="bg-[#CD7F32]/10 border border-[#CD7F32]/30 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-[#CD7F32] flex items-center gap-0.5 sm:gap-1"><Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> 3rd: ₹{tournament.thirdPrize}</div>}
            {tournament.perKillPrize > 0 && <div className="bg-white/10 border border-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-bold text-white">KILL: ₹{tournament.perKillPrize}</div>}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] sm:text-xs text-textSecondary mb-4 sm:mb-6">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Map className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{tournament.gameMap}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> <span>{tournament.gameMode}</span>
          </div>
        </div>

        {tournament.matchTiming && (
          <div className="mb-4 flex items-center justify-center gap-1.5 sm:gap-2 bg-primary/10 border border-primary/20 rounded-md py-1.5 sm:py-2 px-2 text-primary text-xs sm:text-sm font-semibold text-center">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="break-all sm:break-normal">{new Date(tournament.matchTiming).toLocaleString()}</span>
          </div>
        )}

        {tournament.registrationClosingTime && (
          <div className={`mb-4 sm:mb-6 text-center text-[11px] sm:text-xs font-medium ${isRegistrationClosed ? 'text-rose-400' : 'text-amber-400'}`}>
            {isRegistrationClosed ? 'Registration Closed' : `Registration closes: ${new Date(tournament.registrationClosingTime).toLocaleString()}`}
          </div>
        )}

        {(tournament.registeredCount !== undefined && tournament.maxCapacity !== undefined && tournament.maxCapacity !== 999) && (
          <div className="mb-4 sm:mb-5">
            <div className="flex justify-between items-end mb-1 sm:mb-1.5">
              <span className="text-[9px] sm:text-[10px] uppercase text-textSecondary font-semibold flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /> Progress
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white">
                {tournament.registeredCount} / {tournament.maxCapacity} {tournament.gameMode && tournament.gameMode.toLowerCase().includes('solo') ? 'Players' : 'Teams'}
              </span>
            </div>
            <div className="w-full bg-surfaceHighlight rounded-full h-1 sm:h-1.5 border border-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${tournament.registeredCount >= tournament.maxCapacity ? 'bg-rose-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, (tournament.registeredCount / tournament.maxCapacity) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {tournament.status === 'Finished' ? (
            <>
              {onParticipantsClick ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onParticipantsClick(tournament); }}
                  className="w-full bg-surfaceHighlight border border-white/5 hover:bg-surface text-textSecondary hover:text-white font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center"
                >
                  Participants
                </button>
              ) : null}
              {onResultClick ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onResultClick(tournament); }}
                  className="w-full bg-primary text-black hover:brightness-110 font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5"
                >
                  <span className="hidden xs:inline">View </span>Results <Trophy className="w-3 h-3 hidden xs:inline" />
                </button>
              ) : (
                !onParticipantsClick && (
                  <button
                    className="w-full col-span-2 bg-surfaceHighlight border border-white/5 hover:bg-surface text-white font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center gap-1"
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
                  className="w-full bg-surfaceHighlight border border-white/5 hover:bg-surface text-textSecondary hover:text-white font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center"
                >
                  Participants
                </button>
              )}
              {onRegisterClick ? (
                isUserRegistered ? (
                  <button
                    disabled
                    className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold py-2 sm:py-2.5 rounded-md text-[11px] sm:text-xs flex items-center justify-center gap-1 cursor-default"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Registered
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isRegistrationClosed) onRegisterClick(tournament);
                    }}
                    disabled={isRegistrationClosed}
                    className={`w-full font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center gap-1 ${isRegistrationClosed ? 'bg-surfaceHighlight text-textSecondary cursor-not-allowed' : 'bg-primary text-black hover:brightness-110'}`}
                  >
                    {isRegistrationClosed ? 'Closed' : 'Register'} {!isRegistrationClosed && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )
              ) : (
                !onParticipantsClick && (
                  <button
                    className="w-full col-span-2 bg-primary text-black hover:brightness-110 font-semibold py-2 sm:py-2.5 rounded-md transition-colors text-[11px] sm:text-xs flex items-center justify-center gap-1"
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
