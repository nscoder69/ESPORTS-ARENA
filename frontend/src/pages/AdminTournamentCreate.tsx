import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Map, Users, IndianRupee, ShieldAlert, ArrowLeft, Shield, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createTournament } from '../services/tournamentService';

const AdminTournamentCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    entryFee: '',
    prizePool: '',
    gameMap: 'BERMUDA',
    gameMode: 'Clash Squad',
    minLevel: '1',
    matchTiming: '',
    registrationClosingTime: '',
    perKillPrize: '',
    firstPrize: '',
    secondPrize: '',
    thirdPrize: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const payload = {
        ...formData,
        entryFee: parseFloat(formData.entryFee),
        prizePool: parseFloat(formData.prizePool),
        minLevel: parseInt(formData.minLevel) || 1,
        perKillPrize: formData.perKillPrize ? parseFloat(formData.perKillPrize) : undefined,
        firstPrize: formData.firstPrize ? parseFloat(formData.firstPrize) : undefined,
        secondPrize: formData.secondPrize ? parseFloat(formData.secondPrize) : undefined,
        thirdPrize: formData.thirdPrize ? parseFloat(formData.thirdPrize) : undefined,
        matchTiming: formData.matchTiming.length === 16 ? formData.matchTiming + ':00' : formData.matchTiming,
        registrationClosingTime: formData.registrationClosingTime.length === 16 ? formData.registrationClosingTime + ':00' : formData.registrationClosingTime
      };
      
      await createTournament(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/tournaments');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tournament. Ensure you have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-10 overflow-y-auto bg-background">
      <div className="w-full max-w-3xl flex justify-between items-center mb-6">
        <Link to="/admin/dashboard" className="text-textSecondary hover:text-white flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-1.5 bg-secondary/15 text-secondary px-3 py-1.5 rounded-full border border-secondary/30 text-xs font-bold tracking-wider uppercase shadow-red-sm">
          <ShieldAlert size={14} /> Admin Access Only
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-borderColor rounded-2xl p-6 sm:p-10 w-full max-w-3xl flex-shrink-0 shadow-card-dark"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-fire-sm">
            <Trophy className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-tight">Create Tournament</h2>
          <p className="text-sm text-textSecondary mt-1">Configure and publish competitive Free Fire events</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-secondary/15 border border-secondary/30 text-secondary text-sm p-4 rounded-xl mb-8 text-center font-medium">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm p-4 rounded-xl mb-8 text-center font-bold">
            Tournament created successfully! Redirecting...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-white font-display text-lg font-bold border-b border-borderColor pb-2.5 flex items-center gap-2">
              <Flame size={18} className="text-primary" /> Basic Details
            </h3>
            
            <div>
              <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Tournament Name *</label>
              <input 
                type="text" 
                name="name"
                className="input-field"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. Grand Bermuda Championship 2026"
              />
            </div>

            <div>
              <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Description *</label>
              <textarea 
                name="description"
                className="input-field min-h-[100px] resize-y py-3"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Details, rules, room credentials release schedule, and information..."
              />
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="text-white font-display text-lg font-bold border-b border-borderColor pb-2.5 flex items-center gap-2">
              <Map size={18} className="text-primary" /> Game Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Game Map *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                    <Map size={16} />
                  </div>
                  <select 
                    name="gameMap"
                    className="input-field pl-10 appearance-none bg-inputBg text-white"
                    value={formData.gameMap}
                    onChange={handleChange}
                    required
                  >
                    <option value="BERMUDA">Bermuda</option>
                    <option value="PURGATORY">Purgatory</option>
                    <option value="KALAHARI">Kalahari</option>
                    <option value="ALPINE">Alpine</option>
                    <option value="NEXTERRA">NeXTerra</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Game Mode *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                    <Users size={16} />
                  </div>
                  <select 
                    name="gameMode"
                    className="input-field pl-10 appearance-none bg-inputBg text-white"
                    value={formData.gameMode}
                    onChange={handleChange}
                    required
                  >
                    <optgroup label="Clash Squad" className="bg-card text-white">
                      <option value="Clash Squad">Clash Squad (4v4)</option>
                    </optgroup>
                    <optgroup label="Full Map (BR)" className="bg-card text-white">
                      <option value="Full Map - Squad">Full Map - Squad</option>
                      <option value="Full Map - Duo">Full Map - Duo</option>
                      <option value="Full Map - Solo">Full Map - Solo</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Minimum Level Required *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold">
                    <Shield size={16} />
                  </div>
                  <input 
                    type="number" 
                    name="minLevel"
                    min="1"
                    max="100"
                    className="input-field pl-10"
                    value={formData.minLevel}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 20"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="text-white font-display text-lg font-bold border-b border-borderColor pb-2.5 flex items-center gap-2">
              <IndianRupee size={18} className="text-gold" /> Financials & Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Entry Fee (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                    <IndianRupee size={16} />
                  </div>
                  <input 
                    type="number" 
                    name="entryFee"
                    min="0"
                    step="1"
                    className="input-field pl-10"
                    value={formData.entryFee}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Prize Pool (₹) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold">
                    <Trophy size={16} />
                  </div>
                  <input 
                    type="number" 
                    name="prizePool"
                    min="0"
                    step="1"
                    className="input-field pl-10"
                    value={formData.prizePool}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Match Timing *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="datetime-local" 
                    name="matchTiming"
                    className="input-field pl-10"
                    value={formData.matchTiming}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Reg. Closing Time *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-textSecondary">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="datetime-local" 
                    name="registrationClosingTime"
                    className="input-field pl-10"
                    value={formData.registrationClosingTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="text-white font-display text-lg font-bold border-b border-borderColor pb-2.5 flex items-center gap-2">
              <Trophy size={18} className="text-gold" /> Prize Breakdown (Optional)
            </h3>
            <p className="text-textSecondary text-xs">Specify rankings reward distribution for the tournament.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Per Kill</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary"><IndianRupee size={14} /></div>
                  <input type="number" name="perKillPrize" min="0" step="1" className="input-field pl-8" value={formData.perKillPrize} onChange={handleChange} placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">1st Prize</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gold"><Trophy size={14} /></div>
                  <input type="number" name="firstPrize" min="0" step="1" className="input-field pl-8" value={formData.firstPrize} onChange={handleChange} placeholder="e.g. 2500" />
                </div>
              </div>
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">2nd Prize</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#C0C0C0]"><Trophy size={14} /></div>
                  <input type="number" name="secondPrize" min="0" step="1" className="input-field pl-8" value={formData.secondPrize} onChange={handleChange} placeholder="e.g. 1500" />
                </div>
              </div>
              <div>
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">3rd Prize</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#CD7F32]"><Trophy size={14} /></div>
                  <input type="number" name="thirdPrize" min="0" step="1" className="input-field pl-8" value={formData.thirdPrize} onChange={handleChange} placeholder="e.g. 1000" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base font-bold shadow-fire-sm hover:shadow-fire-md"
            >
              {loading ? 'Publishing Tournament...' : 'Publish Tournament'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminTournamentCreate;
