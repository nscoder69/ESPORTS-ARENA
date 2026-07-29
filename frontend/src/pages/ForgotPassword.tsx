import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendForgotPasswordOtp, resetPassword } from '../services/authService';
import { Mail, Lock, Key, ArrowLeft, Check, X, Loader } from 'lucide-react';
import logo from '../assets/obitoloo.png';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation checks
  const hasMinLength = newPassword.length > 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await sendForgotPasswordOtp(email);
      setSuccess(`OTP code sent successfully to ${email}`);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Make sure the email is registered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    if (!isPasswordValid) {
      setError('Please ensure your password meets all complexity requirements.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await resetPassword({ email, otp, newPassword });
      setSuccess('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-12 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-8 md:p-10 w-full max-w-md my-auto flex-shrink-0"
      >
        <div className="flex items-center gap-2 mb-6">
          <Link to="/login" className="text-textSecondary hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-sm font-semibold text-textSecondary uppercase tracking-wider">Back to Login</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-sm text-textSecondary">
            {step === 1 
              ? 'Enter your registered email address to receive an OTP' 
              : 'Enter the verification code and set a secure new password'
            }
          </p>
        </div>
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-4 rounded-lg mb-6 text-center">
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Mail size={16} />
                </div>
                <input 
                  id="forgot-email"
                  type="email" 
                  name="email"
                  autoComplete="email"
                  className="input-field pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@gmail.com"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.img
                    src={logo}
                    alt="Loading..."
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-4 h-4 object-contain"
                  />
                  Sending OTP...
                </>
              ) : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="forgot-otp" className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Verification OTP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Key size={16} />
                </div>
                <input 
                  id="forgot-otp"
                  type="text" 
                  name="otp"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className="input-field pl-10 tracking-widest text-center text-lg font-bold"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="000000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="forgot-new-password" className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Lock size={16} />
                </div>
                <input 
                  id="forgot-new-password"
                  type="password" 
                  name="newPassword"
                  autoComplete="new-password"
                  className="input-field pl-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Password Validation List */}
            <div className="bg-surface/50 border border-white/5 rounded-lg p-4 space-y-2 text-xs">
              <span className="text-textSecondary font-semibold uppercase tracking-wider block mb-1">Password Requirements:</span>
              <div className="flex items-center gap-2">
                {hasMinLength ? (
                  <Check className="text-primary" size={14} />
                ) : (
                  <X className="text-rose-400" size={14} />
                )}
                <span className={hasMinLength ? 'text-white' : 'text-textSecondary'}>More than 8 characters</span>
              </div>
              <div className="flex items-center gap-2">
                {hasLetter ? (
                  <Check className="text-primary" size={14} />
                ) : (
                  <X className="text-rose-400" size={14} />
                )}
                <span className={hasLetter ? 'text-white' : 'text-textSecondary'}>At least one letter (a-z, A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? (
                  <Check className="text-primary" size={14} />
                ) : (
                  <X className="text-rose-400" size={14} />
                )}
                <span className={hasNumber ? 'text-white' : 'text-textSecondary'}>At least one number (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasSpecial ? (
                  <Check className="text-primary" size={14} />
                ) : (
                  <X className="text-rose-400" size={14} />
                )}
                <span className={hasSpecial ? 'text-white' : 'text-textSecondary'}>At least one special character (!@#$ etc.)</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !isPasswordValid}
              className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Resetting...
                </>
              ) : 'Reset Password'}
            </button>
            
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
                setSuccess('');
              }}
              className="w-full text-center text-xs text-textSecondary hover:text-white transition-colors cursor-pointer mt-2"
            >
              Request a new verification code
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
