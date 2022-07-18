const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Refund", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployOneYearRefundFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const refundedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Refund = await ethers.getContractFactory("Refund");
    const refund = await Refund.deploy(unlockTime, { value: refundedAmount });

    return { refund, unlockTime, refundedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { refund, unlockTime } = await loadFixture(deployOneYearRefundFixture);

      expect(await refund.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { refund, owner } = await loadFixture(deployOneYearRefundFixture);

      expect(await refund.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to refund", async function () {
      const { refund, refundedAmount } = await loadFixture(
        deployOneYearRefundFixture
      );

      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        refundedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Refund = await ethers.getContractFactory("Refund");
      await expect(Refund.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { refund } = await loadFixture(deployOneYearRefundFixture);

        await expect(lock.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { refund, unlockTime, otherAccount } = await loadFixture(
          deployOneYearRefundFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use refund.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { refund, unlockTime } = await loadFixture(
          deployOneYearRefundFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { refund, unlockTime, refundedAmount } = await loadFixture(
          deployOneYearRefundFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { refund, unlockTime, refundedAmount, owner } = await loadFixture(
          deployOneYearRefundFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, refund],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
