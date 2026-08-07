import { motion } from 'framer-motion';
import logo from '../assets/obitoloo.png';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 48,
  text,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <motion.div
          className="absolute rounded-full border-2 border-primary/40 border-t-primary border-r-amber-400"
          style={{ width: size + 16, height: size + 16 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        />
        
        {/* Inner reverse rotating ring */}
        <motion.div
          className="absolute rounded-full border border-dashed border-cyan-400/50"
          style={{ width: size + 8, height: size + 8 }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        />

        {/* Center rotating Obito/Esports Logo */}
        <motion.img
          src={logo}
          alt="Loading..."
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ width: size, height: size }}
          className="object-contain relative z-10 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]"
        />
      </div>

      {text && (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="text-xs font-semibold tracking-wider text-textSecondary uppercase font-display mt-2"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[60vh] w-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
