import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("DesImages", function () {
  let desImages: Contract;
  let signers: SignerWithAddress[];

  beforeEach(async function () {
    signers = await ethers.getSigners();
    const DesImages = await ethers.getContractFactory("DesImages");
    desImages = await DesImages.deploy();
    await desImages.deployed();
  });

  describe("pause()", function () {
    it("pauses contract", async function () {
      const [owner] = signers;
      const paused = await desImages.paused();
      if (paused) {
        await desImages.connect(owner).unpause();
      }
      await desImages.connect(owner).pause();
      expect(await desImages.paused()).to.equal(true);
    });

    it("fails to pause if the contract is already paused", async function () {
      const [owner] = signers;
      const paused = await desImages.paused();
      if (!paused) {
        await desImages.connect(owner).pause();
      }
      await expect(desImages.connect(owner).pause()).to.be.reverted;
    });

    it("can be called only by the contract owner", async function () {
      const [owner, nonOwner] = signers;
      const paused = await desImages.paused();
      if (paused) {
        await desImages.connect(owner).unpause();
      }
      await expect(desImages.connect(nonOwner).pause()).to.be.reverted;
    });
  });

  describe("unpause()", function () {
    it("unpauses contract", async function () {
      const [owner] = signers;
      const paused = await desImages.paused();
      if (!paused) {
        await desImages.connect(owner).pause();
      }
      await desImages.connect(owner).unpause();
      expect(await desImages.paused()).to.equal(false);
    });

    it("fails to unpause if the contract is already unpaused", async function () {
      const [owner] = signers;
      const paused = await desImages.paused();
      if (paused) {
        await desImages.connect(owner).unpause();
      }
      await expect(desImages.connect(owner).unpause()).to.be.reverted;
    });

    it("can be called only by the contract owner", async function () {
      const [owner, nonOwner] = signers;
      const paused = await desImages.paused();
      if (!paused) {
        await desImages.connect(owner).pause();
      }
      await expect(desImages.connect(nonOwner).unpause()).to.be.reverted;
    });
  });
});
