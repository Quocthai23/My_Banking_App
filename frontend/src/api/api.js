import axios from 'axios';

// API base URL, được cấu hình để proxy
const API_URL = '/api/v1';

// Tạo một instance của Axios
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Quan trọng để gửi cookie (cho refresh token)
  timeout: 15000,
});

// Các hàm trợ giúp để quản lý token
export const getAccessToken = () => localStorage.getItem('accessToken');
export const removeAccessToken = () => localStorage.removeItem('accessToken');

// Đặt header Authorization ban đầu nếu token tồn tại
const token = getAccessToken();
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Axios interceptor để tự động làm mới token
api.interceptors.response.use(
 (response) => response,
   async (error) => {
    const originalRequest = error.config;
    const path = originalRequest.url;

     if (error.response?.status === 401 && !originalRequest._retry && path !== '/users/login' && path !== '/users/refresh-token') {
      originalRequest._retry = true;
     try {
        const { data } = await api.post('/users/refresh-token');
        const { accessToken } = data;
 
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
 
        return api(originalRequest);
      } catch (refreshError) {
        removeAccessToken();
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const handleResponse = (res) => res.data;

// ===================================
// AUTH & USER
// ===================================
export const registerUser = (userData) => api.post('/users/register', userData).then(handleResponse);
export const loginUser = (credentials) => api.post('/users/login', credentials);
export const verifyLogin2FA = (data) => api.post('/users/login/verify-2fa', data);
export const logoutUser = () => api.post('/users/logout').then(handleResponse);
export const getUserProfile = () => api.get('/users/profile').then(handleResponse);
export const updateUserProfile = (userData) => api.put('/users/update', userData).then(handleResponse);
export const deleteUserAccount = (userIdToDelete) => api.delete(`/users/${userIdToDelete}`).then(handleResponse);
export const getBalance = () => api.get('/users/balance').then(handleResponse);
export const updateWalletAddress = (data) => api.put('/users/wallet', data).then(handleResponse);

// ===================================
// ACCOUNTS
// ===================================
export const createAccount = (accountData) => api.post('/accounts/create', accountData).then(handleResponse);
export const getAccounts = () => api.get('/accounts').then(handleResponse);
export const closeAccount = (accountId) => api.delete(`/accounts/close/${accountId}`).then(handleResponse);

// ===================================
// TRANSACTIONS
// ===================================
export const getTransactionHistory = () => api.get('/transactions/history').then(handleResponse);
export const transferFunds = (transferData) => api.post('/transactions/transfer', transferData).then(handleResponse);
export const depositFunds = (depositData) => api.post('/transactions/deposit', depositData).then(handleResponse);
export const withdrawFunds = (withdrawData) => api.post('/transactions/withdraw', withdrawData).then(handleResponse);

// ===================================
// LOANS (USER-FACING)
// ===================================
export const requestLoan = (loanData) => api.post('/loans/request', loanData).then(handleResponse);
export const getUserLoans = () => api.get('/loans').then(handleResponse);

// ===================================
// NFTs
// ===================================
export const getMyNfts = () => api.get('/nfts').then(handleResponse);

// ===================================
// SUPPORT TICKETS (USER-FACING)
// ===================================
export const createTicket = (ticketData) => api.post('/support-tickets', ticketData).then(handleResponse);
export const getMyTickets = () => api.get('/support-tickets').then(handleResponse);
export const getTicketDetails = (ticketId) => api.get(`/support-tickets/${ticketId}`).then(handleResponse);
export const addMessageToTicket = (ticketId, messageData) => api.post(`/support-tickets/${ticketId}/messages`, messageData).then(handleResponse);

// ===================================
// PORTFOLIO
// ===================================
export const getPortfolio = () => api.get('/portfolio').then(handleResponse);

// ===================================
// GOVERNANCE
// ===================================
export const getProposals = () => api.get('/governance/proposals').then(handleResponse);
export const createProposal = (proposalData) => api.post('/governance/proposals', proposalData).then(handleResponse);
export const castVote = (proposalId, voteData) => api.post(`/governance/proposals/${proposalId}/vote`, voteData).then(handleResponse);

// ===================================
// SWAP
// ===================================
export const getSwapQuote = (params) => api.get('/swap/quote', { params }).then(handleResponse);
export const getSwapTransactionData = (swapData) => api.post('/swap/transaction', swapData).then(handleResponse);

// ===================================
// STAKING
// ===================================
export const getStakingVaults = () => api.get('/staking/vaults').then(handleResponse);
export const getMyStakes = () => api.get('/staking/my-stakes').then(handleResponse);
export const stakeTokens = (stakeData) => api.post('/staking/stake', stakeData).then(handleResponse);
export const unstakeTokens = (stakeId) => api.post(`/staking/unstake/${stakeId}`).then(handleResponse);
export const getStakingVaultInfo = () => api.get('/staking/info').then(handleResponse);

// ===================================
// 2FA (TWO-FACTOR AUTH)
// ===================================
export const setup2FA = () => api.post('/2fa/setup').then(handleResponse);
export const verify2FA = (data) => api.post('/2fa/verify', data).then(handleResponse);
export const disable2FA = (data) => api.post('/2fa/disable', data).then(handleResponse);

// ===================================
// REFERRALS
// ===================================
export const getReferralInfo = () => api.get('/users/referral-info').then(handleResponse);

// ===================================
// NOTIFICATIONS
// ===================================
export const getNotifications = () => api.get('/notifications').then(handleResponse);
export const markNotificationAsRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`).then(handleResponse);

// ===================================
// TIERS
// ===================================
export const getAllTiers = () => api.get('/tiers').then(handleResponse);
export const getMyTier = () => api.get('/tiers/my-tier').then(handleResponse);

// ===================================
// API KEYS
// ===================================
export const createApiKey = (keyData) => api.post('/api-keys', keyData).then(handleResponse);
export const getApiKeys = () => api.get('/api-keys').then(handleResponse);
export const deleteApiKey = (keyId) => api.delete(`/api-keys/${keyId}`).then(handleResponse);

// ===================================
// BRIDGE
// ===================================
export const getBridgeQuote = (params) => api.get('/bridge/quote', { params }).then(handleResponse);
export const getBridgeTransactionData = (data) => api.post('/bridge/build-tx', data).then(handleResponse);
export const getBridgeStatus = (params) => api.get('/bridge/status', { params }).then(handleResponse);

// ===================================
// INVOICES
// ===================================
export const createInvoice = (invoiceData) => api.post('/invoices', invoiceData).then(handleResponse);
export const getInvoices = () => api.get('/invoices').then(handleResponse);
export const getPublicInvoice = (shortId) => api.get(`/invoices/${shortId}`).then(handleResponse);
export const confirmInvoicePayment = (shortId, data) => api.post(`/invoices/${shortId}/confirm`, data).then(handleResponse);
export const cancelInvoice = (shortId) => api.patch(`/invoices/${shortId}/cancel`).then(handleResponse);

// ===================================
// SCHEDULED TRANSACTIONS
// ===================================
export const scheduleTransaction = (txData) => api.post('/scheduled-transactions', txData).then(handleResponse);
export const getScheduledTransactions = () => api.get('/scheduled-transactions').then(handleResponse);
export const cancelScheduledTransaction = (id) => api.delete(`/scheduled-transactions/${id}`).then(handleResponse);

// ===================================
// STRATEGY VAULTS
// ===================================
export const getStrategyVaults = () => api.get('/strategy-vaults').then(handleResponse);
export const getMyStrategyVaultDeposits = () => api.get('/strategy-vaults/my-deposits').then(handleResponse);
export const depositToStrategyVault = (data) => api.post('/strategy-vaults/deposit', data).then(handleResponse);

// ===================================
// ADMIN
// ===================================
export const getAdminDashboardStats = () => api.get('/admin/stats').then(handleResponse);
export const getAllUsersForAdmin = () => api.get('/admin/users').then(handleResponse);
export const getUserDetailsForAdmin = (userId) => api.get(`/admin/users/${userId}`).then(handleResponse);
export const getAllTransactionsForAdmin = () => api.get('/admin/transactions').then(handleResponse);
export const getAllLoansForAdmin = () => api.get('/admin/loans').then(handleResponse);
export const approveLoanAdmin = (loanId) => api.post(`/admin/loans/${loanId}/approve`).then(handleResponse);
export const rejectLoanAdmin = (loanId) => api.post(`/admin/loans/${loanId}/reject`).then(handleResponse);
export const getAuditLogsForAdmin = () => api.get('/admin/audit-logs').then(handleResponse);
export const getAllTicketsForAdmin = () => api.get('/admin/tickets').then(handleResponse);
export const getTicketDetailsForAdmin = (ticketId) => api.get(`/admin/tickets/${ticketId}`).then(handleResponse);
export const replyToTicketAdmin = (ticketId, message) => api.post(`/admin/tickets/${ticketId}/reply`, { message }).then(handleResponse);
export const changeTicketStatusAdmin = (ticketId, status) => api.patch(`/admin/tickets/${ticketId}/status`, { status }).then(handleResponse);
export const createStakingVaultAdmin = (vaultData) => api.post('/staking/vaults', vaultData).then(handleResponse);
export const createStrategyVaultAdmin = (vaultData) => api.post('/strategy-vaults', vaultData).then(handleResponse);

