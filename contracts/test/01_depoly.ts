/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";
import { getTokenId } from "test/utils/getTokenId";

describe("DesImages--deploy", function () {
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

  describe("ERC721:", function () {
    describe("name()", function () {
      it("returns name", async function () {
        expect(await desImages.name()).to.equal("desImages");
      });
    });

    describe("symbol()", function () {
      it("returns symbol", async function () {
        expect(await desImages.symbol()).to.equal("DESIMGS");
      });
    });
  });

  describe("ERC2981:", function () {
    it("sets the royalty of 5%", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tokenId = BigNumber.from(getTokenId(date, ciphertext));
      const salePrice = ethers.utils.parseEther("1.0");
      const royaltyInfo = await desImages.royaltyInfo(tokenId, salePrice);
      expect(royaltyInfo[0]).to.equal(signers[0].address);
      expect(royaltyInfo[1]).to.equal(salePrice.mul(500).div(10000));
    });
  });

  describe("Ownable:", function () {
    it("sets owner", async function () {
      const [owner] = signers;
      expect(await desImages.owner()).to.equal(owner.address);
    });
  });
});
