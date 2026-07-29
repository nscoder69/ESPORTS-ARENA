import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Gamepad2, Upload, Camera, Save, ArrowLeft, Loader } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [userData, setUserData] = useState<any>(null);
  const [gameName, setGameName] = useState('');
  const [freeFireUid, setFreeFireUid] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
      setGameName(user.gameName || '');
      setFreeFireUid(user.freeFireUid || '');
      if (user.avatarUrl) {
        setAvatarPreview(`http://localhost:8080${user.avatarUrl}`);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('gameName', gameName);
      formData.append('freeFireUid', freeFireUid);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      // We will create this endpoint in the backend shortly!
      const response = await API.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local storage
      const updatedUser = response.data;
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');

      // Force reload to update navbar, or we could dispatch an event
      setTimeout(() => {
        window.location.href = '/profile/edit';
      }, 1500);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <Link to="/" className="text-textSecondary hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-10 w-full max-w-2xl flex-shrink-0 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>

        <div className="relative z-10 flex flex-col items-center mb-10">
          <div className="relative mb-4 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full bg-surfaceHighlight border-4 border-background overflow-hidden flex items-center justify-center relative shadow-xl">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-textSecondary" />
              )}

              {/* Overlay for hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera size={24} className="mb-1" />
                <span className="text-[10px] font-bold tracking-wider uppercase">Change</span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center shadow-lg text-black">
              <Upload size={14} />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
          </div>

          <h2 className="text-2xl font-bold font-display text-white">{userData.email.split('@')[0]}</h2>
          <p className="text-sm text-textSecondary">{userData.email}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary/10 border border-secondary/20 text-secondary text-sm p-4 rounded-xl mb-8 text-center">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-4 rounded-xl mb-8 text-center font-medium">
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-4">
            <h3 className="text-white font-display text-xl border-b border-white/10 pb-2">Gaming Identity</h3>

            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">In-Game Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Your username in Free Fire"
                />
              </div>
            </div>

            <div>
              <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Free Fire UID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary">
                  <Gamepad2 size={16} />
                </div>
                <input
                  type="text"
                  className="input-field pl-10"
                  value={freeFireUid}
                  onChange={(e) => setFreeFireUid(e.target.value)}
                  placeholder="e.g. 1234567890"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-base mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader className="animate-spin" size={18} /> Updating Profile...</>
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;
