import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEBank, FHEBank__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEBank")) as FHEBank__factory;
  const fheBankContract = (await factory.deploy()) as FHEBank;
  const fheBankContractAddress = await fheBankContract.getAddress();

  return { fheBankContract, fheBankContractAddress };
}

describe("FHEBank", function () {
  let signers: Signers;
  let fheBankContract: FHEBank;
  let fheBankContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fheBankContract, fheBankContractAddress } = await deployFixture());
  });

  it("encrypted balance should be uninitialized after deployment", async function () {
    const encryptedBalance = await fheBankContract.getBalance(signers.alice.address);
    // Expect initial balance to be bytes32(0) after deployment,
    // (meaning the encrypted balance value is uninitialized)
    expect(encryptedBalance).to.eq(ethers.ZeroHash);
  });

  it("deposit encrypted amount", async function () {
    const depositAmount = 100;
    
    // Encrypt deposit amount as euint64
    const encryptedDeposit = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(depositAmount)
      .encrypt();

    const tx = await fheBankContract
      .connect(signers.alice)
      .deposit(encryptedDeposit.handles[0], encryptedDeposit.inputProof);
    await tx.wait();

    const encryptedBalance = await fheBankContract.getBalance(signers.alice.address);
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      fheBankContractAddress,
      signers.alice,
    );

    expect(clearBalance).to.eq(depositAmount);
  });

  it("withdraw encrypted amount", async function () {
    const depositAmount = 100;
    const withdrawAmount = 30;
    
    // First deposit
    const encryptedDeposit = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(depositAmount)
      .encrypt();

    let tx = await fheBankContract
      .connect(signers.alice)
      .deposit(encryptedDeposit.handles[0], encryptedDeposit.inputProof);
    await tx.wait();

    // Then withdraw
    const encryptedWithdraw = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(withdrawAmount)
      .encrypt();

    tx = await fheBankContract
      .connect(signers.alice)
      .withdraw(encryptedWithdraw.handles[0], encryptedWithdraw.inputProof);
    await tx.wait();

    const encryptedBalance = await fheBankContract.getBalance(signers.alice.address);
    const clearBalance = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalance,
      fheBankContractAddress,
      signers.alice,
    );

    expect(clearBalance).to.eq(depositAmount - withdrawAmount);
  });

  it("transfer encrypted amount between users", async function () {
    const depositAmount = 100;
    const transferAmount = 40;
    
    // Alice deposits
    const encryptedDeposit = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(depositAmount)
      .encrypt();

    let tx = await fheBankContract
      .connect(signers.alice)
      .deposit(encryptedDeposit.handles[0], encryptedDeposit.inputProof);
    await tx.wait();

    // Alice transfers to Bob
    const encryptedTransfer = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(transferAmount)
      .encrypt();

    tx = await fheBankContract
      .connect(signers.alice)
      .transfer(signers.bob.address, encryptedTransfer.handles[0], encryptedTransfer.inputProof);
    await tx.wait();

    // Check Alice's balance
    const encryptedBalanceAlice = await fheBankContract.getBalance(signers.alice.address);
    const clearBalanceAlice = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalanceAlice,
      fheBankContractAddress,
      signers.alice,
    );
    expect(clearBalanceAlice).to.eq(depositAmount - transferAmount);

    // Check Bob's balance
    const encryptedBalanceBob = await fheBankContract.getBalance(signers.bob.address);
    const clearBalanceBob = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedBalanceBob,
      fheBankContractAddress,
      signers.bob,
    );
    expect(clearBalanceBob).to.eq(transferAmount);
  });

  it("total supply should reflect deposits", async function () {
    const depositAmount = 50;
    
    // Encrypt deposit amount
    const encryptedDeposit = await fhevm
      .createEncryptedInput(fheBankContractAddress, signers.alice.address)
      .add64(depositAmount)
      .encrypt();

    const tx = await fheBankContract
      .connect(signers.alice)
      .deposit(encryptedDeposit.handles[0], encryptedDeposit.inputProof);
    await tx.wait();

    const encryptedTotalSupply = await fheBankContract.getTotalSupply();
    const clearTotalSupply = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedTotalSupply,
      fheBankContractAddress,
      signers.alice,
    );

    expect(clearTotalSupply).to.eq(depositAmount);
  });
});

