const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanContract", function () {
    let loanContract, owner, bank, borrower;
    const loanId = ethers.id("LOAN-001");

    beforeEach(async function () {
        [owner, bank, borrower] = await ethers.getSigners();
        const LoanContract = await ethers.getContractFactory("LoanContract");
        loanContract = await LoanContract.deploy(owner.address, bank.address);
    });

    it("Should disburse a loan correctly when called by owner", async function () {
        const loanAmount = ethers.parseEther("1");
        const repaymentAmount = ethers.parseEther("1.1");
        const dueDate = Math.floor(Date.now() / 1000) + 86400;

        // Nạp tiền vào hợp đồng để có thể giải ngân
        await owner.sendTransaction({ to: await loanContract.getAddress(), value: loanAmount });

        // Kiểm tra số dư của người vay có thay đổi đúng không
        await expect(
            loanContract.connect(owner).disburseLoan(loanId, borrower.address, loanAmount, repaymentAmount, dueDate)
        ).to.changeEtherBalance(borrower, loanAmount);

        // Kiểm tra thông tin khoản vay đã được lưu
        const loan = await loanContract.loans(loanId);
        expect(loan.borrower).to.equal(borrower.address);
        expect(loan.isActive).to.be.true;
    });
});