import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, ShieldAlert, Loader, Search, RefreshCw, X, Calendar, UserX, AlertCircle, Trash2, CheckCircle, IndianRupee, Clock, Wallet, User as UserIcon, QrCode, Edit3, MessageSquare, Shield, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllTournaments, getRegistrationsForTournament, cancelTournament, rescheduleTournament, removeTeamFromTournament, updateTournamentResults, deleteTournament, getUserRegisteredTournaments } from '../services/tournamentService';
import { getTeamMembers } from '../services/teamService';
import { getAllUsers, blockUser, unblockUser, deleteUser } from '../services/authService';
import { getAdminSupportTickets, replyToSupportTicket } from '../services/supportService';
import { getUserTransactionHistory, getUserWalletBalance, getPendingDeposits, verifyPendingDeposit, getPendingWithdrawals, verifyPendingWithdrawal, getPublicPaymentSettings, updatePaymentSettings, getAllAdmins, updateUserRoleAndPermissions } from '../services/walletService';
import logo from '../assets/obitoloo.png';
import qrImageDefault from '../assets/QR.jpeg';
import { getImageUrl } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<any | null>(null);

  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Modals state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newMatchTiming, setNewMatchTiming] = useState('');

  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Results State
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [firstPlaceTeamId, setFirstPlaceTeamId] = useState('');
  const [secondPlaceTeamId, setSecondPlaceTeamId] = useState('');
  const [thirdPlaceTeamId, setThirdPlaceTeamId] = useState('');
  const [teamKills, setTeamKills] = useState<{ [key: string]: number }>({});

  // Action status state
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const [tab, setTab] = useState<'active' | 'history'>('active');

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isSuperAdmin = currentUser?.role === 'ROLE_SUPER_ADMIN';

  const [adminView, setAdminView] = useState<'tournaments' | 'users' | 'support' | 'deposits' | 'withdrawals' | 'payment-settings' | 'access-control'>('tournaments');
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [depositsLoading, setDepositsLoading] = useState(false);
  const [depositsError, setDepositsError] = useState('');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [withdrawalsError, setWithdrawalsError] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [isPromoteUserModalOpen, setIsPromoteUserModalOpen] = useState(false);
  const [promoteSearchQuery, setPromoteSearchQuery] = useState('');

  const compressImageFile = (file: File, maxWidth = 600, quality = 0.85): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              'image/jpeg',
              quality
            );
          } else {
            resolve(file);
          }
        };
        img.onerror = () => resolve(file);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState('');
  const [supportFilter, setSupportFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // User Profile Details Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<any | null>(null);
  const [profileWallet, setProfileWallet] = useState<any | null>(null);
  const [profileTransactions, setProfileTransactions] = useState<any[]>([]);
  const [profileTournaments, setProfileTournaments] = useState<any[]>([]);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<'transactions' | 'tournaments'>('transactions');

  // Super Admin Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<any>({ upiId: '', upiQrUrl: '' });
  const [newUpiId, setNewUpiId] = useState('');
  const [newQrFile, setNewQrFile] = useState<File | null>(null);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState('');

  // Super Admin Access Control State
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [editRole, setEditRole] = useState<'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | 'ROLE_PLAYER'>('ROLE_ADMIN');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [savingAdminRole, setSavingAdminRole] = useState(false);

  useEffect(() => {
    if (!userStr || (JSON.parse(userStr).role !== 'ROLE_ADMIN' && JSON.parse(userStr).role !== 'ROLE_SUPER_ADMIN')) {
      navigate('/');
      return;
    }
    fetchTournaments();
  }, [navigate]);

  useEffect(() => {
    if (adminView === 'users') {
      fetchUsers();
    } else if (adminView === 'support') {
      fetchSupportTickets();
    } else if (adminView === 'deposits') {
      fetchPendingDeposits();
    } else if (adminView === 'withdrawals') {
      fetchPendingWithdrawals();
    } else if (adminView === 'payment-settings') {
      fetchPaymentSettings();
    } else if (adminView === 'access-control') {
      fetchAdmins();
    } else {
      fetchTournaments();
    }
  }, [adminView]);

  const fetchPaymentSettings = async () => {
    try {
      const data = await getPublicPaymentSettings();
      setPaymentSettings(data);
      setNewUpiId(data.upiId || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentMsg('');
    try {
      const formData = new FormData();
      if (newUpiId) formData.append('upiId', newUpiId);
      if (newQrFile) formData.append('qrImage', newQrFile);

      const updated = await updatePaymentSettings(formData);
      setPaymentSettings(updated);
      setPaymentMsg('Payment QR Code & Merchant UPI ID updated successfully!');
      setNewQrFile(null);
    } catch (err: any) {
      setPaymentMsg(err.response?.data?.message || 'Failed to update payment settings');
    } finally {
      setSavingPayment(false);
    }
  };

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const data = await getAllAdmins();
      setAdminsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleOpenEditAdminModal = (user: any) => {
    setSelectedAdminUser(user);
    setEditRole(user.role === 'ROLE_SUPER_ADMIN' ? 'ROLE_SUPER_ADMIN' : 'ROLE_ADMIN');
    setEditPermissions(user.permissions ? user.permissions.split(',') : ['MANAGE_TOURNAMENTS', 'MANAGE_DEPOSITS', 'MANAGE_WITHDRAWALS', 'MANAGE_USERS', 'MANAGE_SUPPORT']);
  };

  const togglePermission = (perm: string) => {
    if (editPermissions.includes(perm)) {
      setEditPermissions(editPermissions.filter(p => p !== perm));
    } else {
      setEditPermissions([...editPermissions, perm]);
    }
  };

  const handleSaveAdminRoleAndPermissions = async () => {
    if (!selectedAdminUser) return;
    setSavingAdminRole(true);
    try {
      const permsStr = editPermissions.join(',');
      await updateUserRoleAndPermissions(selectedAdminUser.id, editRole, permsStr);
      fetchAdmins();
      fetchUsers();
      setSelectedAdminUser(null);
      alert('Admin permissions updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update admin permissions');
    } finally {
      setSavingAdminRole(false);
    }
  };

  const fetchPendingDeposits = async () => {
    setDepositsLoading(true);
    setDepositsError('');
    try {
      const data = await getPendingDeposits();
      setPendingDeposits(data);
    } catch (err: any) {
      setDepositsError(err.response?.data?.message || 'Failed to fetch pending deposits');
    } finally {
      setDepositsLoading(false);
    }
  };

  const handleVerifyDeposit = async (transactionId: string, approve: boolean) => {
    setActionLoading(true);
    try {
      await verifyPendingDeposit(transactionId, approve);
      alert(approve ? 'Deposit approved successfully!' : 'Deposit rejected.');
      fetchPendingDeposits();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update deposit verification status');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchPendingWithdrawals = async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError('');
    try {
      const data = await getPendingWithdrawals();
      setPendingWithdrawals(data);
    } catch (err: any) {
      setWithdrawalsError(err.response?.data?.message || 'Failed to fetch pending withdrawals');
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleVerifyWithdrawal = async (transactionId: string, approve: boolean) => {
    setActionLoading(true);
    try {
      await verifyPendingWithdrawal(transactionId, approve);
      alert(approve ? 'Withdrawal approved successfully!' : 'Withdrawal rejected.');
      fetchPendingWithdrawals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update withdrawal status');
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await getAllTournaments();
      setTournaments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await getAllUsers();
      setUsersList(data);
    } catch (err: any) {
      setUsersError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSupportTickets = async () => {
    setSupportLoading(true);
    setSupportError('');
    try {
      const data = await getAdminSupportTickets();
      setSupportTickets(data);
    } catch (err: any) {
      setSupportError(err.response?.data?.message || 'Failed to fetch support tickets');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    setActionLoading(true);
    try {
      await replyToSupportTicket(selectedTicket.id, replyText);
      setIsReplyModalOpen(false);
      setReplyText('');
      setSelectedTicket(null);
      fetchSupportTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to block this user? They will be locked out of their account.")) return;
    try {
      await blockUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to block user');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) return;
    try {
      await unblockUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to unblock user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user's account? This action is irreversible.")) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleViewUserProfile = async (user: any) => {
    setSelectedProfileUser(user);
    setProfileModalOpen(true);
    setLoadingProfileDetails(true);
    setProfileWallet(null);
    setProfileTransactions([]);
    setProfileTournaments([]);

    try {
      const [walletData, transactionsData, tournamentsData] = await Promise.all([
        getUserWalletBalance(user.id),
        getUserTransactionHistory(user.id),
        getUserRegisteredTournaments(user.id)
      ]);

      setProfileWallet(walletData);
      setProfileTransactions(transactionsData);
      setProfileTournaments(tournamentsData);
    } catch (err) {
      console.error("Failed to load user profile details for admin", err);
    } finally {
      setLoadingProfileDetails(false);
    }
  };

  const handleSelectTournament = async (tournament: any) => {
    setSelectedTournament(tournament);
    setLoadingRegistrations(true);
    try {
      const data = await getRegistrationsForTournament(tournament.id);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleCancelTournament = async () => {
    if (!window.confirm("Are you sure you want to cancel this tournament? This cannot be fully undone.")) return;
    setActionLoading(true);
    setActionError('');
    try {
      const data = await cancelTournament(selectedTournament.id);
      setSelectedTournament(data);
      fetchTournaments(); // refresh list
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to cancel tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this tournament and clear it from history?")) return;
    setActionLoading(true);
    setActionError('');
    try {
      await deleteTournament(tournamentId);
      setSelectedTournament(null);
      fetchTournaments(); // refresh list
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!newMatchTiming) return;
    setActionLoading(true);
    setActionError('');
    try {
      const formattedTiming = newMatchTiming.length === 16 ? newMatchTiming + ':00' : newMatchTiming;
      const data = await rescheduleTournament(selectedTournament.id, formattedTiming);
      setSelectedTournament(data);
      setRescheduleModalOpen(false);
      fetchTournaments(); // refresh list
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to reschedule tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMembers = async (team: any) => {
    setSelectedTeam(team);
    setMembersModalOpen(true);
    setLoadingMembers(true);
    try {
      const data = await getTeamMembers(team.teamId);
      setTeamMembers(data);
    } catch (err) {
      console.error("Failed to load members", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const openResultsModal = () => {
    const initialKills: { [key: string]: number } = {};
    let first = '';
    let second = '';
    let third = '';

    registrations.forEach(r => {
      initialKills[r.teamId] = r.kills || 0;
      if (r.placement === 1) first = r.teamId;
      if (r.placement === 2) second = r.teamId;
      if (r.placement === 3) third = r.teamId;
    });

    setTeamKills(initialKills);
    setFirstPlaceTeamId(first);
    setSecondPlaceTeamId(second);
    setThirdPlaceTeamId(third);
    setResultsModalOpen(true);
  };

  const handleSubmitResults = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      const payload = {
        firstPlaceTeamId: firstPlaceTeamId || null,
        secondPlaceTeamId: secondPlaceTeamId || null,
        thirdPlaceTeamId: thirdPlaceTeamId || null,
        teamKills: teamKills
      };
      const updatedTournament = await updateTournamentResults(selectedTournament.id, payload);
      setSelectedTournament(updatedTournament);

      const updatedRegs = await getRegistrationsForTournament(selectedTournament.id);
      setRegistrations(updatedRegs);

      setResultsModalOpen(false);
      fetchTournaments();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update results');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to remove team ${teamName} from this tournament?`)) return;
    try {
      await removeTeamFromTournament(selectedTournament.id, teamId);
      setRegistrations(registrations.filter(r => r.teamId !== teamId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove team');
    }
  };

  const isKillOnly = selectedTournament &&
    (!selectedTournament.firstPrize || Number(selectedTournament.firstPrize) === 0) &&
    (!selectedTournament.secondPrize || Number(selectedTournament.secondPrize) === 0) &&
    (!selectedTournament.thirdPrize || Number(selectedTournament.thirdPrize) === 0);

  const activeTournaments = tournaments.filter(t => t.status !== 'Finished' && t.status !== 'Cancelled');
  const historyTournaments = tournaments.filter(t => t.status === 'Finished' || t.status === 'Cancelled')
    .sort((a, b) => new Date(b.matchTiming || b.updatedAt || 0).getTime() - new Date(a.matchTiming || a.updatedAt || 0).getTime());

  const displayedTournaments = tab === 'active' ? activeTournaments : historyTournaments;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      {/* Admin Header */}
      <div className="bg-surface border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-4 font-bold tracking-widest text-xs uppercase">
            <ShieldAlert size={14} className="text-rose-400" /> 
            <span className="text-rose-400">System Administration</span>
            {isSuperAdmin ? (
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider shadow">
                ★ Super Admin (Developer Control)
              </span>
            ) : (
              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider">
                Sub-Admin
              </span>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                {adminView === 'tournaments'
                  ? 'Tournament Manager'
                  : adminView === 'users'
                    ? 'User Directory'
                    : adminView === 'support'
                      ? 'Customer Support Tickets'
                      : adminView === 'deposits'
                        ? 'Pending Deposits Approval'
                        : adminView === 'withdrawals'
                          ? 'Pending Withdrawals Approval'
                          : adminView === 'payment-settings'
                            ? 'UPI QR & Merchant Payment Configuration'
                            : 'Sub-Admin Access & Permissions Control'}
              </h1>
              <p className="text-textSecondary text-sm max-w-xl">
                {adminView === 'tournaments'
                  ? 'Oversee all active and upcoming tournaments. Select a tournament to view registered teams and manage brackets.'
                  : adminView === 'users'
                    ? 'Monitor user registration data, check activity statuses, and view player in-game identities.'
                    : adminView === 'support'
                      ? 'Manage customer complaints and help requests. Select a ticket to view details and reply.'
                      : adminView === 'deposits'
                        ? 'Review manual UPI deposit requests. Verify transaction UTR references with your bank account, then approve or reject.'
                        : adminView === 'withdrawals'
                          ? 'Review user withdrawal requests and approve or reject payouts.'
                          : adminView === 'payment-settings'
                            ? 'Super Admin Only: Dynamically update the platform deposit Merchant UPI ID and upload custom QR Code images.'
                            : 'Super Admin Only: Create and manage Sub-Admins, assigning specific feature permissions.'}
              </p>
            </div>
            {adminView === 'tournaments' && (
              <Link to="/admin/tournaments/create" className="btn-primary flex items-center gap-2 flex-shrink-0">
                <Trophy size={16} /> Create New Tournament
              </Link>
            )}
          </div>

          {/* View Toggle Tabs */}
          <div className="flex gap-4 mt-6 border-b border-white/10 pb-0 overflow-x-auto">
            <button
              onClick={() => setAdminView('tournaments')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap ${adminView === 'tournaments' ? 'text-white border-b-2 border-primary' : 'text-textSecondary hover:text-white'}`}
            >
              Tournaments
            </button>
            <button
              onClick={() => setAdminView('users')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap ${adminView === 'users' ? 'text-white border-b-2 border-primary' : 'text-textSecondary hover:text-white'}`}
            >
              Users & Activity
            </button>
            <button
              onClick={() => setAdminView('support')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap ${adminView === 'support' ? 'text-white border-b-2 border-primary' : 'text-textSecondary hover:text-white'}`}
            >
              Support Tickets
            </button>
            <button
              onClick={() => setAdminView('deposits')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap ${adminView === 'deposits' ? 'text-white border-b-2 border-primary' : 'text-textSecondary hover:text-white'}`}
            >
              Pending Deposits
            </button>
            <button
              onClick={() => setAdminView('withdrawals')}
              className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap ${adminView === 'withdrawals' ? 'text-white border-b-2 border-primary' : 'text-textSecondary hover:text-white'}`}
            >
              Pending Withdrawals
            </button>

            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setAdminView('payment-settings')}
                  className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap text-amber-400 ${adminView === 'payment-settings' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-amber-400/70 hover:text-amber-400'}`}
                >
                  ★ UPI QR & Settings
                </button>
                <button
                  onClick={() => setAdminView('access-control')}
                  className={`px-4 py-2 text-sm font-semibold tracking-wider transition-all relative whitespace-nowrap text-amber-400 ${adminView === 'access-control' ? 'text-amber-400 border-b-2 border-amber-400 font-bold' : 'text-amber-400/70 hover:text-amber-400'}`}
                >
                  ★ Sub-Admin Access Control
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {adminView === 'tournaments' ? (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col md:flex-row gap-8">

          {/* Left Column: Tournament List */}
          <div className="w-full md:w-1/3 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-display font-bold text-xl">Tournament Manager</h3>
              <button onClick={fetchTournaments} className="text-textSecondary hover:text-white transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="flex border-b border-white/10 bg-surfaceHighlight/10 rounded-lg p-1">
              <button
                onClick={() => { setTab('active'); setSelectedTournament(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${tab === 'active' ? 'bg-primary text-black' : 'text-textSecondary hover:text-white'}`}
              >
                Active
              </button>
              <button
                onClick={() => { setTab('history'); setSelectedTournament(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${tab === 'history' ? 'bg-primary text-black' : 'text-textSecondary hover:text-white'}`}
              >
                History
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
              <input type="text" placeholder="Search tournaments..." className="input-field pl-10 py-2 text-sm" />
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[500px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader className="animate-spin text-primary" size={24} />
                </div>
              ) : displayedTournaments.length === 0 ? (
                <p className="text-textSecondary text-sm text-center py-4">No tournaments found.</p>
              ) : (
                displayedTournaments.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTournament(t)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTournament?.id === t.id ? 'bg-primary/10 border-primary text-white' : 'bg-surfaceHighlight/30 border-white/5 hover:border-white/10 text-textSecondary hover:text-white'}`}
                  >
                    <div className="font-bold font-display mb-1 truncate">{t.name}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1"><Users size={12} /> {t.gameMode}</span>
                      <span className={t.status === 'Upcoming' ? 'text-emerald-400' : t.status === 'Finished' ? 'text-blue-400' : t.status === 'Cancelled' ? 'text-rose-400' : 'text-primary'}>
                        {t.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Registrations Details */}
          <div className="w-full md:w-2/3">
            {!selectedTournament ? (
              <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-textSecondary bg-surfaceHighlight/10">
                <Trophy size={48} className="text-white/10 mb-4" />
                <p>Select a tournament from the list to view its registrations.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                key={selectedTournament.id}
                className="glass-panel p-6"
              >
                <div className="border-b border-white/10 pb-6 mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-2xl font-bold font-display text-white">{selectedTournament.name}</h2>
                    <div className="flex gap-2">
                      {selectedTournament.status === 'Finished' || selectedTournament.status === 'Cancelled' ? (
                        <button
                          onClick={() => handleDeleteTournament(selectedTournament.id)}
                          disabled={actionLoading}
                          className="text-xs font-semibold px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Clear History Record
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => openResultsModal()}
                            disabled={actionLoading}
                            className="text-xs font-semibold px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary transition-colors flex items-center gap-1"
                          >
                            <Trophy size={12} /> Update Results
                          </button>
                          <button
                            onClick={() => setRescheduleModalOpen(true)}
                            disabled={actionLoading}
                            className="text-xs font-semibold px-3 py-1.5 rounded bg-surfaceHighlight hover:bg-surface border border-white/10 text-white transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={handleCancelTournament}
                            disabled={actionLoading}
                            className="text-xs font-semibold px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition-colors disabled:opacity-50"
                          >
                            Cancel Tournament
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {actionError && (
                    <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                      {actionError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-textSecondary mt-4">
                    <div className="bg-surface px-3 py-1 rounded-full border border-white/5">{selectedTournament.gameMode}</div>
                    <div className="bg-surface px-3 py-1 rounded-full border border-white/5">{selectedTournament.gameMap}</div>
                    <div className="bg-surface px-3 py-1 rounded-full border border-white/5 flex items-center gap-1">Prize: <span className="text-primary font-bold">₹{selectedTournament.prizePool}</span></div>
                    {selectedTournament.firstPrize > 0 && <div className="bg-surface px-3 py-1 rounded-full border border-[#FFD700]/30 flex items-center gap-1 text-[#FFD700]"><Trophy size={14} /> 1st: ₹{selectedTournament.firstPrize}</div>}
                    {selectedTournament.secondPrize > 0 && <div className="bg-surface px-3 py-1 rounded-full border border-[#C0C0C0]/30 flex items-center gap-1 text-[#C0C0C0]"><Trophy size={14} /> 2nd: ₹{selectedTournament.secondPrize}</div>}
                    {selectedTournament.thirdPrize > 0 && <div className="bg-surface px-3 py-1 rounded-full border border-[#CD7F32]/30 flex items-center gap-1 text-[#CD7F32]"><Trophy size={14} /> 3rd: ₹{selectedTournament.thirdPrize}</div>}
                    {selectedTournament.perKillPrize > 0 && <div className="bg-surface px-3 py-1 rounded-full border border-white/10 flex items-center gap-1 text-white"><span className="text-[10px] font-bold">KILL</span> ₹{selectedTournament.perKillPrize}</div>}

                    {selectedTournament.matchTiming && (
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                        <Calendar size={14} /> {new Date(selectedTournament.matchTiming).toLocaleString()}
                      </div>
                    )}
                    {selectedTournament.status === 'Cancelled' && (
                      <div className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 font-bold uppercase tracking-wider text-xs flex items-center gap-1">
                        <AlertCircle size={14} /> Cancelled
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <Users className="text-primary" size={20} />
                    Registered Teams / Players ({registrations.length})
                  </h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
                    <input
                      type="text"
                      placeholder="Search player, UID, or team..."
                      className="input-field pl-10 py-1.5 text-xs bg-surface"
                      value={regSearchQuery}
                      onChange={e => setRegSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loadingRegistrations ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <motion.img
                      src={logo}
                      alt="Loading..."
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-12 h-12 object-contain mb-4"
                    />
                    <p className="text-textSecondary animate-pulse">Fetching registrations...</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-12 bg-surfaceHighlight/20 rounded-xl border border-white/5">
                    <p className="text-textSecondary">No teams have registered for this tournament yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider">
                          <th className="py-3 px-4">Team</th>
                          <th className="py-3 px-4">Captain / Player</th>
                          <th className="py-3 px-4">Registered Date</th>
                          <th className="py-3 px-4 text-center">Rank</th>
                          <th className="py-3 px-4 text-center">Kills</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations
                          .filter((reg) => {
                            if (!regSearchQuery.trim()) return true;
                            const q = regSearchQuery.toLowerCase().trim();
                            const teamMatch = reg.teamName && reg.teamName.toLowerCase().includes(q);
                            const captainNameMatch = reg.captainGameName && reg.captainGameName.toLowerCase().includes(q);
                            const captainUidMatch = reg.captainFreeFireUid && reg.captainFreeFireUid.toLowerCase().includes(q);
                            const memberMatch = reg.members && reg.members.some((m: any) =>
                              (m.gameName && m.gameName.toLowerCase().includes(q)) ||
                              (m.freeFireUid && m.freeFireUid.toLowerCase().includes(q))
                            );
                            return teamMatch || captainNameMatch || captainUidMatch || memberMatch;
                          })
                          .map((reg) => (
                          <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-surfaceHighlight border border-white/10 overflow-hidden flex-shrink-0">
                                  {reg.teamLogoUrl ? (
                                    <img src={getImageUrl(reg.teamLogoUrl)} alt="logo" className="w-full h-full object-cover" />
                                  ) : (
                                    <Users size={16} className="text-textSecondary m-auto mt-2" />
                                  )}
                                </div>
                                <span className="font-bold text-white">{reg.teamName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-white">{reg.captainGameName || 'Unnamed Player'}</span>
                                <span className="text-xs text-primary font-semibold">UID: {reg.captainFreeFireUid || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-textSecondary">
                              {new Date(reg.registeredAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-center font-bold">
                              {reg.placement ? (
                                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${reg.placement === 1 ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30' :
                                    reg.placement === 2 ? 'bg-[#C0C0C0]/10 text-[#C0C0C0] border border-[#C0C0C0]/30' :
                                      'bg-[#CD7F32]/10 text-[#CD7F32] border border-[#CD7F32]/30'
                                  }`}>
                                  Rank {reg.placement}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-4 px-4 text-center text-sm text-white">
                              {reg.kills !== null && reg.kills !== undefined ? reg.kills : 0}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleViewMembers(reg)}
                                  className="p-1.5 rounded bg-surface border border-white/5 text-textSecondary hover:text-white hover:border-white/20 transition-all"
                                  title="View Members"
                                >
                                  <Users size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemoveTeam(reg.teamId, reg.teamName)}
                                  className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                                  title="Remove Team"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      ) : adminView === 'users' ? (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Total Registered Users</p>
                <h4 className="text-3xl font-display font-bold text-white">{usersList.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="text-primary" size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Online Right Now</p>
                <h4 className="text-3xl font-display font-bold text-emerald-400">
                  {usersList.filter(u => u.lastActiveAt && (Date.now() - new Date(u.lastActiveAt).getTime()) < 5 * 60 * 1000).length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Offline (Over 24h)</p>
                <h4 className="text-3xl font-display font-bold text-textSecondary">
                  {usersList.filter(u => !u.lastActiveAt || (Date.now() - new Date(u.lastActiveAt).getTime()) >= 24 * 60 * 60 * 1000).length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Users className="text-textSecondary" size={20} />
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold font-display text-white">Registered Users</h3>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
                <input
                  type="text"
                  placeholder="Search by email, name..."
                  className="input-field pl-10 py-2 text-sm"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={32} />
                <p className="text-textSecondary text-sm mt-4 animate-pulse">Loading directory...</p>
              </div>
            ) : usersError ? (
              <div className="text-center py-12 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-400 text-sm">{usersError}</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-12 bg-surfaceHighlight/20 rounded-xl border border-white/5">
                <p className="text-textSecondary text-sm">No users registered on the platform yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Avatar</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">In-Game Name</th>
                      <th className="py-3 px-4">Free Fire UID</th>
                      <th className="py-3 px-4">Activity Status</th>
                      <th className="py-3 px-4">Member Since</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => {
                        const q = userSearchQuery.toLowerCase();
                        return (
                          u.email.toLowerCase().includes(q) ||
                          (u.gameName && u.gameName.toLowerCase().includes(q)) ||
                          u.role.toLowerCase().includes(q)
                        );
                      })
                      .map((u) => {
                        const isOnline = u.lastActiveAt && (Date.now() - new Date(u.lastActiveAt).getTime()) < 5 * 60 * 1000;
                        const lastActiveStr = u.lastActiveAt
                          ? new Date(u.lastActiveAt).toLocaleString()
                          : 'Never';

                        return (
                          <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                            <td className="py-4 px-4">
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-surfaceHighlight/20 flex items-center justify-center">
                                {u.avatarUrl ? (
                                  <img src={getImageUrl(u.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <Users size={16} className="text-textSecondary" />
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 font-medium text-white">
                              <button
                                onClick={() => handleViewUserProfile(u)}
                                className="hover:text-primary transition-colors focus:outline-none text-left cursor-pointer font-medium"
                              >
                                {u.email}
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${u.role === 'ROLE_ADMIN'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-primary/10 text-primary border-primary/20'
                                }`}>
                                {u.role === 'ROLE_ADMIN' ? 'Admin' : 'Player'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-textSecondary">
                              {u.gameName ? (
                                <button
                                  onClick={() => handleViewUserProfile(u)}
                                  className="hover:text-primary transition-colors focus:outline-none text-left cursor-pointer"
                                >
                                  {u.gameName}
                                </button>
                              ) : (
                                <span className="italic text-textSecondary/40">Not Set</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-textSecondary">{u.freeFireUid || <span className="italic text-textSecondary/40">Not Set</span>}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-textSecondary/30'}`}></span>
                                <span className={isOnline ? 'text-emerald-400 font-semibold' : 'text-textSecondary text-xs'}>
                                  {isOnline ? 'Online' : `Offline (Last active: ${lastActiveStr})`}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-textSecondary text-xs">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleViewUserProfile(u)}
                                  className="p-1.5 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all cursor-pointer"
                                  title="View User Details"
                                >
                                  <UserIcon size={14} />
                                </button>
                                {isSuperAdmin && (
                                  <button
                                    onClick={() => handleOpenEditAdminModal(u)}
                                    className="p-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer"
                                    title="Configure Sub-Admin Access & Permissions"
                                  >
                                    <Shield size={14} />
                                  </button>
                                )}
                                {u.role !== 'ROLE_ADMIN' && (
                                  <>
                                    {u.isBlocked ? (
                                      <button
                                        onClick={() => handleUnblockUser(u.id)}
                                        className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                        title="Unblock User"
                                      >
                                        <CheckCircle size={14} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleBlockUser(u.id)}
                                        className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                                        title="Block User"
                                      >
                                        <UserX size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                                      title="Delete User"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : adminView === 'support' ? (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          {/* Support Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Total Tickets</p>
                <h4 className="text-3xl font-display font-bold text-white">{supportTickets.length}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <MessageSquare className="text-primary" size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Pending Tickets</p>
                <h4 className="text-3xl font-display font-bold text-amber-400">
                  {supportTickets.filter(t => t.status === 'Pending').length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Clock className="text-amber-400" size={20} />
              </div>
            </div>

            <div className="glass-panel p-6 flex items-center justify-between">
              <div>
                <p className="text-textSecondary text-xs uppercase tracking-wider mb-1 font-semibold">Resolved Tickets</p>
                <h4 className="text-3xl font-display font-bold text-emerald-400">
                  {supportTickets.filter(t => t.status === 'Resolved').length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
            </div>
          </div>

          {/* Support Tickets Table */}
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold font-display text-white">Customer Support Tickets</h3>
              <div className="flex items-center gap-4">
                <select
                  className="input-field py-2 text-sm bg-surface w-36 cursor-pointer"
                  value={supportFilter}
                  onChange={e => setSupportFilter(e.target.value as any)}
                >
                  <option value="all">All Tickets</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {supportLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={32} />
                <p className="text-textSecondary text-sm mt-4 animate-pulse">Loading tickets...</p>
              </div>
            ) : supportError ? (
              <div className="text-center py-12 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-400 text-sm">{supportError}</p>
              </div>
            ) : supportTickets.length === 0 ? (
              <div className="text-center py-12 bg-surfaceHighlight/20 rounded-xl border border-white/5">
                <p className="text-textSecondary text-sm">No support tickets found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">User Email</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supportTickets
                      .filter(t => {
                        if (supportFilter === 'pending') return t.status === 'Pending';
                        if (supportFilter === 'resolved') return t.status === 'Resolved';
                        return true;
                      })
                      .map((t) => {
                        const date = new Date(t.createdAt).toLocaleString();
                        return (
                          <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                            <td className="py-4 px-4 font-medium text-white">{t.user?.email || 'Unknown User'}</td>
                            <td className="py-4 px-4 text-textSecondary">{t.subject}</td>
                            <td className="py-4 px-4">
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${t.status === 'Resolved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-textSecondary text-xs">{date}</td>
                            <td className="py-4 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setReplyText(t.reply || '');
                                  setIsReplyModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded text-xs font-semibold bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary transition-colors cursor-pointer"
                              >
                                {t.status === 'Resolved' ? 'View Details' : 'Reply & Resolve'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : adminView === 'deposits' ? (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-display font-bold text-xl">Pending Manual Deposits</h3>
              <p className="text-textSecondary text-xs mt-1">Review UTR / transaction IDs submitted by players against your bank statement</p>
            </div>
            <button
              onClick={fetchPendingDeposits}
              className="p-2 rounded bg-surface border border-white/5 text-textSecondary hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw size={14} className={depositsLoading ? 'animate-spin' : ''} /> Refresh List
            </button>
          </div>

          {depositsError && (
            <div className="glass-panel p-4 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {depositsError}
            </div>
          )}

          {depositsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-textSecondary">
              <Loader className="animate-spin text-primary" size={32} />
              <span className="text-sm">Fetching manual deposits...</span>
            </div>
          ) : pendingDeposits.length === 0 ? (
            <div className="glass-panel p-12 text-center text-textSecondary border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
              <CheckCircle size={36} className="text-emerald-500/70" />
              <div>
                <p className="text-white font-bold">No pending deposits</p>
                <p className="text-xs mt-1">All manual deposit requests have been verified and processed.</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl bg-surfaceHighlight/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider bg-surfaceHighlight/30">
                      <th className="py-3 px-4">Player Email</th>
                      <th className="py-3 px-4">In-Game Name</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Submitted UTR / Ref No</th>
                      <th className="py-3 px-4">Submitted Date</th>
                      <th className="py-3 px-4 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDeposits.map((deposit) => {
                      const date = new Date(deposit.createdAt).toLocaleString();
                      return (
                        <tr key={deposit.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                          <td className="py-4 px-4 font-semibold text-white">{deposit.userEmail}</td>
                          <td className="py-4 px-4 text-textSecondary">{deposit.username || 'N/A'}</td>
                          <td className="py-4 px-4 font-display font-bold text-emerald-400">₹{deposit.amount.toFixed(2)}</td>
                          <td className="py-4 px-4 font-mono font-bold text-white tracking-wider select-all">{deposit.paymentReference}</td>
                          <td className="py-4 px-4 text-textSecondary text-xs">{date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyDeposit(deposit.id, true)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyDeposit(deposit.id, false)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : adminView === 'withdrawals' ? (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-display font-bold text-xl">Pending Manual Withdrawals</h3>
              <p className="text-textSecondary text-xs mt-1">Review withdrawal requests, check UPI / Bank details, make payouts, and verify status.</p>
            </div>
            <button
              onClick={fetchPendingWithdrawals}
              className="p-2 rounded bg-surface border border-white/5 text-textSecondary hover:text-white hover:border-white/20 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw size={14} className={withdrawalsLoading ? 'animate-spin' : ''} /> Refresh List
            </button>
          </div>

          {withdrawalsError && (
            <div className="glass-panel p-4 border border-rose-500/20 bg-rose-500/5 text-rose-400 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {withdrawalsError}
            </div>
          )}

          {withdrawalsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-textSecondary">
              <Loader className="animate-spin text-primary" size={32} />
              <span className="text-sm">Fetching manual withdrawals...</span>
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <div className="glass-panel p-12 text-center text-textSecondary border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
              <CheckCircle size={36} className="text-emerald-500/70" />
              <div>
                <p className="text-white font-bold">No pending withdrawals</p>
                <p className="text-xs mt-1">All withdrawal requests have been verified and processed.</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl bg-surfaceHighlight/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider bg-surfaceHighlight/30">
                      <th className="py-3 px-4">Player Email</th>
                      <th className="py-3 px-4">In-Game Name</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payout Details</th>
                      <th className="py-3 px-4">Requested Date</th>
                      <th className="py-3 px-4 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((withdrawal) => {
                      const date = new Date(withdrawal.createdAt).toLocaleString();
                      return (
                        <tr key={withdrawal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                          <td className="py-4 px-4 font-semibold text-white">{withdrawal.userEmail}</td>
                          <td className="py-4 px-4 text-textSecondary">{withdrawal.username || 'N/A'}</td>
                          <td className="py-4 px-4 font-display font-bold text-rose-400">₹{withdrawal.amount.toFixed(2)}</td>
                          <td className="py-4 px-4 text-white font-medium select-all">{withdrawal.description}</td>
                          <td className="py-4 px-4 text-textSecondary text-xs">{date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyWithdrawal(withdrawal.id, true)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyWithdrawal(withdrawal.id, false)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : adminView === 'payment-settings' ? (
        <div className="flex-grow max-w-4xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          <div className="glass-panel p-8 relative overflow-hidden border border-amber-500/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <QrCode size={28} className="text-amber-400" />
              <div>
                <h3 className="text-2xl font-bold font-display text-white">Payment UPI QR & Merchant Configuration</h3>
                <p className="text-textSecondary text-xs">Super Admin Tool: Update platform UPI ID and custom deposit QR code image</p>
              </div>
            </div>

            {paymentMsg && (
              <div className={`mb-6 p-4 rounded-lg text-sm border font-medium ${paymentMsg.includes('successfully') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                {paymentMsg}
              </div>
            )}

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* QR Code Preview */}
                <div className="text-center p-6 bg-background rounded-2xl border border-white/10">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-textSecondary mb-3">Active Deposit QR Code Preview</span>
                  <div className="bg-white p-4 rounded-xl inline-block shadow-2xl border border-white/10 mb-3">
                    <img 
                      src={newQrFile ? URL.createObjectURL(newQrFile) : (paymentSettings.upiQrUrl ? getImageUrl(paymentSettings.upiQrUrl) : qrImageDefault)} 
                      alt="UPI QR Code Preview" 
                      className="w-44 h-44 object-contain mx-auto" 
                    />
                  </div>
                  <span className="block text-[11px] text-textSecondary">
                    {newQrFile ? `Selected file: ${newQrFile.name}` : (paymentSettings.upiQrUrl ? 'Custom QR Code Active' : 'Default Platform QR Code Active')}
                  </span>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Merchant UPI ID *</label>
                    <input 
                      type="text"
                      required
                      value={newUpiId}
                      onChange={e => setNewUpiId(e.target.value)}
                      placeholder="e.g. yourname@okaxis"
                      className="w-full input-field font-medium text-white text-base py-3"
                    />
                    <span className="block text-[11px] text-textSecondary mt-1">Users will see and copy this exact UPI ID on the wallet deposit modal.</span>
                  </div>

                  <div>
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Upload New QR Code Image (Optional)</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          const compressed = await compressImageFile(e.target.files[0], 600, 0.85);
                          setNewQrFile(compressed);
                        }
                      }}
                      className="w-full text-xs text-textSecondary file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-primary-hover file:cursor-pointer cursor-pointer"
                    />
                    <span className="block text-[11px] text-textSecondary mt-1">Upload JPEG/PNG image of your payment UPI QR code.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingPayment ? 'Saving Configuration...' : 'Save Payment Configuration'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-grow max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-display font-bold text-xl">Sub-Admin & Access Permissions Directory</h3>
              <p className="text-textSecondary text-xs mt-1">Super Admin Control: Assign role levels (Super Admin / Sub-Admin / Player) and configure granular module accesses.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await fetchUsers();
                  setIsPromoteUserModalOpen(true);
                }}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer font-bold"
              >
                <Plus size={14} /> Promote Player to Sub-Admin
              </button>
              <button
                onClick={fetchAdmins}
                className="bg-surfaceHighlight hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>
          </div>

          {loadingAdmins ? (
            <div className="flex justify-center py-16"><Loader className="animate-spin text-amber-400" size={32} /></div>
          ) : (
            <div className="glass-panel border border-white/5 rounded-2xl overflow-hidden shadow-2xl bg-surfaceHighlight/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-textSecondary text-xs uppercase tracking-wider bg-surfaceHighlight/30">
                      <th className="py-3 px-4">Admin Email</th>
                      <th className="py-3 px-4">In-Game Name</th>
                      <th className="py-3 px-4">Role Tier</th>
                      <th className="py-3 px-4">Assigned Permissions</th>
                      <th className="py-3 px-4 text-right">Access Management</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminsList.map((adm) => (
                      <tr key={adm.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                        <td className="py-4 px-4 font-semibold text-white">{adm.email}</td>
                        <td className="py-4 px-4 text-textSecondary">{adm.gameName || 'N/A'}</td>
                        <td className="py-4 px-4">
                          {adm.role === 'ROLE_SUPER_ADMIN' ? (
                            <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                              Super Admin
                            </span>
                          ) : (
                            <span className="bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                              Sub-Admin
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-textSecondary">
                          {adm.role === 'ROLE_SUPER_ADMIN' ? (
                            <span className="text-amber-400 font-semibold">Full Access (All System Controls)</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {adm.permissions ? (
                                adm.permissions.split(',').map((p: string) => (
                                  <span key={p} className="bg-white/10 text-white px-2 py-0.5 rounded text-[10px] font-mono">
                                    {p.replace('MANAGE_', '')}
                                  </span>
                                ))
                              ) : (
                                <span className="text-emerald-400 font-semibold">Default (All Admin Modules)</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleOpenEditAdminModal(adm)}
                            className="px-3 py-1.5 rounded text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                          >
                            <Edit3 size={12} /> Configure Access & Role
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Modals */}

      {/* Edit Admin Access Modal */}
      {selectedAdminUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-lg w-full p-6 relative border border-amber-500/20 shadow-2xl">
            <button 
              onClick={() => setSelectedAdminUser(null)} 
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold font-display text-white mb-1">Configure Sub-Admin Access</h3>
            <p className="text-textSecondary text-xs mb-6">User: <strong className="text-white">{selectedAdminUser.email}</strong></p>

            <div className="space-y-5">
              <div>
                <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Select Admin Role Level</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as any)}
                  className="w-full input-field py-2.5 text-sm bg-surface font-semibold text-white"
                >
                  <option value="ROLE_ADMIN">Sub-Admin (Granted Required Accesses)</option>
                  <option value="ROLE_SUPER_ADMIN">Super Admin (Primary Developer Admin - Full Controls)</option>
                  <option value="ROLE_PLAYER">Standard Player (Revoke Admin Rights)</option>
                </select>
              </div>

              {editRole === 'ROLE_ADMIN' && (
                <div>
                  <label className="block text-textSecondary text-xs font-semibold mb-3 uppercase tracking-wider">Select Module Permissions</label>
                  <div className="space-y-2 bg-background p-4 rounded-xl border border-white/10">
                    {[
                      { key: 'MANAGE_TOURNAMENTS', label: 'Tournaments Management (Create, Reschedule, Bracket Results)' },
                      { key: 'MANAGE_DEPOSITS', label: 'Pending Deposits Approval (Verify UTR & Credit Cash)' },
                      { key: 'MANAGE_WITHDRAWALS', label: 'Pending Withdrawals Approval (Payout Verification)' },
                      { key: 'MANAGE_USERS', label: 'User Directory & Moderation (Block, Delete, View Profile)' },
                      { key: 'MANAGE_SUPPORT', label: 'Customer Support Tickets (View & Reply Complaints)' }
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-3 p-2 rounded hover:bg-white/5 cursor-pointer text-xs text-white">
                        <input
                          type="checkbox"
                          checked={editPermissions.includes(perm.key)}
                          onChange={() => togglePermission(perm.key)}
                          className="w-4 h-4 rounded text-primary focus:ring-primary bg-surface border-white/20 cursor-pointer"
                        />
                        <span className="font-medium">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAdminUser(null)}
                  className="flex-1 py-3 bg-surfaceHighlight hover:bg-white/10 text-white font-semibold rounded-md border border-white/10 transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdminRoleAndPermissions}
                  disabled={savingAdminRole}
                  className="flex-1 btn-primary py-3 font-semibold text-xs cursor-pointer disabled:opacity-50"
                >
                  {savingAdminRole ? 'Saving...' : 'Save Admin Permissions'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Promote Player Picker Modal */}
      {isPromoteUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-lg w-full p-6 relative">
            <button
              onClick={() => setIsPromoteUserModalOpen(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold font-display text-white mb-1">Select Player to Promote</h3>
            <p className="text-textSecondary text-xs mb-4">Choose a registered user to convert into Sub-Admin with custom module accesses.</p>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
              <input
                type="text"
                placeholder="Search user by email or name..."
                className="input-field pl-10 py-2 text-sm bg-surface"
                value={promoteSearchQuery}
                onChange={e => setPromoteSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar pr-2 mb-4">
              {usersList
                .filter(u => {
                  if (!promoteSearchQuery.trim()) return true;
                  const q = promoteSearchQuery.toLowerCase();
                  return u.email.toLowerCase().includes(q) || (u.gameName && u.gameName.toLowerCase().includes(q));
                })
                .map(u => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setIsPromoteUserModalOpen(false);
                      handleOpenEditAdminModal(u);
                    }}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface border border-white/5 hover:border-primary/50 hover:bg-white/5 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surfaceHighlight border border-white/10 flex items-center justify-center overflow-hidden">
                        {u.avatarUrl ? <img src={getImageUrl(u.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={14} className="text-textSecondary" />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{u.email}</span>
                        <span className="text-xs text-textSecondary">{u.gameName || 'No Game Name'} | UID: {u.freeFireUid || 'N/A'}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${u.role === 'ROLE_ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : u.role === 'ROLE_SUPER_ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-surfaceHighlight text-textSecondary border-white/10'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Sub-Admin' : u.role === 'ROLE_SUPER_ADMIN' ? 'Super Admin' : 'Player'}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-sm w-full p-6 relative">
            <button onClick={() => setRescheduleModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-2">Reschedule Tournament</h3>
            <p className="text-textSecondary text-sm mb-4">Set a new date and time for <span className="text-white">{selectedTournament?.name}</span>.</p>

            <input
              type="datetime-local"
              className="input-field w-full mb-4 bg-surface"
              value={newMatchTiming}
              onChange={e => setNewMatchTiming(e.target.value)}
            />

            <button onClick={handleReschedule} disabled={!newMatchTiming || actionLoading} className="btn-primary w-full py-2">
              {actionLoading ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </motion.div>
        </div>
      )}

      {/* Members Modal */}
      {membersModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-md w-full p-6 relative">
            <button onClick={() => setMembersModalOpen(false)} className="absolute top-4 right-4 text-textSecondary hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold text-white mb-2">Team Members</h3>
            <p className="text-textSecondary text-sm mb-6">Roster for <span className="text-white font-bold">{selectedTeam.teamName}</span></p>

            {loadingMembers ? (
              <div className="flex justify-center py-8"><Loader className="animate-spin text-primary" size={24} /></div>
            ) : (
              <div className="space-y-2">
                {teamMembers.map((member: any) => (
                  <div key={member.userId} className="flex justify-between items-center bg-surface border border-white/5 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center border border-white/10 overflow-hidden">
                        {member.avatarUrl ? <img src={getImageUrl(member.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" /> : <UserX size={14} className="text-textSecondary" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{member.gameName}</div>
                        <div className="text-xs text-textSecondary">UID: {member.freeFireUid || 'N/A'}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${member.memberRole === 'Captain' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surfaceHighlight text-textSecondary border-white/10'}`}>
                      {member.memberRole}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Results Modal */}
      {resultsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel max-w-xl w-full p-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <button
              onClick={() => setResultsModalOpen(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Trophy className="text-primary" size={22} /> Update Tournament Results
            </h3>
            <p className="text-textSecondary text-sm mb-6">
              {isKillOnly
                ? `Input the total kills achieved by each registered team in `
                : `Select the winners and input the total kills achieved by each registered team in `
              }
              <span className="text-white font-bold">{selectedTournament?.name}</span>.
            </p>

            {actionError && (
              <div className="mb-4 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded">
                {actionError}
              </div>
            )}

            {!isKillOnly && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* 1st Place */}
                <div>
                  <label className="block text-xs font-semibold text-[#FFD700] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Trophy size={12} /> 1st Place Winner
                  </label>
                  <select
                    className="input-field w-full text-sm bg-surface"
                    value={firstPlaceTeamId}
                    onChange={e => setFirstPlaceTeamId(e.target.value)}
                  >
                    <option value="">-- Select Team --</option>
                    {registrations.map(r => (
                      <option key={r.teamId} value={r.teamId}>{r.teamName}</option>
                    ))}
                  </select>
                </div>

                {/* 2nd Place */}
                <div>
                  <label className="block text-xs font-semibold text-[#C0C0C0] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Trophy size={12} /> 2nd Place Winner
                  </label>
                  <select
                    className="input-field w-full text-sm bg-surface"
                    value={secondPlaceTeamId}
                    onChange={e => setSecondPlaceTeamId(e.target.value)}
                  >
                    <option value="">-- Select Team --</option>
                    {registrations.map(r => (
                      <option key={r.teamId} value={r.teamId}>{r.teamName}</option>
                    ))}
                  </select>
                </div>

                {/* 3rd Place */}
                <div>
                  <label className="block text-xs font-semibold text-[#CD7F32] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Trophy size={12} /> 3rd Place Winner
                  </label>
                  <select
                    className="input-field w-full text-sm bg-surface"
                    value={thirdPlaceTeamId}
                    onChange={e => setThirdPlaceTeamId(e.target.value)}
                  >
                    <option value="">-- Select Team --</option>
                    {registrations.map(r => (
                      <option key={r.teamId} value={r.teamId}>{r.teamName}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 mb-6">
              <h4 className="text-white font-bold text-sm mb-4">Total Kills by Team</h4>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {registrations.map(r => (
                  <div key={r.teamId} className="flex items-center justify-between bg-surface/50 border border-white/5 p-3 rounded-lg">
                    <span className="text-sm text-white font-medium">{r.teamName}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-textSecondary">Kills:</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field w-20 py-1 text-center text-sm"
                        value={teamKills[r.teamId] !== undefined ? teamKills[r.teamId] : 0}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setTeamKills(prev => ({ ...prev, [r.teamId]: val }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResultsModalOpen(false)}
                className="w-1/2 bg-surfaceHighlight hover:bg-surface border border-white/10 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResults}
                disabled={actionLoading}
                className="w-1/2 btn-primary py-2.5 flex items-center justify-center gap-2"
              >
                {actionLoading ? 'Saving...' : 'Submit Results'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Support Ticket Reply Modal */}
      {isReplyModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-lg w-full p-6 relative">
            <button
              onClick={() => {
                setIsReplyModalOpen(false);
                setSelectedTicket(null);
                setReplyText('');
              }}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Support Ticket Details</h3>
            <p className="text-textSecondary text-xs mb-4">
              From: <span className="text-white font-bold">{selectedTicket.user?.email}</span> | Subject: <span className="text-white font-bold">{selectedTicket.subject}</span>
            </p>

            <div className="mb-6">
              <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-2">User's Message</label>
              <p className="text-textPrimary text-sm bg-black/30 p-4 rounded border border-white/5 whitespace-pre-line max-h-48 overflow-y-auto">
                {selectedTicket.message}
              </p>
            </div>

            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="block text-textSecondary text-[10px] uppercase font-bold tracking-wider mb-2">
                  {selectedTicket.status === 'Resolved' ? 'Admin Reply (Resolved)' : 'Your Reply *'}
                </label>
                {selectedTicket.status === 'Resolved' ? (
                  <p className="text-textPrimary text-sm bg-primary/5 p-4 rounded border border-primary/10 whitespace-pre-line">
                    {selectedTicket.reply}
                  </p>
                ) : (
                  <textarea
                    rows={4}
                    className="input-field text-sm resize-none py-3"
                    placeholder="Write your response to the user..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    required
                  ></textarea>
                )}
              </div>

              {selectedTicket.status !== 'Resolved' && (
                <button
                  type="submit"
                  disabled={actionLoading || !replyText.trim()}
                  className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-semibold"
                >
                  {actionLoading ? 'Sending...' : 'Send Reply & Resolve Ticket'}
                </button>
              )}
            </form>
          </motion.div>
        </div>
      )}

      {/* User Profile Details Modal */}
      {profileModalOpen && selectedProfileUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel max-w-4xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setSelectedProfileUser(null);
                setProfileWallet(null);
                setProfileTransactions([]);
                setProfileTournaments([]);
              }}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer transition-colors"
            >
              <X size={22} />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start border-b border-white/10 pb-6 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-surfaceHighlight/20 flex items-center justify-center flex-shrink-0">
                {selectedProfileUser.avatarUrl ? (
                  <img src={getImageUrl(selectedProfileUser.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-textSecondary" />
                )}
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold font-display text-white">{selectedProfileUser.email}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${selectedProfileUser.role === 'ROLE_ADMIN'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-primary/10 text-primary border-primary/20'
                    }`}>
                    {selectedProfileUser.role === 'ROLE_ADMIN' ? 'Admin' : 'Player'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-6 text-sm text-textSecondary">
                  <p><span className="text-textSecondary/60">IGN:</span> <strong className="text-white">{selectedProfileUser.gameName || 'Not Set'}</strong></p>
                  <p><span className="text-textSecondary/60">UID:</span> <strong className="text-white">{selectedProfileUser.freeFireUid || 'Not Set'}</strong></p>
                  <p><span className="text-textSecondary/60">Registered:</span> <strong className="text-white">{selectedProfileUser.createdAt ? new Date(selectedProfileUser.createdAt).toLocaleDateString() : 'N/A'}</strong></p>
                </div>
              </div>
            </div>

            {loadingProfileDetails ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={32} />
                <p className="text-textSecondary text-sm mt-4">Loading profile details...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Left Column */}
                <div className="col-span-1 space-y-4">
                  {/* Wallet Balance Card */}
                  <div className="glass-panel p-5 bg-surfaceHighlight/20 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-3 right-3 text-textSecondary/10 group-hover:text-textSecondary/20 transition-colors">
                      <Wallet size={40} />
                    </div>
                    <p className="text-textSecondary text-xs font-semibold uppercase tracking-wider mb-1">Wallet Balance</p>
                    <div className="flex items-baseline gap-1">
                      <IndianRupee size={20} className="text-primary" />
                      <h4 className="text-3xl font-bold font-display text-white">
                        {profileWallet ? profileWallet.balance.toFixed(2) : '0.00'}
                      </h4>
                    </div>
                  </div>

                  {/* Activity Stats Card */}
                  <div className="glass-panel p-5 bg-surfaceHighlight/20 border border-white/5 space-y-3">
                    <h4 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Profile Statistics</h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Tournaments Played</span>
                      <span className="text-white font-bold">{profileTournaments.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Total Transactions</span>
                      <span className="text-white font-bold">{profileTransactions.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Successful Deposits</span>
                      <span className="text-emerald-400 font-bold">
                        {profileTransactions.filter((t: any) => t.transactionType === 'DEPOSIT' && t.status === 'SUCCESS').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-textSecondary">Completed Withdrawals</span>
                      <span className="text-rose-400 font-bold">
                        {profileTransactions.filter((t: any) => t.transactionType === 'WITHDRAWAL' && t.status === 'SUCCESS').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabs Right Column */}
                <div className="col-span-1 md:col-span-2 flex flex-col max-h-[450px]">
                  {/* Tab Selector */}
                  <div className="flex border-b border-white/10 mb-4">
                    <button
                      onClick={() => setProfileActiveTab('transactions')}
                      className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${profileActiveTab === 'transactions'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-textSecondary hover:text-white'
                        }`}
                    >
                      Transaction History ({profileTransactions.length})
                    </button>
                    <button
                      onClick={() => setProfileActiveTab('tournaments')}
                      className={`pb-2.5 px-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${profileActiveTab === 'tournaments'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-textSecondary hover:text-white'
                        }`}
                    >
                      Tournaments Played ({profileTournaments.length})
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-grow overflow-y-auto pr-1">
                    {profileActiveTab === 'transactions' ? (
                      <div className="space-y-3">
                        {profileTransactions.length === 0 ? (
                          <p className="text-textSecondary text-sm py-8 text-center bg-black/10 rounded border border-white/5">No transactions recorded for this user.</p>
                        ) : (
                          profileTransactions.map((tx: any) => (
                            <div key={tx.id} className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                  {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' ? '+' : '-'}
                                </div>
                                <div>
                                  <p className="text-white font-medium">{tx.description}</p>
                                  <p className="text-textSecondary/60 text-[10px] mt-0.5">
                                    Ref: <span className="font-mono text-white/80">{tx.paymentReference || 'N/A'}</span> | {new Date(tx.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 pl-3">
                                <p className={`font-bold font-display ${tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE'
                                    ? 'text-emerald-400'
                                    : 'text-white'
                                  }`}>
                                  {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                </p>
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase ${tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                                    tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                                  }`}>
                                  {tx.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profileTournaments.length === 0 ? (
                          <p className="text-textSecondary text-sm py-8 text-center bg-black/10 rounded border border-white/5">No tournaments registered for this user.</p>
                        ) : (
                          profileTournaments.map((t: any) => (
                            <div key={t.id} className="p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-lg flex items-center justify-between text-xs">
                              <div>
                                <p className="text-white font-semibold text-sm">{t.name}</p>
                                <div className="flex gap-4 text-[10px] text-textSecondary mt-1">
                                  <span>Mode: <strong className="text-white">{t.gameMode}</strong></span>
                                  <span>Timing: <strong className="text-white">{new Date(t.matchTiming).toLocaleDateString()}</strong></span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                    t.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'
                                  }`}>
                                  {t.status}
                                </span>
                                <p className="text-[10px] text-textSecondary mt-1">Entry: ₹{t.entryFee.toFixed(2)}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
