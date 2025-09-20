const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Full Governance Cycle", function () {
    async function deployGovernanceFixture() {
        const [owner, voter1, voter2] = await ethers.getSigners();

        // 1. Triển khai các hợp đồng
        const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
        const governanceToken = await GovernanceToken.deploy(owner.address);
        await governanceToken.waitForDeployment();

        const TimelockController = await ethers.getContractFactory("TimelockController");
        const timelock = await TimelockController.deploy(3600, [], [], owner.address); // 1 giờ delay
        await timelock.waitForDeployment();

        const MyGovernor = await ethers.getContractFactory("MyGovernor");
        const governor = await MyGovernor.deploy(await governanceToken.getAddress(), await timelock.getAddress());
        await governor.waitForDeployment();

        // 2. Thiết lập vai trò
        const proposerRole = await timelock.PROPOSER_ROLE();
        const executorRole = await timelock.EXECUTOR_ROLE();
        const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

        await timelock.grantRole(proposerRole, await governor.getAddress());
        await timelock.grantRole(executorRole, ethers.ZeroAddress);
        await timelock.renounceRole(adminRole, owner.address);

        // 3. Triển khai hợp đồng mục tiêu và chuyển quyền sở hữu cho Timelock
        const StakingVault = await ethers.getContractFactory("StakingVault");
        const stakingVault = await StakingVault.deploy(await timelock.getAddress(), 0, 0);
        await stakingVault.waitForDeployment();

        // 4. Phân phát token và ủy quyền biểu quyết
        const mintAmount = ethers.parseEther("1000");
        await governanceToken.mint(voter1.address, mintAmount);
        await governanceToken.mint(voter2.address, mintAmount);
        await governanceToken.connect(voter1).delegate(voter1.address);
        await governanceToken.connect(voter2).delegate(voter2.address);

        return { governor, timelock, stakingVault, voter1, voter2 };
    }

    it("Should successfully propose, vote, queue, and execute a proposal to change the lock duration", async function () {
        const { governor, timelock, stakingVault, voter1, voter2 } = await loadFixture(deployGovernanceFixture);

        const newLockDuration = 60 * 60 * 24 * 7; // 7 ngày
        const description = "Proposal #1: Change staking lock duration to 7 days";

        const encodedFunctionCall = stakingVault.interface.encodeFunctionData("setLockDuration", [newLockDuration]);

        // 1. Tạo Đề xuất
        const proposeTx = await governor.connect(voter1).propose(
            [await stakingVault.getAddress()],
            [0],
            [encodedFunctionCall],
            description
        );
        const receipt = await proposeTx.wait();
        const proposalCreatedEvent = receipt.logs.find(event => event.fragment && event.fragment.name === 'ProposalCreated');
        const { proposalId } = proposalCreatedEvent.args;

        // Chờ hết votingDelay (đào đủ số block)
        const votingDelay = await governor.votingDelay();
        await mine(votingDelay);

        // 2. Bỏ phiếu
        await governor.connect(voter1).castVote(proposalId, 1); // 1 = For
        await governor.connect(voter2).castVote(proposalId, 1);

        // SỬA LỖI: Chờ hết votingPeriod (đào đủ số block thay vì tăng thời gian)
        const votingPeriod = await governor.votingPeriod();
        await mine(votingPeriod);

        // 3. Đưa vào hàng đợi (Queue)
        const descriptionHash = ethers.id(description);
        await governor.queue(
            [await stakingVault.getAddress()],
            [0],
            [encodedFunctionCall],
            descriptionHash
        );

        // Chờ hết thời gian timelock (tăng thời gian)
        await time.increase(await timelock.getMinDelay() + BigInt(1));

        // 4. Thực thi (Execute)
        await expect(governor.execute(
            [await stakingVault.getAddress()],
            [0],
            [encodedFunctionCall],
            descriptionHash
        )).to.not.be.reverted;

        // 5. Kiểm tra kết quả
        expect(await stakingVault.lockDuration()).to.equal(newLockDuration);
        console.log("    ✅ Successfully changed lock duration via governance!");
    });
});