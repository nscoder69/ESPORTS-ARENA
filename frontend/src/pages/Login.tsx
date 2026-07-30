import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/obitoloo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
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
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
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
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-sm text-textSecondary">Sign in to your account to continue</p>
        </div>
        
        {error && (
          <div className="bg-secondary/10 border border-secondary/20 text-secondary text-sm p-3 rounded-md mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
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
              <label htmlFor="login-password" className="block text-textSecondary text-xs font-semibold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-hover transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
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
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-textSecondary hover:text-white transition-colors"
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
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-textSecondary border-t border-white/10 pt-6">
          Don't have an account? <Link to="/signup" className="text-white hover:text-primary transition-colors font-medium ml-1">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
