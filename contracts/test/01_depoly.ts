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

  it("should deploy", async function () {
    expect(desImages.address.length).to.be.greaterThan(0);
  });

  it("sets owner", async function () {
    const [owner] = signers;
    expect(await desImages.owner()).to.equal(owner.address);
  });

  // TODO: royaltyInfo
});
