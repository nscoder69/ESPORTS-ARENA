import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MakeSuperAdminPage() {
  const navigate = useNavigate();
  const { email: pathEmail } = useParams<{ email?: string }>();
  const [searchParams] = useSearchParams();
  const paramEmail = searchParams.get('email');
  
  const targetEmail = pathEmail || paramEmail || '';

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmedLive, setIsConfirmedLive] = useState(false);

  useEffect(() => {
    if (!targetEmail) {
      setError('No target email address provided. Please include an email address in the URL (e.g. /make-super-admin?email=your-email@gmail.com).');
      setLoading(false);
      return;
    }

    const requestSuperAdmin = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await API.get(`/auth/make-super-admin?email=${encodeURIComponent(targetEmail.trim())}`);
        setMessage(typeof res.data === 'string' ? res.data : (res.data?.message || 'Super Admin creation request processed.'));
      } catch (err: any) {
        setError(err.response?.data?.message || err.response?.data || err.message || 'Failed to process Super Admin request.');
      } finally {
        setLoading(false);
      }
    };

    requestSuperAdmin();
  }, [targetEmail]);

  // Real-time status polling for live confirmation
  useEffect(() => {
    if (!targetEmail || isConfirmedLive) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/auth/super-admin-status?email=${encodeURIComponent(targetEmail.trim())}`);
        if (res.data && res.data.role === 'ROLE_SUPER_ADMIN') {
          setIsConfirmedLive(true);
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
          }
          localStorage.setItem('user', JSON.stringify(res.data));
          clearInterval(interval);
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1500);
        }
      } catch { }
    }, 2000);

    return () => clearInterval(interval);
  }, [targetEmail, isConfirmedLive, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-lg w-full p-8 text-center border border-amber-500/30 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600"></div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner size={48} text="Processing Super Admin Request..." />
            <p className="text-sm text-textSecondary">Connecting to authorization servers for {targetEmail}</p>
          </div>
        ) : error ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Request Couldn't Be Processed</h2>
            <p className="text-textSecondary text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-6 leading-relaxed max-w-full">
              {error}
            </p>
          </div>
        ) : isConfirmedLive ? (
          <div className="py-6 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-3">
              REAL-TIME AUTHORIZATION COMPLETE
            </span>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Super Admin Confirmed Live!</h2>
            <p className="text-textSecondary text-sm mb-6">
              Account <strong>{targetEmail}</strong> is now officially upgraded to Super Admin. Launching dashboard...
            </p>
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Mail size={32} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> LISTENING FOR CONFIRMATION LINK
            </span>
            <h2 className="text-2xl font-bold text-white mb-3 font-display">Confirmation Link Sent!</h2>
            <p className="text-textSecondary text-sm mb-6 leading-relaxed bg-surfaceHighlight/50 border border-white/10 rounded-xl p-4">
              {message}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-textSecondary">
              <ShieldCheck size={14} className="text-amber-400" />
              <span>Real-Time Security Listener Active</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
