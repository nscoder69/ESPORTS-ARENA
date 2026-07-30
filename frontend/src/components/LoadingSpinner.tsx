import { motion } from 'framer-motion';
import logo from '../assets/obitoloo.png';

interface LoadingSpinnerProps {
  size?: number | string;
  className?: string;
}

export default function LoadingSpinner({ size = 20, className = '' }: LoadingSpinnerProps) {
  const numericSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <motion.img
      src={logo}
      alt="Loading..."
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
      style={{ width: numericSize, height: numericSize }}
      className={`object-contain inline-block ${className}`}
    />
  );
}
