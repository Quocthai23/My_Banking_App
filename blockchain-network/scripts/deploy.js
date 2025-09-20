import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Sửa lỗi: Thêm lại logic để có __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const { ethers } = hre;
    // SỬA LỖI: Lấy hàm parseEther trực tiếp từ ethers để đảm bảo cú pháp đúng
    const { parseEther } = ethers;
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const configDir = path.join(__dirname, "../../contracts-config");
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    // --- 1. Deploy GovernanceToken (làm token chính và mẫu cho ERC20) ---
    console.log("\nDeploying GovernanceToken...");
    const GovernanceTokenFactory = await ethers.getContractFactory("GovernanceToken");
    
    const governanceToken = await GovernanceTokenFactory.deploy(deployer.address);
    await governanceToken.waitForDeployment();
    const governanceTokenAddress = await governanceToken.getAddress();
    console.log("GovernanceToken deployed to:", governanceTokenAddress);
    saveDeploymentInfo("GovernanceToken", governanceToken);

    // --- 1.5. Deploy các Mock ERC20 Tokens cho môi trường local ---
    console.log("\nDeploying Mock ERC20 tokens for local development...");
    const erc20Tokens = {};

    const daiToken = await GovernanceTokenFactory.deploy(deployer.address);
    await daiToken.waitForDeployment();
    erc20Tokens.DAI = await daiToken.getAddress();
    console.log("Mock DAI token deployed to:", erc20Tokens.DAI);

    const usdcToken = await GovernanceTokenFactory.deploy(deployer.address);
    await usdcToken.waitForDeployment();
    erc20Tokens.USDC = await usdcToken.getAddress();
    console.log("Mock USDC token deployed to:", erc20Tokens.USDC);

    const wethToken = await GovernanceTokenFactory.deploy(deployer.address);
    await wethToken.waitForDeployment();
    erc20Tokens.WETH = await wethToken.getAddress();
    console.log("Mock WETH token deployed to:", erc20Tokens.WETH);

    saveErc20Config(erc20Tokens);

    // --- 2. Deploy StakingVault ---
    console.log("\nDeploying StakingVault...");
    const StakingVaultFactory = await ethers.getContractFactory("StakingVault");
    const rewardRate = parseEther("0.1"); // Sử dụng hàm đã lấy ở trên
    const stakingVault = await StakingVaultFactory.deploy(governanceTokenAddress, governanceTokenAddress, rewardRate);
    await stakingVault.waitForDeployment();
    console.log("StakingVault deployed to:", await stakingVault.getAddress());
    saveDeploymentInfo("StakingVault", stakingVault);

    // --- 3. Deploy LoanContract ---
    console.log("\nDeploying LoanContract...");
    const LoanContractFactory = await ethers.getContractFactory("LoanContract");
    const treasuryAddress = deployer.address;
    const loanContract = await LoanContractFactory.deploy(governanceTokenAddress, treasuryAddress);
    await loanContract.waitForDeployment();
    console.log("LoanContract deployed to:", await loanContract.getAddress());
    saveDeploymentInfo("LoanContract", loanContract);
    
    console.log("\nDeployment complete and configuration files updated successfully!");
}

async function saveDeploymentInfo(contractName, contractInstance) {
    const configDir = path.join(__dirname, "../../contracts-config");
    const contractAddress = await contractInstance.getAddress();

    const addressFilePath = path.join(configDir, `${contractName}Address.json`);
    fs.writeFileSync(
        addressFilePath,
        JSON.stringify({ address: contractAddress }, null, 2)
    );
    console.log(`  - Wrote address to ${path.basename(addressFilePath)}`);

    const artifact = hre.artifacts.readArtifactSync(contractName);
    const artifactFilePath = path.join(configDir, `${contractName}.json`);
    fs.writeFileSync(artifactFilePath, JSON.stringify(artifact, null, 2));
    console.log(`  - Wrote artifact (including ABI) to ${path.basename(artifactFilePath)}`);
}

function saveErc20Config(erc20Tokens) {
    const configDir = path.join(__dirname, "../../contracts-config");
    const erc20FilePath = path.join(configDir, "erc20.json");
    fs.writeFileSync(erc20FilePath, JSON.stringify(erc20Tokens, null, 2));
    console.log(`  - Wrote ERC20 token addresses to erc20.json`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

