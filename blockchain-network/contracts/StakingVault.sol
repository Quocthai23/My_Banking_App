// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingVault is Ownable, ReentrancyGuard {
    // --- State Variables ---

    uint256 public rewardRatePerSecond;
    uint256 public lockDuration;
    uint256 public totalStaked;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 rewardsPaid; // Đổi tên thành rewardsCompounded để rõ nghĩa hơn
    }

    mapping(address => Stake) public userStakes;

    // --- Events ---

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 principal, uint256 rewards);

    // --- Constructor ---

    constructor(address initialOwner, uint256 _rewardRatePerSecond, uint256 _lockDuration) Ownable(initialOwner) {
        rewardRatePerSecond = _rewardRatePerSecond;
        lockDuration = _lockDuration;
    }

    // --- Public Functions ---

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Cannot stake 0 ETH");

        if (userStakes[msg.sender].amount > 0) {
            uint256 pendingRewards = calculateRewards(msg.sender);
            // Cộng dồn phần thưởng của giai đoạn cũ vào rewardsCompounded
            userStakes[msg.sender].rewardsPaid += pendingRewards;
        }

        userStakes[msg.sender].amount += msg.value;
        userStakes[msg.sender].startTime = block.timestamp; // Reset timer cho giai đoạn mới
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function unstake() external nonReentrant {
        Stake storage userStake = userStakes[msg.sender];
        require(userStake.amount > 0, "You have no active stake");
        require(block.timestamp >= userStake.startTime + lockDuration, "Stake is still locked");

        uint256 pendingRewards = calculateRewards(msg.sender);
        
        // *** SỬA LỖI TẠI ĐÂY ***
        // Tổng tiền trả lại = Gốc + Thưởng đã cộng dồn + Thưởng của giai đoạn hiện tại
        uint256 totalRewards = userStake.rewardsPaid + pendingRewards;
        uint256 totalReturn = userStake.amount + totalRewards;

        require(address(this).balance >= totalReturn, "Insufficient contract balance for withdrawal");

        totalStaked -= userStake.amount;
        delete userStakes[msg.sender];

        (bool success, ) = msg.sender.call{value: totalReturn}("");
        require(success, "Failed to send ETH to user");

        emit Unstaked(msg.sender, userStake.amount, totalRewards);
    }

    function calculateRewards(address _user) public view returns (uint256) {
        Stake memory userStake = userStakes[_user];
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - userStake.startTime;
        
        // *** SỬA LỖI TẠI ĐÂY ***
        // Hàm này chỉ tính toán và trả về phần thưởng của giai đoạn hiện tại.
        // Không thực hiện phép trừ nữa.
        return (userStake.amount * rewardRatePerSecond * timeElapsed) / 1e18;
    }

    // --- Owner Functions ---

    function setRewardRate(uint256 _newRatePerSecond) external onlyOwner {
        rewardRatePerSecond = _newRatePerSecond;
    }

    function setLockDuration(uint256 _newDurationInSeconds) external onlyOwner {
        lockDuration = _newDurationInSeconds;
    }

    function withdrawExcessFunds() external onlyOwner {
        uint256 withdrawable = address(this).balance - totalStaked;
        if (withdrawable > 0) {
            (bool success, ) = owner().call{value: withdrawable}("");
            require(success, "Withdrawal failed");
        }
    }

    receive() external payable {}
}