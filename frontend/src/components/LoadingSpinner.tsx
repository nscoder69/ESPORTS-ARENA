import { motion } from 'framer-motion';
import logo from '../assets/obitoloo.png';

interface LoadingSpinnerProps {
  size?: number | string;
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  size = 48,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) {
  const numericSize = typeof size === 'number' ? `${size}px` : size;

  const spinner = (
    <motion.img
      src={logo}
      alt="Loading..."
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{ width: numericSize, height: numericSize }}
      className={`object-contain ${className}`}
    />
  );

  if (fullScreen) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-6">
      {spinner}
    </div>
  );
}
