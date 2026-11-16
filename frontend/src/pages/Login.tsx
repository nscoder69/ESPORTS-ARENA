import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';
import API, { isColdStartError, pingBackend } from '../services/api';
import { Lock, Mail, Eye, EyeOff, RefreshCw, Flame } from 'lucide-react';
import logo from '../assets/obitoloo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [wakingUpStatus, setWakingUpStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Proactively ping server when login page mounts to initiate cold-start wake up early
    API.get('/public/ping').catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setWakingUpStatus('');

    try {
      const data = await login({ email, password });
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        window.location.replace('/');
      } else {
        setError('Login failed. Please check credentials.');
      }
    } catch (err: any) {
      if (isColdStartError(err)) {
        setWakingUpStatus('Backend server is waking up on Render. Auto-retrying, please wait...');
        const isBackendUp = await pingBackend();
        if (isBackendUp) {
          setWakingUpStatus('Server is ready! Signing in...');
          try {
            const data = await login({ email, password });
            if (data && data.token) {
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data));
              window.location.replace('/');
              return;
            }
          } catch (retryErr: any) {
            setError(retryErr.response?.data?.message || retryErr.message || 'Invalid email or password');
          }
        } else {
          setError('Server request timed out. The backend service may be waking up from sleep. Please try again in a few seconds.');
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
      setWakingUpStatus('');
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 overflow-hidden bg-background">
      {/* Fiery ambient glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 bg-surface/95 border border-borderColor shadow-card-dark rounded-2xl p-8 sm:p-10 w-full max-w-md my-auto flex-shrink-0 backdrop-blur-xl"
      >
        {/* Esports Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-elevated border border-borderColor p-2.5 mb-4 shadow-fire-sm">
            <img src={logo} alt="Esports Arena Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,90,31,0.6)]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-bold tracking-widest uppercase mb-2">
            <Flame size={12} className="text-primary animate-pulse" /> Fire & Shadow Arena
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-textSecondary mt-1">Sign in to dominate the tournaments</p>
        </div>
        
        {wakingUpStatus && (
          <div className="bg-primary/10 border border-primary/30 text-primary-light text-sm p-3.5 rounded-xl mb-6 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
            <span className="font-medium text-xs leading-relaxed">{wakingUpStatus}</span>
          </div>
        )}

        {error && !wakingUpStatus && (
          <div className="bg-secondary/10 border border-secondary/30 text-secondary text-sm p-3.5 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                <Mail size={16} />
              </div>
              <input 
                id="login-email"
                type="email" 
                name="email"
                autoComplete="email"
                className="input-field pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="login-password" className="block text-textSecondary text-xs font-bold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                <Lock size={16} />
              </div>
              <input 
                id="login-password"
                type={showPassword ? "text" : "password"} 
                name="password"
                autoComplete="current-password"
                className="input-field pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-textSecondary hover:text-white transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                  alt="Signing in..."
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-5 h-5 object-contain"
                />
                <span>{wakingUpStatus ? 'Waking up server...' : 'Signing in...'}</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-textSecondary border-t border-borderColor pt-6">
          Don't have an account? <Link to="/signup" className="text-primary hover:text-primary-hover font-bold transition-colors ml-1">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
