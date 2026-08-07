import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, IndianRupee, Clock, Plus, ShieldCheck, Copy, Check, Landmark, Smartphone } from 'lucide-react';
import { getWalletBalance, getTransactionHistory, depositFunds, withdrawFunds, getPublicPaymentSettings } from '../services/walletService';
import type { Wallet, Transaction, PaymentSettings } from '../services/walletService';
import { getImageUrl } from '../services/api';
import logo from '../assets/obitoloo.png';
import qrImage from '../assets/QR.jpeg';

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
    return <ArrowUpRight className="text-rose-400" size={20} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.img 
          src={logo}
          alt="Loading..."
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
          className="w-12 h-12 object-contain" 
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Wallet & Payments</h1>
          <p className="text-textSecondary text-sm mt-1">Manage your funds and view transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-2 glass-panel p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <WalletIcon size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-textSecondary text-sm font-semibold uppercase tracking-wider mb-2">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <IndianRupee size={32} className="text-primary" />
              <h2 className="text-5xl font-bold text-white font-display tracking-tight">
                {wallet?.balance.toFixed(2) || '0.00'}
              </h2>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => {
                  setDepositAmount('');
                  setUtrNumber('');
                  setDepositStep('amount');
                  setShowDepositModal(true);
                }}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
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
                className="bg-surfaceHighlight hover:bg-white/10 border border-white/10 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors flex items-center gap-2 cursor-pointer"
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
          className="glass-panel p-6 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Secure Payments</h3>
            <p className="text-textSecondary text-sm">All transactions are secured with enterprise-grade encryption. Instant deposits and fast withdrawals.</p>
          </div>
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surfaceHighlight/30">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Clock size={18} className="text-primary" /> Recent Transactions
          </h3>
        </div>
        
        <div className="divide-y divide-white/5">
          {transactions.length === 0 ? (
            <div className="p-12 text-center text-textSecondary">
              <p>No transactions found.</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' 
                      ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`}>
                    {getTransactionIcon(tx.transactionType)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">{tx.description}</p>
                    <p className="text-textSecondary text-xs">{formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold font-display ${
                    tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' 
                      ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {tx.transactionType === 'DEPOSIT' || tx.transactionType === 'PRIZE' ? '+' : '-'}
                    ₹{tx.amount.toFixed(2)}
                  </p>
                  <p className={`text-xs mt-1 flex items-center justify-end ${
                    tx.status === 'PENDING' ? 'text-rose-400 font-semibold' :
                    tx.status === 'SUCCESS' ? 'text-emerald-400 font-semibold' : 'text-textSecondary'
                  }`}>
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
                      tx.status === 'PENDING' ? 'bg-rose-500 animate-pulse' :
                      tx.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-white/20'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-6 relative"
          >
            <button 
              onClick={() => setShowDepositModal(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Add Funds</h3>
            
            {depositStep === 'amount' && (
              <div>
                <div className="mb-6">
                  <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Amount (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee size={18} className="text-textSecondary" />
                    </div>
                    <input 
                      type="number" 
                      min="10"
                      step="1"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-md py-4 pl-12 pr-4 text-white text-lg font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      placeholder="Enter amount (e.g. 500)"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    {[100, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(amt.toString())}
                        className="flex-1 py-2 bg-surfaceHighlight hover:bg-white/10 rounded border border-white/5 text-sm text-textSecondary hover:text-white transition-colors cursor-pointer"
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
                  <p className="text-3xl font-bold font-display text-white mb-4">₹{Number(depositAmount).toFixed(2)}</p>
                  
                  {/* Dynamic QR Code */}
                  <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow-xl border border-white/10">
                    <img 
                      src={paymentSettings.upiQrUrl ? getImageUrl(paymentSettings.upiQrUrl) : qrImage} 
                      alt="UPI QR Code" 
                      className="w-36 h-36 object-contain" 
                    />
                  </div>

                  <p className="text-textSecondary text-[11px] max-w-xs mx-auto mb-4">
                    Scan the QR code using Google Pay, PhonePe, Paytm, or any BHIM UPI app on your phone.
                  </p>

                  <div className="bg-background rounded-lg border border-white/10 p-2.5 flex items-center justify-between max-w-sm mx-auto mb-6">
                    <div className="text-left pl-1.5">
                      <span className="block text-[9px] uppercase tracking-wider text-textSecondary font-semibold">Merchant UPI ID</span>
                      <span className="block text-xs text-white font-medium">{paymentSettings.upiId}</span>
                    </div>
                    <button 
                      onClick={copyUpiId}
                      className="bg-surfaceHighlight hover:bg-white/10 border border-white/10 text-white p-2 rounded transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedUpi ? (
                        <>
                          <Check size={12} className="text-emerald-400" /> <span className="text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verification Form */}
                  <form onSubmit={handleDeposit} className="text-left border-t border-white/5 pt-4">
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Enter 12-Digit UPI UTR / Ref No.</label>
                    <input 
                      type="text" 
                      required
                      maxLength={12}
                      minLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-white/10 rounded-md py-3 px-4 text-white text-center font-display tracking-widest text-lg font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-2"
                      placeholder="e.g. 523412345678"
                    />
                    <span className="block text-[10px] text-textSecondary mb-4 leading-relaxed">
                      *Please pay exactly <strong className="text-white">₹{depositAmount}</strong>. Locate the 12-digit UTR/UPI Ref number in your payment receipt and enter it above to credit funds.
                    </span>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setDepositStep('amount')}
                        className="flex-1 py-3 bg-surfaceHighlight hover:bg-white/10 text-white font-semibold rounded-md border border-white/10 transition-colors text-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-md p-6 relative"
          >
            <button 
              onClick={() => setShowWithdrawModal(false)}
              className="absolute top-4 right-4 text-textSecondary hover:text-white cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Withdraw Funds</h3>
            
            <div className="flex border-b border-white/10 mb-6">
              <button 
                type="button"
                onClick={() => { setWithdrawMethod('UPI'); setWithdrawError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${withdrawMethod === 'UPI' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
              >
                Withdraw via UPI
              </button>
              <button 
                type="button"
                onClick={() => { setWithdrawMethod('BANK'); setWithdrawError(''); }}
                className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${withdrawMethod === 'BANK' ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-white'}`}
              >
                Withdraw via Bank
              </button>
            </div>

            {withdrawError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-xs">
                {withdrawError}
              </div>
            )}

            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <IndianRupee size={16} className="text-textSecondary" />
                  </div>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-md py-3 pl-10 pr-4 text-white text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter amount to withdraw"
                  />
                </div>
                {wallet && (
                  <span className="block text-[10px] text-textSecondary mt-1">
                    Available balance: ₹{wallet.balance.toFixed(2)}
                  </span>
                )}
              </div>

              {withdrawMethod === 'UPI' ? (
                <div className="mb-6">
                  <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">UPI ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Smartphone size={16} className="text-textSecondary" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={withdrawUpiId}
                      onChange={(e) => setWithdrawUpiId(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-md py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. yourname@upi"
                    />
                  </div>
                  <span className="block text-[9px] text-textSecondary mt-1 leading-normal">
                    *Ensure you enter the correct UPI ID linked to your bank account. Funds are transferred instantly.
                  </span>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Account Holder Name</label>
                    <input 
                      type="text" 
                      required
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      className="w-full bg-background border border-white/10 rounded-md py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Bank Account Number</label>
                    <input 
                      type="text" 
                      required
                      value={bankAccNumber}
                      onChange={(e) => setBankAccNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-white/10 rounded-md py-2.5 px-3.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="Enter bank account number"
                    />
                  </div>
                  <div>
                    <label className="block text-textSecondary text-xs font-semibold mb-2 uppercase tracking-wider">Bank IFSC Code</label>
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
                        className="w-full bg-background border border-white/10 rounded-md py-2.5 pl-10 pr-3.5 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono tracking-wider"
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
