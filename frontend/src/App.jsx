import React from 'react';
// --- ĐÃ XÓA BỎ "BrowserRouter as Router" KHỎI ĐÂY ---
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StoreInitializer from './components/StoreInitializer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import TransferPage from './pages/TransferPage';
import StakingPage from './pages/StakingPage';
import LoansPage from './pages/LoansPage';
import GovernancePage from './pages/GovernancePage';
import SwapPage from './pages/SwapPage';
import BridgePage from './pages/BridgePage';
import ReferralPage from './pages/ReferralPage';
import SupportTicketPage from './pages/SupportTicketPage';
import StrategyVaultsPage from './pages/StrategyVaultsPage';
// --- CÁC TRANG ĐƯỢC BỔ SUNG ---
import ApiKeysPage from './pages/ApiKeysPage';
import InvoicesPage from './pages/InvoicesPage';
import ScheduledTransactionsPage from './pages/ScheduledTransactionsPage';
import SettingsPage from './pages/SettingsPage';
import TiersPage from './pages/TiersPage';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#9b59b6',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* --- ĐÃ XÓA BỎ COMPONENT <Router> KHỎI ĐÂY --- */}
      <StoreInitializer />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
            <Route path="/staking" element={<ProtectedRoute><StakingPage /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />
            <Route path="/governance" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />
            <Route path="/swap" element={<ProtectedRoute><SwapPage /></ProtectedRoute>} />
            <Route path="/bridge" element={<ProtectedRoute><BridgePage /></ProtectedRoute>} />
            <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportTicketPage /></ProtectedRoute>} />
            <Route path="/strategy-vaults" element={<ProtectedRoute><StrategyVaultsPage /></ProtectedRoute>} />
            {/* --- CÁC ĐƯỜNG DẪN ĐƯỢC BỔ SUNG --- */}
            <Route path="/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
            <Route path="/scheduled-transactions" element={<ProtectedRoute><ScheduledTransactionsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/tiers" element={<ProtectedRoute><TiersPage /></ProtectedRoute>} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            
            {/* Redirect any unknown paths */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;