// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LoanContract is Ownable, ReentrancyGuard {
    // --- State Variables ---
    uint256 public interestRate; // Lãi suất hàng năm (ví dụ: 500 cho 5.00%, 1000 cho 10.00%)
    address public treasury; // Địa chỉ ví nhận lãi
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
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal, uint256 dueTime);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 totalRepayment);

    // --- Constructor ---
    constructor(address initialOwner, address _treasury) Ownable(initialOwner) {
        treasury = _treasury;
        // Lãi suất ban đầu có thể được đặt ở đây hoặc thông qua một hàm riêng
        // interestRate = 500; // Ví dụ: 5%
    }

    // --- Functions ---

    /**
     * @dev Cho phép người dùng tạo một khoản vay mới.
     * @param _durationInSeconds Thời hạn của khoản vay tính bằng giây.
     */
    function createLoan(uint256 _durationInSeconds) external payable nonReentrant {
        require(msg.value > 0, "Loan principal must be greater than 0");
        require(_durationInSeconds > 0, "Loan duration must be greater than 0");
        require(interestRate > 0, "Interest rate must be set by the owner");

        uint256 loanId = nextLoanId;
        uint256 calculatedInterest = (msg.value * interestRate * _durationInSeconds) / (10000 * 365 days);

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            principal: msg.value,
            interest: calculatedInterest,
            creationTime: block.timestamp,
            dueTime: block.timestamp + _durationInSeconds,
            repaid: false
        });

        userLoans[msg.sender].push(loanId);
        nextLoanId++;

        emit LoanCreated(loanId, msg.sender, msg.value, block.timestamp + _durationInSeconds);
    }

    /**
     * @dev Cho phép người vay trả lại một khoản vay.
     * @param _loanId ID của khoản vay cần trả.
     */
    function repayLoan(uint256 _loanId) external payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "You are not the borrower of this loan");
        require(!loan.repaid, "Loan has already been repaid");

        uint256 totalRepayment = loan.principal + loan.interest;
        require(msg.value >= totalRepayment, "Insufficient payment to cover the loan");

        loan.repaid = true;

        // Gửi tiền gốc lại cho contract (hoặc cho một quỹ)
        // Gửi tiền lãi cho treasury
        (bool success, ) = treasury.call{value: loan.interest}("");
        require(success, "Failed to send interest to treasury");

        // Hoàn lại tiền thừa nếu có
        if (msg.value > totalRepayment) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - totalRepayment}("");
            require(refundSuccess, "Failed to refund excess amount");
        }

        emit LoanRepaid(_loanId, msg.sender, totalRepayment);
    }
    
    // *** HÀM ĐÃ ĐƯỢC THÊM VÀO ***
    /**
     * @dev Đặt lãi suất cho các khoản vay mới. Chỉ owner mới có thể gọi.
     * @param _newRate Lãi suất mới (ví dụ: 500 cho 5.00%).
     */
    function setInterestRate(uint256 _newRate) external onlyOwner {
        interestRate = _newRate;
    }

    /**
     * @dev Lấy danh sách ID các khoản vay của một người dùng.
     * @param _user Địa chỉ người dùng.
     * @return Một mảng chứa các ID khoản vay.
     */
    function getUserLoans(address _user) external view returns (uint256[] memory) {
        return userLoans[_user];
    }
}
