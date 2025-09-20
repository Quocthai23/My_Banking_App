const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StakingVault V2", function () {
    let stakingVault, owner, staker1, staker2;
    const lockDuration = 30 * 24 * 60 * 60; // 30 ngày
    // Giả sử lãi suất là 10% mỗi năm. Tính ra reward rate mỗi giây.
    // 1 ETH * 10% / (365 * 24 * 60 * 60) = 0.00000000317... ETH/giây
    const rewardRatePerSecond = ethers.parseEther("0.00000000317");

    beforeEach(async function () {
        [owner, staker1, staker2] = await ethers.getSigners();
        const StakingVault = await ethers.getContractFactory("StakingVault");
        stakingVault = await StakingVault.deploy(owner.address, rewardRatePerSecond, lockDuration);

        // Nạp tiền vào hợp đồng để trả thưởng
        await owner.sendTransaction({
            to: await stakingVault.getAddress(),
            value: ethers.parseEther("10") // 10 ETH
        });
    });

    it("Should allow a user to stake ETH and record the stake", async function () {
        const stakeAmount = ethers.parseEther("1");
        await expect(stakingVault.connect(staker1).stake({ value: stakeAmount }))
            .to.emit(stakingVault, "Staked")
            .withArgs(staker1.address, stakeAmount);

        const userStake = await stakingVault.userStakes(staker1.address);
        expect(userStake.amount).to.equal(stakeAmount);
        expect(await stakingVault.totalStaked()).to.equal(stakeAmount);
    });

    it("Should prevent unstaking before the lock duration ends", async function () {
        const stakeAmount = ethers.parseEther("1");
        await stakingVault.connect(staker1).stake({ value: stakeAmount });

        await expect(stakingVault.connect(staker1).unstake())
            .to.be.revertedWith("Stake is still locked");
    });

    it("Should allow a user to unstake and receive principal + rewards after lock duration", async function () {
        const stakeAmount = ethers.parseEther("1");
        await stakingVault.connect(staker1).stake({ value: stakeAmount });

        // Tua nhanh thời gian qua thời gian khóa
        await time.increase(lockDuration + 1);

        const initialBalance = await ethers.provider.getBalance(staker1.address);
        
        // Thực hiện unstake và lấy gas đã sử dụng
        const tx = await stakingVault.connect(staker1).unstake();
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * tx.gasPrice;

        const finalBalance = await ethers.provider.getBalance(staker1.address);

        // Tính toán reward dự kiến
        const expectedRewards = (stakeAmount * rewardRatePerSecond * BigInt(lockDuration + 1)) / ethers.parseEther("1");
        
        // Kiểm tra số dư của staker1 đã tăng lên đúng bằng (tiền gốc + thưởng - gas)
        expect(finalBalance).to.be.closeTo(
            initialBalance + stakeAmount + expectedRewards - gasUsed,
            ethers.parseEther("0.0001") // Cho phép sai số nhỏ
        );

        // Kiểm tra trạng thái hợp đồng đã được reset
        const userStake = await stakingVault.userStakes(staker1.address);
        expect(userStake.amount).to.equal(0);
    });
});