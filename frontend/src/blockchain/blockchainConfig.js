// --- NGUỒN CHÂN LÝ DUY NHẤT CHO CÁC HỢP ĐỒNG ---
// Tệp này import địa chỉ và ABI trực tiếp từ các tệp do Hardhat tạo ra.

// --- ĐÃ SỬA LỖI: Cập nhật đường dẫn tương đối để đi ngược lên 3 cấp ---

// Import artifact chứa ABI của các hợp đồng
import GovernanceToken from '../../../contracts-config/GovernanceToken.json';
import StakingVault from '../../../contracts-config/StakingVault.json';
import LoanContract from '../../../contracts-config/LoanContract.json';
import MyGovernor from '../../../contracts-config/MyGovernor.json';

// Lấy địa chỉ của các hợp đồng từ các tệp Address tương ứng
import governanceTokenAddress from '../../../contracts-config/GovernanceTokenAddress.json';
import stakingVaultAddress from '../../../contracts-config/StakingVaultAddress.json';
import loanContractAddress from '../../../contracts-config/LoanContractAddress.json';
import myGovernorAddress from '../../../contracts-config/MyGovernorAddress.json';


// --- Export tất cả cấu hình để frontend sử dụng ---

// Governance Token
export const GOVERNANCE_TOKEN_ADDRESS = governanceTokenAddress.address;
export const GOVERNANCE_TOKEN_ABI = GovernanceToken.abi;

// Staking Vault
export const STAKING_VAULT_ADDRESS = stakingVaultAddress.address;
export const STAKING_VAULT_ABI = StakingVault.abi;

// Loan Contract
export const LOAN_CONTRACT_ADDRESS = loanContractAddress.address;
export const LOAN_CONTRACT_ABI = LoanContract.abi;

// MyGovernor Contract
export const MY_GOVERNOR_ADDRESS = myGovernorAddress.address;
export const MY_GOVERNOR_ABI = MyGovernor.abi;
