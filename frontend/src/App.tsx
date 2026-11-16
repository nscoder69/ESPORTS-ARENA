import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Trophy, LayoutDashboard, IndianRupee, LogOut, User, CheckCircle, ShieldAlert, Bell, HelpCircle, Menu, X } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getWalletBalance } from './services/walletService';
import { getUserNotifications, markAllNotificationsAsRead } from './services/notificationService';
import API, { getImageUrl } from './services/api';
import { playNotificationSound, requestNotificationPermission } from './services/notificationSoundService';
import logo from './assets/obitoloo.png';
import LoadingSpinner from './components/LoadingSpinner';

const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const TournamentList = React.lazy(() => import('./pages/TournamentList'));
const CreateTeam = React.lazy(() => import('./pages/CreateTeam'));
const TeamDetails = React.lazy(() => import('./pages/TeamDetails'));
const LiveMatch = React.lazy(() => import('./pages/LiveMatch'));
const AdminTournamentCreate = React.lazy(() => import('./pages/AdminTournamentCreate'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const EditProfile = React.lazy(() => import('./pages/EditProfile'));
const MatchHistory = React.lazy(() => import('./pages/MatchHistory'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Support = React.lazy(() => import('./pages/Support'));
const WalletDashboard = React.lazy(() => import('./pages/WalletDashboard'));
const MakeSuperAdminPage = React.lazy(() => import('./pages/MakeSuperAdminPage'));

import { initRealtimeSync } from './services/websocketService';

function App() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isBlocked, setIsBlocked] = useState(localStorage.getItem('userBlocked') === 'true');

  const token = localStorage.getItem('token');
  const [user, setUser] = useState<any>(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  });

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle click outside for Notifications and Profile dropdowns
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isNotificationsOpen || isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('touchstart', handleDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [isNotificationsOpen, isProfileDropdownOpen]);

  // Handle system back navigation for dropdowns & mobile drawer
  const navModalPushedRef = useRef(false);
  useEffect(() => {
    const isAnyOpen = isNotificationsOpen || isProfileDropdownOpen || isMobileMenuOpen;
    if (isAnyOpen && !navModalPushedRef.current) {
      navModalPushedRef.current = true;
      window.history.pushState({ appNavModal: true }, '');

      const handlePopState = () => {
        navModalPushedRef.current = false;
        setIsNotificationsOpen(false);
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
      };

      window.addEventListener('popstate', handlePopState, { once: true });
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    } else if (!isAnyOpen && navModalPushedRef.current) {
      navModalPushedRef.current = false;
      if (window.history.state?.appNavModal) {
        window.history.back();
      }
    }
  }, [isNotificationsOpen, isProfileDropdownOpen, isMobileMenuOpen]);

  // Ensure there is always a base entry so system back navigates within the app instead of closing all pages
  useEffect(() => {
    if (!window.history.state?.appBaseSet) {
      if (window.location.pathname !== '/') {
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        window.history.replaceState({ appBaseSet: true, page: 'home' }, '', '/');
        window.history.pushState({ appBaseSet: true, page: 'current' }, '', currentUrl);
      } else {
        window.history.replaceState({ appBaseSet: true, page: 'home' }, '');
      }
    }
  }, []);

  const fetchBalance = useCallback(() => {
    if (token) {
      getWalletBalance().then(w => setBalance(w.balance)).catch(() => { });
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (token) {
      try {
        const data = await getUserNotifications();
        setNotifications(data);
      } catch { }
    }
  }, [token]);

  useEffect(() => {
    if (user?.email) {
      initRealtimeSync(user.email);
    } else {
      initRealtimeSync();
    }
  }, [user?.email]);

  useEffect(() => {
    if (!token) return;

    // Run initial data fetching concurrently
    Promise.allSettled([
      getWalletBalance().then(w => setBalance(w.balance)),
      getUserNotifications().then(data => setNotifications(data)),
      API.get('/users/me').then(res => {
        if (res.data) {
          localStorage.setItem('user', JSON.stringify(res.data));
          setUser(res.data);
        }
      })
    ]).catch(() => {});

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const handleWalletUpdated = (e: any) => {
      fetchBalance();
      if (e?.detail?.data?.balance !== undefined) {
        setBalance(e.detail.data.balance);
      }
    };

    const handleNotificationsUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener('walletUpdated', handleWalletUpdated);
    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);
    const interval = setInterval(fetchNotifications, 30000);

    return () => {
      window.removeEventListener('walletUpdated', handleWalletUpdated);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
      clearInterval(interval);
    };
  }, [token, fetchBalance, fetchNotifications]);

  useEffect(() => {
    const handleBlocked = () => setIsBlocked(true);
    const handleUnblocked = () => setIsBlocked(false);

    window.addEventListener('userBlocked', handleBlocked);
    window.addEventListener('userUnblocked', handleUnblocked);

    return () => {
      window.removeEventListener('userBlocked', handleBlocked);
      window.removeEventListener('userUnblocked', handleUnblocked);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userBlocked');
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-textPrimary flex flex-col">
        {/* Professional Navbar */}
        <header className="h-16 border-b border-borderColor bg-background/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8">
          <Link to="/" className="text-xl font-bold font-display flex items-center gap-2 group">
            <img src={logo} alt="Esports Arena Logo" className="w-8 h-8 object-contain rounded drop-shadow-[0_0_8px_rgba(255,90,31,0.5)]" />
            <span className="hidden sm:inline tracking-wider">
              ESPORTS <span className="text-primary font-black">ARENA</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-textSecondary">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2"><LayoutDashboard size={16} /> Home</Link>
            <Link to="/tournaments" className="hover:text-primary transition-colors flex items-center gap-2"><Trophy size={16} /> Tournaments</Link>
            {token && user && (
              <Link to="/tournaments?mode=registered" className="text-textSecondary hover:text-emerald-400 transition-colors flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> My Tournaments
              </Link>
            )}
            <Link to="/tournaments?mode=live" className="text-secondary hover:text-secondary-hover transition-colors flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-red-sm animate-pulse"></span> Live
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {token && user ? (
              <div className="flex items-center gap-2 sm:gap-6">
                {/* Wallet Balance Pill */}
                <Link to="/wallet" className="flex items-center gap-1.5 sm:gap-2 bg-elevated hover:bg-surface border border-borderColor px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition-all cursor-pointer text-xs sm:text-sm hover:border-primary/50 group">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <IndianRupee size={12} className="text-primary" />
                  </div>
                  <span className="text-white font-bold">
                    ₹{balance !== null ? balance.toFixed(2) : '...'}
                  </span>
                </Link>

                {/* Notifications Bell Dropdown */}
                {token && user && (
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(!isNotificationsOpen);
                        setIsProfileDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                      className="relative p-2 text-textSecondary hover:text-white bg-elevated hover:bg-surface border border-borderColor rounded-full transition-colors cursor-pointer"
                    >
                      <Bell size={18} />
                      {notifications.filter(n => !n.read && !n.isRead).length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-background shadow-red-sm animate-pulse">
                          {notifications.filter(n => !n.read && !n.isRead).length}
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="fixed inset-x-4 top-16 sm:absolute sm:inset-auto sm:right-0 sm:mt-2 w-auto sm:w-80 bg-elevated border border-borderColor rounded-xl shadow-card-dark overflow-hidden z-50 flex flex-col max-h-96">
                        <div className="p-3 border-b border-borderColor flex items-center justify-between bg-card">
                          <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Bell size={13} className="text-primary" /> Notifications
                          </span>
                          {notifications.filter(n => !n.read && !n.isRead).length > 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  await markAllNotificationsAsRead();
                                  fetchNotifications();
                                } catch { }
                              }}
                              className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                          <div className="bg-primary/10 border-b border-borderColor px-3 py-2 flex items-center justify-between text-xs">
                            <span className="text-textSecondary text-[11px]">Enable sound & push alerts</span>
                            <button
                              onClick={async () => {
                                await requestNotificationPermission();
                                playNotificationSound();
                              }}
                              className="px-2.5 py-1 rounded-md bg-primary text-white text-[10px] font-bold hover:brightness-110 shadow-fire-sm transition-all cursor-pointer"
                            >
                              Enable 🔔
                            </button>
                          </div>
                        )}
                        <div className="flex-1 overflow-y-auto divide-y divide-borderColor/60 custom-scrollbar">
                          {notifications.length === 0 ? (
                            <p className="text-textSecondary text-xs text-center py-6">No notifications yet.</p>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                className={`p-3 text-xs text-left transition-colors ${!n.read && !n.isRead ? 'bg-card/90 border-l-2 border-primary' : 'hover:bg-card/50'}`}
                              >
                                <p className={`font-semibold mb-1 ${!n.read && !n.isRead ? 'text-white' : 'text-textSecondary'}`}>
                                  {n.title}
                                </p>
                                <p className="text-textSecondary text-[11px] leading-relaxed whitespace-pre-wrap">{n.message}</p>
                                <p className="text-[9px] text-textSecondary/60 mt-1">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Section */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                      setIsNotificationsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 hover:bg-surfaceHighlight/50 p-1 pr-1 sm:pr-3 rounded-full transition-colors cursor-pointer border border-transparent hover:border-borderColor"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/50 bg-surfaceHighlight flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img src={getImageUrl(user.avatarUrl)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} className="text-textSecondary" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-white text-sm font-semibold leading-none mb-1">{user.gameName || user.email.split('@')[0]}</p>
                      <p className="text-primary text-[10px] font-bold uppercase tracking-wider leading-none">Player</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-elevated border border-borderColor rounded-xl shadow-card-dark overflow-hidden z-50 py-1">
                      <Link to="/" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-card transition-colors flex items-center justify-between">
                        <span>Home</span> <LayoutDashboard size={14} className="text-primary" />
                      </Link>
                      <Link to="/profile/edit" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-card transition-colors">Edit Profile</Link>
                      <Link to="/profile/history" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-card transition-colors">History</Link>
                      <Link to="/wallet" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-card transition-colors">Transactions</Link>
                      <Link to="/support" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-textSecondary hover:text-white hover:bg-card transition-colors flex items-center justify-between">
                        <span>Help & Support</span> <HelpCircle size={14} className="text-primary" />
                      </Link>
                      {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_SUPER_ADMIN') && (
                        <>
                          <div className="border-t border-borderColor my-1"></div>
                          <Link to="/admin/dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="block px-4 py-2.5 text-sm text-primary font-bold hover:bg-primary/10 transition-colors">
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <div className="border-t border-borderColor my-1"></div>
                      <button
                        onClick={() => { setIsProfileDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:bg-secondary/10 font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/login" className="text-xs sm:text-sm font-semibold text-textSecondary hover:text-white transition-colors flex items-center gap-2">
                  Sign In
                </Link>
                <Link to="/signup" className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary to-[#FF733B] text-white px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-lg shadow-fire-sm hover:shadow-fire-md hover:brightness-110 transition-all whitespace-nowrap">
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Sign Up</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsNotificationsOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="md:hidden p-2 text-textSecondary hover:text-white bg-elevated hover:bg-surface border border-borderColor rounded-lg transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Full-screen click-outside backdrop overlay for profile & notification dropdowns */}
        {(isNotificationsOpen || isProfileDropdownOpen) && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsProfileDropdownOpen(false);
            }}
            onTouchStart={() => {
              setIsNotificationsOpen(false);
              setIsProfileDropdownOpen(false);
            }}
          />
        )}

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 inset-x-0 bg-background/98 backdrop-blur-md border-b border-borderColor z-40 flex flex-col p-5 gap-1 md:hidden animate-fade-in shadow-card-dark">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors flex items-center gap-2.5 py-3 px-3 rounded-lg hover:bg-card text-textSecondary font-semibold"
            >
              <LayoutDashboard size={18} /> Home
            </Link>
            <Link
              to="/tournaments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors flex items-center gap-2.5 py-3 px-3 rounded-lg hover:bg-card text-textSecondary font-semibold"
            >
              <Trophy size={18} /> Tournaments
            </Link>
            {token && user && (
              <Link
                to="/tournaments?mode=registered"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-textSecondary hover:text-emerald-400 transition-colors flex items-center gap-2.5 py-3 px-3 rounded-lg hover:bg-card font-semibold"
              >
                <CheckCircle size={18} className="text-emerald-400" /> My Tournaments
              </Link>
            )}
            <Link
              to="/tournaments?mode=live"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-secondary hover:text-secondary-hover transition-colors flex items-center gap-2.5 py-3 px-3 rounded-lg hover:bg-card font-bold"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-red-sm animate-pulse"></span> Live Tournaments
            </Link>
          </div>
        )}

        <main className="flex-grow">
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading Esports Arena..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/tournaments" element={<TournamentList />} />
              <Route path="/create-team" element={<CreateTeam />} />
              <Route path="/teams/:id" element={<TeamDetails />} />
              <Route path="/match/:id" element={<LiveMatch />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tournaments/create" element={<AdminTournamentCreate />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/history" element={<MatchHistory />} />
              <Route path="/wallet" element={<WalletDashboard />} />
              <Route path="/support" element={<Support />} />
              <Route path="/request-super-admin" element={<MakeSuperAdminPage />} />
              <Route path="/request-super-admin/*" element={<MakeSuperAdminPage />} />
              <Route path="/make-super-admin" element={<MakeSuperAdminPage />} />
              <Route path="/make-super-admin/*" element={<MakeSuperAdminPage />} />
            </Routes>
          </Suspense>
        </main>

        {isBlocked && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-surfaceHighlight border border-secondary/30 rounded-xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-secondary"></div>
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6 text-secondary">
                <ShieldAlert size={36} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Account Blocked</h2>
              <p className="text-textSecondary text-sm mb-6 leading-relaxed">
                Your account has been blocked by an administrator. You cannot perform any actions at this time.
                <br /><br />
                Please <strong className="text-white">contact customer support</strong> for assistance.
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-4 bg-secondary hover:bg-secondary/80 text-white rounded-md transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={16} /> Log Out
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
