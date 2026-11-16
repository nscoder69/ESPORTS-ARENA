import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, IndianRupee, Clock, Plus, ShieldCheck, Copy, Check, Landmark, Smartphone, Flame } from 'lucide-react';
import { getWalletBalance, getTransactionHistory, depositFunds, withdrawFunds, getPublicPaymentSettings } from '../services/walletService';
import type { Wallet, Transaction, PaymentSettings } from '../services/walletService';
import { getImageUrl } from '../services/api';
import qrImage from '../assets/QR.jpeg';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WalletDashboard() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ upiId: 'ultimatebackup112-1@okaxis', upiQrUrl: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Deposit States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositStep, setDepositStep] = useState<'amount' | 'upi-qr'>('amount');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Withdrawal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [withdrawUpiId, setWithdrawUpiId] = useState('');
  const [bankAccNumber, setBankAccNumber] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const fetchPaymentSettings = async () => {
    try {
      const settings = await getPublicPaymentSettings();
      if (settings) {
        setPaymentSettings(settings);
      }
    } catch (err) {
      console.error("Failed to fetch payment settings", err);
    }
  };

  useEffect(() => {
    fetchWalletData();
    fetchPaymentSettings();

    const handleRealtimeWalletUpdate = () => {
      fetchWalletData();
    };

    window.addEventListener('walletUpdated', handleRealtimeWalletUpdate);

    return () => {
      window.removeEventListener('walletUpdated', handleRealtimeWalletUpdate);
    };
  }, []);

  useEffect(() => {
    if (showDepositModal) {
      fetchPaymentSettings();
    }
  }, [showDepositModal]);

  const fetchWalletData = async () => {
    try {
      const [walletData, transactionsData] = await Promise.all([
        getWalletBalance().catch(() => null),
        getTransactionHistory().catch(() => [])
      ]);
      
      if (walletData) setWallet(walletData);
      if (transactionsData) setTransactions(transactionsData);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    if (!utrNumber || utrNumber.length !== 12 || isNaN(Number(utrNumber))) return;
    
    setIsProcessing(true);
    try {
      const updatedWallet = await depositFunds(Number(depositAmount), utrNumber);
      setWallet(updatedWallet);
      setShowDepositModal(false);
      setDepositAmount('');
      setUtrNumber('');
      setDepositStep('amount');
      // Refresh transactions
      const newTransactions = await getTransactionHistory();
      setTransactions(newTransactions);
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (error) {
      console.error("Deposit failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (wallet && amount > wallet.balance) {
      setWithdrawError('Insufficient balance.');
      return;
    }

    if (withdrawMethod === 'UPI') {
      if (!withdrawUpiId || !withdrawUpiId.includes('@')) {
        setWithdrawError('Please enter a valid UPI ID (e.g. name@upi).');
        return;
      }
    } else {
      if (!bankAccNumber || bankAccNumber.length < 9) {
        setWithdrawError('Please enter a valid account number.');
        return;
      }
      if (!bankHolderName) {
        setWithdrawError('Please enter account holder name.');
        return;
      }
      if (!bankIfscCode || bankIfscCode.length !== 11) {
        setWithdrawError('Please enter a valid 11-digit IFSC code.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      const updatedWallet = await withdrawFunds({
        amount,
        method: withdrawMethod,
        upiId: withdrawMethod === 'UPI' ? withdrawUpiId : undefined,
        accountNumber: withdrawMethod === 'BANK' ? bankAccNumber : undefined,
        accountHolderName: withdrawMethod === 'BANK' ? bankHolderName : undefined,
        ifscCode: withdrawMethod === 'BANK' ? bankIfscCode : undefined
      });
      setWallet(updatedWallet);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawUpiId('');
      setBankAccNumber('');
      setBankHolderName('');
      setBankIfscCode('');
      // Refresh transactions
      const newTransactions = await getTransactionHistory();
      setTransactions(newTransactions);
      window.dispatchEvent(new Event('walletUpdated'));
    } catch (error: any) {
      console.error("Withdrawal failed", error);
      setWithdrawError(error.response?.data?.message || 'Withdrawal failed. Please check inputs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(paymentSettings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'DEPOSIT' || type === 'PRIZE') return <ArrowDownRight className="text-emerald-400" size={20} />;
    return <ArrowUpRight className="text-secondary" size={20} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen text="Loading Wallet & Balance..." />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Wallet & Payments</h1>
          <p className="text-textSecondary text-sm mt-1">Manage tournament funds, deposits, and winnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-2 bg-card border border-borderColor rounded-2xl p-8 relative overflow-hidden group shadow-card-dark"
        >
          <div className="absolute top-0 right-0 p-8 text-primary opacity-5 group-hover:opacity-10 transition-opacity">
            <WalletIcon size={140} />
          </div>
          <div className="relative z-10">
            <p className="text-textSecondary text-xs font-bold uppercase tracking-wider mb-2">Available Balance</p>
            <div className="flex items-baseline gap-1.5">
              <IndianRupee size={36} className="text-primary" />
              <h2 className="text-5xl font-extrabold text-white font-display tracking-tight drop-shadow-[0_0_12px_rgba(255,90,31,0.3)]">
                {wallet?.balance.toFixed(2) || '0.00'}
              </h2>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-3.5">
              <button 
                onClick={() => {
                  setDepositAmount('');
                  setUtrNumber('');
                  setDepositStep('amount');
                  setShowDepositModal(true);
                }}
                className="bg-gradient-to-r from-primary via-[#FF6A28] to-primary hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-fire-sm hover:shadow-fire-md cursor-pointer"
              >
                <Plus size={18} /> Add Funds
              </button>
              <button 
                onClick={() => {
                  setWithdrawAmount('');
                  setWithdrawUpiId('');
                  setBankAccNumber('');
                  setBankHolderName('');
                  setBankIfscCode('');
                  setWithdrawError('');
                  setShowWithdrawModal(true);
                }}
                className="bg-elevated hover:bg-surface border border-borderColor hover:border-primary/50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <ArrowUpRight size={18} /> Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-borderColor rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-card-dark"
        >
          <div>
            <div className="w-12 h-12 bg-gold/15 border border-gold/30 rounded-2xl flex items-center justify-center mb-4 shadow-gold-sm">
              <ShieldCheck size={24} className="text-gold" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Instant & Protected</h3>
            <p className="text-textSecondary text-xs sm:text-sm leading-relaxed">
              Every tournament fee and prize transfer is encrypted and directly credited to your account.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-borderColor/60 flex items-center gap-2 text-gold text-xs font-bold">
            <Flame size={14} /> 100% Secure Checkout
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-borderColor rounded-2xl overflow-hidden shadow-card-dark"
      >
        <div className="p-6 border-b border-borderColor flex items-center justify-between bg-elevated/60">
          <h3 className="text-white font-bold flex items-center gap-2 text-base">
            <Clock size={18} className="text-primary" /> Recent Transactions
          </h3>
        </div>
        
        <div className="divide-y divide-borderColor/60">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-textSecondary text-sm">
              <p>No transactions found.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 hover:bg-elevated/40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                    tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-secondary/10 border-secondary/20'
                  }`}>
                    {getTransactionIcon(tx.transactionType)}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm sm:text-base">{tx.description}</p>
                    <p className="text-textSecondary text-xs mt-0.5">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-extrabold font-display text-base ${
                    tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' 
                      ? 'text-emerald-400' : 'text-secondary'
                  }`}>
                    {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' ? '+' : '-'}
                    ₹{tx.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs mt-1 flex items-center justify-end font-semibold ${
                    tx.status === 'PENDING' ? 'text-secondary' :
                    tx.status === 'SUCCESS' ? 'text-emerald-400' : 'text-textSecondary'
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      tx.status === 'PENDING' ? 'bg-secondary shadow-red-sm animate-pulse' :
                      tx.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-textSecondary/30'
                    }`}></span>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-borderColor rounded-2xl shadow-card-dark w-full max-w-md p-6 sm:p-7 relative"
          >
            <button 
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold font-display text-white mb-6">Add Funds</h3>
            
            {depositStep === 'amount' && (
              <div>
                <div className="mb-6">
                  <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-primary" />
                    </div>
                    <input 
                      type="number" 
                      min="10"
                      step="1"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="input-field py-3.5 pl-12 pr-4 text-lg font-bold"
                      placeholder="Enter amount (e.g. 500)"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[100, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt.toString())}
                        className="flex-1 py-2 bg-elevated hover:bg-surface rounded-lg border border-borderColor hover:border-primary/50 text-xs font-bold text-textSecondary hover:text-white transition-colors cursor-pointer"
                      >
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    if (depositAmount && Number(depositAmount) >= 10) {
                      setDepositStep('upi-qr');
                    }
                  }}
                  disabled={!depositAmount || Number(depositAmount) < 10}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Proceed to Pay via UPI QR Code
                </button>
              </div>
            )}

            {depositStep === 'upi-qr' && (
              <div>
                <div className="mb-6 text-center">
                  <p className="text-textSecondary text-xs mb-1 uppercase tracking-wider">Amount to deposit</p>
                  <p className="text-3xl font-extrabold font-display text-gold mb-4 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]">₹{Number(depositAmount).toFixed(2)}</p>
                  
                  {/* Dynamic QR Code */}
                  <div className="bg-white p-3 rounded-2xl inline-block mb-4 shadow-xl border-2 border-primary/30">
                    <img 
                      src={paymentSettings.upiQrUrl ? getImageUrl(paymentSettings.upiQrUrl) : qrImage} 
                      alt="UPI QR Code" 
                      className="w-36 h-36 object-contain" 
                    />
                  </div>

                  <p className="text-textSecondary text-[11px] max-w-xs mx-auto mb-4 leading-relaxed">
                    Scan the QR code using Google Pay, PhonePe, Paytm, or any BHIM UPI app on your phone.
                  </p>

                  <div className="bg-inputBg rounded-xl border border-borderColor p-3 flex items-center justify-between max-w-sm mx-auto mb-6">
                    <div className="text-left pl-1.5">
                      <span className="block text-[9px] uppercase tracking-wider text-textSecondary font-bold">Merchant UPI ID</span>
                      <span className="block text-xs text-white font-mono font-bold">{paymentSettings.upiId}</span>
                    </div>
                    <button 
                      onClick={copyUpiId}
                      className="bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary p-2 rounded-lg transition-colors text-xs flex items-center gap-1.5 cursor-pointer shadow-fire-sm"
                    >
                      {copiedUpi ? (
                        <>
                          <Check size={12} className="text-emerald-400" /> <span className="text-[10px] font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> <span className="text-[10px] font-bold">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleDeposit} className="text-left border-t border-borderColor pt-4">
                    <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Enter 12-Digit UPI UTR / Ref No.</label>
                    <input 
                      type="text" 
                      required
                      maxLength={12}
                      minLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      className="input-field text-center font-mono tracking-widest text-lg font-bold mb-2"
                      placeholder="e.g. 523412345678"
                    />
                    <span className="block text-[10px] text-textSecondary mb-4 leading-relaxed">
                      *Please pay exactly <strong className="text-white">₹{depositAmount}</strong>. Locate the 12-digit UTR/UPI Ref number in your payment receipt and enter it above to credit funds.
                    </span>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setDepositStep('amount')}
                        className="flex-1 py-3 bg-elevated hover:bg-surface text-white font-bold rounded-lg border border-borderColor transition-colors text-sm cursor-pointer"
                      >
                        Back
                      </button>
                      <button 
                        type="submit"
                        disabled={isProcessing || utrNumber.length !== 12}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isProcessing ? 'Verifying...' : 'Verify & Add Cash'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-borderColor rounded-2xl shadow-card-dark w-full max-w-md p-6 sm:p-7 relative"
          >
            <button 
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold font-display text-white mb-6">Withdraw Funds</h3>
            
            <div className="flex border-b border-borderColor mb-6">
              <button 
                type="button"
                onClick={() => { setWithdrawMethod('UPI'); setWithdrawError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${withdrawMethod === 'UPI' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
              >
                Withdraw via UPI
              </button>
              <button 
                type="button"
                onClick={() => { setWithdrawMethod('BANK'); setWithdrawError(''); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${withdrawMethod === 'BANK' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
              >
                Withdraw via Bank
              </button>
            </div>

            {withdrawError && (
              <div className="mb-4 p-3 bg-secondary/15 border border-secondary/30 text-secondary rounded-xl text-xs font-semibold">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee size={16} className="text-primary" />
                  </div>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="input-field pl-10 pr-4 text-base font-bold"
                    placeholder="Enter amount to withdraw"
                  />
                </div>
                {wallet && (
                  <span className="block text-[11px] text-textSecondary mt-1">
                    Available balance: <strong className="text-white">₹{wallet.balance.toFixed(2)}</strong>
                  </span>
                )}
              </div>

              {withdrawMethod === 'UPI' ? (
                <div className="mb-6">
                  <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">UPI ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Smartphone size={16} className="text-textSecondary" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={withdrawUpiId}
                      onChange={(e) => setWithdrawUpiId(e.target.value)}
                      className="input-field pl-10 pr-4 text-sm font-mono"
                      placeholder="e.g. yourname@upi"
                    />
                  </div>
                  <span className="block text-[10px] text-textSecondary mt-1.5 leading-normal">
                    *Ensure you enter the correct UPI ID linked to your bank account. Funds are transferred instantly.
                  </span>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Account Holder Name</label>
                    <input 
                      type="text" 
                      required
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      className="input-field py-2.5 text-sm"
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Bank Account Number</label>
                    <input 
                      type="text" 
                      required
                      value={bankAccNumber}
                      onChange={(e) => setBankAccNumber(e.target.value.replace(/\D/g, ''))}
                      className="input-field py-2.5 text-sm font-mono"
                      placeholder="Enter bank account number"
                    />
                  </div>
                  <div>
                    <label className="block text-textSecondary text-xs font-bold mb-2 uppercase tracking-wider">Bank IFSC Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Landmark size={14} className="text-textSecondary" />
                      </div>
                      <input 
                        type="text" 
                        required
                        maxLength={11}
                        value={bankIfscCode}
                        onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                        className="input-field py-2.5 pl-10 pr-3.5 text-sm font-mono tracking-wider"
                        placeholder="e.g. SBIN0001234"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing || !withdrawAmount || Number(withdrawAmount) <= 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? 'Processing...' : `Withdraw ₹${withdrawAmount || '0'}`}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
