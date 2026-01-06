// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanContract is Ownable, ReentrancyGuard {
    // --- State Variables ---
    uint256 public interestRate; // Ví dụ: 500 = 5%
    address public treasury;     // Địa chỉ nhận lãi
    uint256 private nextLoanId;

    struct Loan {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 interest;
        uint256 creationTime;
        uint256 dueTime;
        bool repaid;
    }

    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;

    // --- Events ---
    event LiquidityAdded(address indexed provider, uint256 amount);
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 interest, uint256 dueTime);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalRepayment);
    event TreasuryUpdated(address newTreasury);

    // --- Constructor ---
    constructor(address initialOwner, address _treasury) Ownable(initialOwner) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        // Mặc định lãi suất 5% nếu chưa set
        interestRate = 500; 
    }

    // --- QUẢN LÝ VỐN (FIX LỖI KHÔNG NHẬN TIỀN) ---

    // 1. Cho phép contract nhận ETH trực tiếp
    receive() external payable {
        emit LiquidityAdded(msg.sender, msg.value);
    }

    // 2. Hàm dành riêng cho Owner nạp vốn (để dễ tracking)
    function depositLiquidity() external payable onlyOwner {
        require(msg.value > 0, "Must deposit something");
        emit LiquidityAdded(msg.sender, msg.value);
    }

    // 3. Kiểm tra số dư hiện tại của contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // --- LOGIC VAY (FIX LỖI GHI ĐÈ & NGƯỢC LOGIC) ---

    /**
     * @dev Tạo khoản vay: Contract chuyển tiền cho người dùng.
     * @param _amount Số tiền muốn vay (Wei).
     * @param _durationInSeconds Thời hạn vay.
     * LƯU Ý QUAN TRỌNG: Ở môi trường thực tế, bạn cần yêu cầu THẾ CHẤP (Collateral) 
     * trước khi cho vay. Ở đây tôi làm theo logic tín chấp đơn giản để fix lỗi dòng tiền.
     */
    function createLoan(uint256 _amount, uint256 _durationInSeconds) external nonReentrant {
        require(_amount > 0, "Loan amount must be greater than 0");
        require(_durationInSeconds > 0, "Duration must be greater than 0");
        require(interestRate > 0, "Interest rate not set");
        
        // Kiểm tra contract có đủ tiền để cho vay không
        require(address(this).balance >= _amount, "Insufficient contract liquidity");

        uint256 loanId = nextLoanId;
        
        // Tính lãi: (Gốc * Lãi suất * Thời gian) / (10000 * 365 ngày)
        // Lưu ý: Phép tính này giả định interestRate là lãi suất năm (Basis Points)
        uint256 calculatedInterest = (_amount * interestRate * _durationInSeconds) / (10000 * 365 days);

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            principal: _amount,
            interest: calculatedInterest,
            creationTime: block.timestamp,
            dueTime: block.timestamp + _durationInSeconds,
            repaid: false
        });

        userLoans[msg.sender].push(loanId);
        nextLoanId++;

        // CHUYỂN TIỀN TỪ CONTRACT -> NGƯỜI VAY
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether to borrower");

        emit LoanCreated(loanId, msg.sender, _amount, calculatedInterest, block.timestamp + _durationInSeconds);
    }

    /**
     * @dev Trả nợ: Người dùng chuyển Tiền Gốc + Lãi vào Contract.
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];

        require(loan.borrower == msg.sender, "Not the borrower");
        require(!loan.repaid, "Loan already repaid");

        uint256 totalRepayment = loan.principal + loan.interest;
        require(msg.value >= totalRepayment, "Insufficient amount to repay loan");

        loan.repaid = true;

        // XỬ LÝ DÒNG TIỀN TRẢ NỢ:
        // 1. Tiền lãi -> Chuyển về Treasury
        (bool interestSent, ) = treasury.call{value: loan.interest}("");
        require(interestSent, "Failed to send interest to treasury");

        // 2. Tiền gốc -> Giữ lại trong Contract Address (this) để làm vốn cho người sau vay
        // (Không cần code chuyển đi đâu cả, vì msg.value đã vào contract rồi)

        // 3. Hoàn lại tiền thừa (nếu người dùng gửi dư)
        if (msg.value > totalRepayment) {
            uint256 refundAmount = msg.value - totalRepayment;
            (bool refundSent, ) = msg.sender.call{value: refundAmount}("");
            require(refundSent, "Failed to refund excess amount");
        }

        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }

    // --- CÁC HÀM QUẢN TRỊ ---
    
    function setInterestRate(uint256 _newRate) external onlyOwner {
        interestRate = _newRate;
    }

    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
}