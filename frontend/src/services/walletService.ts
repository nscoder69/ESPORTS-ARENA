import api from './api';

export interface Wallet {
    id: string;
    balance: number;
}

export interface Transaction {
    id: string;
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TOURNAMENT_FEE' | 'PRIZE';
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    description: string;
    createdAt: string;
}

export const getWalletBalance = async (): Promise<Wallet> => {
    const response = await api.get('/wallet');
    return response.data;
};

export const getTransactionHistory = async (): Promise<Transaction[]> => {
    const response = await api.get('/wallet/transactions');
    return response.data;
};

export const depositFunds = async (amount: number, paymentReference: string): Promise<Wallet> => {
    const response = await api.post('/wallet/deposit', { amount, paymentReference });
    return response.data;
};

export interface RazorpayOrder {
    orderId: string;
    amount: number;
    currency: string;
    receipt: string;
}

export interface RazorpayVerificationRequest {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
}

export const createRazorpayOrder = async (amount: number): Promise<RazorpayOrder> => {
    const response = await api.post('/wallet/razorpay-order', { amount });
    return response.data;
};

export const verifyRazorpayPayment = async (request: RazorpayVerificationRequest): Promise<Wallet> => {
    const response = await api.post('/wallet/verify-payment', request);
    return response.data;
};

export interface WithdrawRequest {
    amount: number;
    method: 'UPI' | 'BANK';
    upiId?: string;
    accountNumber?: string;
    accountHolderName?: string;
    ifscCode?: string;
}

export const withdrawFunds = async (request: WithdrawRequest): Promise<Wallet> => {
    const response = await api.post('/wallet/withdraw', request);
    return response.data;
};

export const getUserTransactionHistory = async (userId: string): Promise<Transaction[]> => {
    const response = await api.get(`/wallet/user/${userId}/transactions`);
    return response.data;
};

export const getUserWalletBalance = async (userId: string): Promise<Wallet> => {
    const response = await api.get(`/wallet/user/${userId}/balance`);
    return response.data;
};

export const getPendingDeposits = async (): Promise<Transaction[]> => {
    const response = await api.get('/wallet/admin/pending-deposits');
    return response.data;
};

export const verifyPendingDeposit = async (transactionId: string, approve: boolean): Promise<Wallet> => {
    const response = await api.put(`/wallet/admin/verify-deposit/${transactionId}?approve=${approve}`);
    return response.data;
};

export const getPendingWithdrawals = async (): Promise<Transaction[]> => {
    const response = await api.get('/wallet/admin/pending-withdrawals');
    return response.data;
};

export const verifyPendingWithdrawal = async (transactionId: string, approve: boolean): Promise<Wallet> => {
    const response = await api.put(`/wallet/admin/verify-withdrawal/${transactionId}?approve=${approve}`);
    return response.data;
};

export interface PaymentSettings {
    upiId: string;
    upiQrUrl: string;
}

export const getPublicPaymentSettings = async (): Promise<PaymentSettings> => {
    const response = await api.get('/public/settings/payment');
    return response.data;
};

export const updatePaymentSettings = async (formData: FormData): Promise<PaymentSettings> => {
    const response = await api.post('/admin/settings/payment', formData);
    return response.data;
};

export const getAllAdmins = async (): Promise<any[]> => {
    const response = await api.get('/users/admins');
    return response.data;
};

export const updateUserRoleAndPermissions = async (userId: string, role: string, permissions: string): Promise<any> => {
    const response = await api.put(`/users/${userId}/role`, { role, permissions });
    return response.data;
};

export const confirmSuperAdminPromotion = async (userId: string, confirmationCode: string): Promise<any> => {
    const response = await api.post(`/users/${userId}/confirm-super-admin`, { confirmationCode });
    return response.data;
};
