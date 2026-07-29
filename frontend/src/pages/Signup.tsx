import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, sendOtp } from '../services/authService';
import { User, Mail, Lock, Gamepad2, Upload, X, Key, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/obitoloo.png';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    gameName: '',
    freeFireUid: '',
    otp: '',
    avatar: null as File | null
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'avatar' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      if (e.target.name === 'email') {
        setOtpSent(false);
        setOtpMessage('');
      }
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address first.');
      return;
    }
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Email address must end with @gmail.com');
      return;
    }
    
    setError('');
    setIsSendingOtp(true);
    setOtpMessage('');
    
    try {
      await sendOtp(formData.email);
      setOtpSent(true);
      setOtpMessage('Verification OTP sent successfully to your email!');
      setOtpCountdown(60);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Email might be in use.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const removeAvatar = () => {
    setFormData({ ...formData, avatar: null });
    setAvatarPreview(null);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Email address must end with @gmail.com');
      setIsLoading(false);
      return;
    }

    const password = formData.password;
    if (password.length <= 8) {
      setError('Password must be more than 8 characters');
      setIsLoading(false);
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setError('Password must contain at least one letter');
      setIsLoading(false);
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setError('Password must contain at least one special character');
      setIsLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Email might be in use.');
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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Create an Account</h2>
          <p className="text-sm text-textSecondary">Join the ultimate competitive platform</p>
        </div>
        
        {error && (
          <div className="bg-secondary/10 border border-secondary/20 text-secondary text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Email Address *</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <Mail size={16} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  className="input-field pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || otpCountdown > 0}
                className="px-4 py-2 bg-surfaceHighlight hover:bg-white/10 text-white rounded-md border border-white/10 transition-colors text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <motion.img
                      src={logo}
                      alt="Loading..."
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-4 h-4 object-contain"
                    />
                    Sending...
                  </>
                ) : otpCountdown > 0 ? (
                  `Resend (${otpCountdown}s)`
                ) : otpSent ? (
                  'Resend'
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
            {otpMessage && (
              <p className="text-emerald-400 text-xs mt-1">{otpMessage}</p>
            )}
          </div>

          {otpSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Verification OTP *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                  <Key size={16} />
                </div>
                <input 
                  type="text" 
                  name="otp"
                  maxLength={6}
                  className="input-field pl-10 tracking-widest font-mono font-bold text-white placeholder-textSecondary/40"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                  placeholder="------"
                />
              </div>
              <p className="text-[10px] text-textSecondary mt-1">Please enter the 6-digit OTP code.</p>
            </motion.div>
          )}
          
          <div>
            <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                className="input-field pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-textSecondary mb-4">Profile & Gaming Details</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Profile Picture</label>
                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary group">
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={removeAvatar}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center">
                      <User size={24} className="text-textSecondary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer bg-surfaceHighlight hover:bg-white/10 text-white text-sm px-4 py-2 rounded-md border border-white/10 transition-colors inline-flex items-center gap-2">
                      <Upload size={16} /> Choose Image
                      <input 
                        type="file" 
                        name="avatar" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleChange}
                      />
                    </label>
                    <p className="text-textSecondary text-xs mt-2">JPG, PNG (Max 2MB)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">In-Game Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                    <User size={16} />
                  </div>
                  <input 
                    type="text" 
                    name="gameName"
                    className="input-field pl-10"
                    value={formData.gameName}
                    onChange={handleChange}
                    placeholder="Player123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Free Fire UID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                    <Gamepad2 size={16} />
                  </div>
                  <input 
                    type="text" 
                    name="freeFireUid"
                    className="input-field pl-10"
                    value={formData.freeFireUid}
                    onChange={handleChange}
                    placeholder="e.g. 1234567890"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !otpSent}
            className="btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary border-t border-white/10 pt-6">
          Already have an account? <Link to="/login" className="text-white hover:text-primary transition-colors font-medium ml-1">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
