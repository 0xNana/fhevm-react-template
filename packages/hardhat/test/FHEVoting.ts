import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHEVoting, FHEVoting__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHEVoting")) as FHEVoting__factory;
  const fheVotingContract = (await factory.deploy()) as FHEVoting;
  const fheVotingContractAddress = await fheVotingContract.getAddress();

  return { fheVotingContract, fheVotingContractAddress };
}

describe("FHEVoting", function () {
  let signers: Signers;
  let fheVotingContract: FHEVoting;
  let fheVotingContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ fheVotingContract, fheVotingContractAddress } = await deployFixture());
  });

  it("should create a voting session", async function () {
    const title = "Test Proposal";
    const description = "This is a test voting session";
    const duration = 3600;

    const tx = await fheVotingContract
      .connect(signers.deployer)
      .createVotingSession(title, description, duration);
    const receipt = await tx.wait();

    expect(receipt).to.not.be.null;

    const [sessionTitle, sessionDescription, isActive, endTime] = 
      await fheVotingContract.getVotingSessionInfo(1);

    expect(sessionTitle).to.eq(title);
    expect(sessionDescription).to.eq(description);
    expect(isActive).to.be.true;
    expect(endTime).to.be.gt(0);
  });

  it("should allow users to cast yes votes", async function () {
    const duration = 3600;
    
    await fheVotingContract
      .connect(signers.deployer)
      .createVotingSession("Test", "Description", duration);

    const yesVote = 1;
    const encryptedVote = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.alice.address)
      .add32(yesVote)
      .encrypt();

    const tx = await fheVotingContract
      .connect(signers.alice)
      .castVote(1, encryptedVote.handles[0], encryptedVote.inputProof);
    await tx.wait();

    const hasVoted = await fheVotingContract.hasUserVoted(signers.alice.address, 1);
    expect(hasVoted).to.be.true;

    await fheVotingContract
      .connect(signers.alice)
      .getCurrentVoteCounts(1);
    
    const result = await fheVotingContract.getCurrentVoteCounts.staticCall(1);
    const encryptedYesVotes = result[0];
    const encryptedNoVotes = result[1];
    const encryptedTotalVotes = result[2];

    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearNoVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedNoVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalVotes,
      fheVotingContractAddress,
      signers.alice,
    );

    expect(clearYesVotes).to.eq(1);
    expect(clearNoVotes).to.eq(0);
    expect(clearTotalVotes).to.eq(1);
  });

  it("should allow users to cast no votes", async function () {
    const duration = 3600;
    
    await fheVotingContract
      .connect(signers.deployer)
      .createVotingSession("Test", "Description", duration);

    const noVote = 0;
    const encryptedVote = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.alice.address)
      .add32(noVote)
      .encrypt();

    const tx = await fheVotingContract
      .connect(signers.alice)
      .castVote(1, encryptedVote.handles[0], encryptedVote.inputProof);
    await tx.wait();

    await fheVotingContract
      .connect(signers.alice)
      .getCurrentVoteCounts(1);
    
    const result = await fheVotingContract.getCurrentVoteCounts.staticCall(1);
    const encryptedYesVotes = result[0];
    const encryptedNoVotes = result[1];
    const encryptedTotalVotes = result[2];

    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearNoVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedNoVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalVotes,
      fheVotingContractAddress,
      signers.alice,
    );

    expect(clearYesVotes).to.eq(0);
    expect(clearNoVotes).to.eq(1);
    expect(clearTotalVotes).to.eq(1);
  });

  it("should prevent users from voting twice", async function () {
    const duration = 3600;
    
    await fheVotingContract
      .connect(signers.deployer)
      .createVotingSession("Test", "Description", duration);

    const yesVote = 1;
    const encryptedVote1 = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.alice.address)
      .add32(yesVote)
      .encrypt();

    let tx = await fheVotingContract
      .connect(signers.alice)
      .castVote(1, encryptedVote1.handles[0], encryptedVote1.inputProof);
    await tx.wait();

    const encryptedVote2 = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.alice.address)
      .add32(yesVote)
      .encrypt();

    await expect(
      fheVotingContract
        .connect(signers.alice)
        .castVote(1, encryptedVote2.handles[0], encryptedVote2.inputProof)
    ).to.be.revertedWith("User has already voted");
  });

  it("should allow multiple users to vote", async function () {
    const duration = 3600;
    
    await fheVotingContract
      .connect(signers.deployer)
      .createVotingSession("Test", "Description", duration);

    const yesVote = 1;
    const encryptedVoteYes = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.alice.address)
      .add32(yesVote)
      .encrypt();

    let tx = await fheVotingContract
      .connect(signers.alice)
      .castVote(1, encryptedVoteYes.handles[0], encryptedVoteYes.inputProof);
    await tx.wait();

    // Bob votes no
    const noVote = 0;
    const encryptedVoteNo = await fhevm
      .createEncryptedInput(fheVotingContractAddress, signers.bob.address)
      .add32(noVote)
      .encrypt();

    tx = await fheVotingContract
      .connect(signers.bob)
      .castVote(1, encryptedVoteNo.handles[0], encryptedVoteNo.inputProof);
    await tx.wait();

    await fheVotingContract
      .connect(signers.alice)
      .getCurrentVoteCounts(1);
    
    const result = await fheVotingContract.getCurrentVoteCounts.staticCall(1);
    const encryptedYesVotes = result[0];
    const encryptedNoVotes = result[1];
    const encryptedTotalVotes = result[2];

    const clearYesVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedYesVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearNoVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedNoVotes,
      fheVotingContractAddress,
      signers.alice,
    );
    const clearTotalVotes = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalVotes,
      fheVotingContractAddress,
      signers.alice,
    );

    expect(clearYesVotes).to.eq(1);
    expect(clearNoVotes).to.eq(1);
    expect(clearTotalVotes).to.eq(2);
  });
});

