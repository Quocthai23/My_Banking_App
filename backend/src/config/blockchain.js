const { ethers } = require('ethers');
const dotenv = require('dotenv');
const path = require('path');

// Tải biến môi trường một cách an toàn
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// --- 1. Tải Artifacts và Addresses ---
const governanceTokenArtifact = require('../../../contracts-config/GovernanceToken.json');
const stakingVaultArtifact = require('../../../contracts-config/StakingVault.json');
const loanContractArtifact = require('../../../contracts-config/LoanContract.json');

const governanceTokenAddress = require('../../../contracts-config/GovernanceTokenAddress.json').address;
const stakingVaultAddress = require('../../../contracts-config/StakingVaultAddress.json').address;
const loanContractAddress = require('../../../contracts-config/LoanContractAddress.json').address;

const erc20Tokens = require('../../../contracts-config/erc20.json');

// --- Helper Function ---
// SỬA LỖI: Thêm hàm helper để đọc ABI một cách an toàn, chấp nhận cả hai định dạng file
const getAbi = (artifact) => {
  if (Array.isArray(artifact)) {
    // Trường hợp 1: File JSON chỉ là một mảng ABI
    return artifact;
  }
  if (artifact && Array.isArray(artifact.abi)) {
    // Trường hợp 2: File JSON là một artifact object đầy đủ
    return artifact.abi;
  }
  throw new Error('Định dạng file artifact không hợp lệ hoặc không nhận diện được.');
};


// --- 2. Cấu hình Provider và Wallet ---
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_PROVIDER || 'http://127.0.0.1:8545/');

const privateKey = process.env.BANK_WALLET_PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Lỗi nghiêm trọng: Biến môi trường BANK_WALLET_PRIVATE_KEY không được định nghĩa.');
}
const wallet = new ethers.Wallet(privateKey, provider);

// --- 3. Khởi tạo Contract Instances một lần ---
const contracts = {
  governanceToken: new ethers.Contract(
    governanceTokenAddress,
    getAbi(governanceTokenArtifact), // Sử dụng hàm helper an toàn
    wallet
  ),
  stakingVault: new ethers.Contract(
    stakingVaultAddress,
    getAbi(stakingVaultArtifact), // Sử dụng hàm helper an toàn
    wallet
  ),
  loanContract: new ethers.Contract(
    loanContractAddress,
    getAbi(loanContractArtifact), // Sử dụng hàm helper an toàn
    wallet
  ),
};

// Hàm tiện ích để lấy một contract instance đã được khởi tạo
const getContract = (contractName) => {
  const instance = contracts[contractName];
  if (!instance) {
    throw new Error(`Contract '${contractName}' not found in blockchain config.`);
  }
  return instance;
};

// --- 4. Exports ---
module.exports = {
  provider,
  wallet,
  contracts,
  getContract,
  erc20Tokens,
};

