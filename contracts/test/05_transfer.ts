/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, waffle } from "hardhat";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";
import { getTokenId } from "test/utils/getTokenId";

describe("DesImages--transfer", function () {
  let desImages: Contract;
  let signers: SignerWithAddress[];
  let wallets: Wallet[];
  let user: Wallet;
  let mintPrice: BigNumber;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    wallets = waffle.provider.getWallets();
    user = wallets[1];
    const DesImages = await ethers.getContractFactory("DesImages");
    desImages = await DesImages.deploy();
    await desImages.deployed();
    mintPrice = await desImages.currentMintPrice();

    const [owner] = signers;
    const paused = await desImages.paused();
    if (paused) {
      await desImages.connect(owner).unpause();
    }
  });

  describe("ERC721:", function () {
    describe("safeTransferFrom()", function () {
      describe("Expected:", function () {
        it("transfers a token from an address to another", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          const tx = await desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          });
          await tx.wait();

          await expect(
            desImages
              .connect(user)
              ["safeTransferFrom(address,address,uint256)"](
                user.address,
                wallets[2].address,
                tokenId
              )
          )
            .to.emit(desImages, "Transfer")
            .withArgs(user.address, wallets[2].address, tokenId);
        });
      });

      describe("Security:", function () {
        it("fails to transfer if the caller doesn't own the token", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          await expect(
            desImages
              .connect(user)
              ["safeTransferFrom(address,address,uint256)"](
                user.address,
                wallets[2].address,
                tokenId
              )
          ).to.be.reverted;
        });
      });
    });

    describe("transferFrom()", function () {
      describe("Expected:", function () {
        it("transfers a token from an address to another", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          const tx = await desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          });
          await tx.wait();

          await expect(
            desImages
              .connect(user)
              .transferFrom(user.address, wallets[2].address, tokenId)
          )
            .to.emit(desImages, "Transfer")
            .withArgs(user.address, wallets[2].address, tokenId);
        });
      });

      describe("Security:", function () {
        it("fails to transfer if the caller doesn't own the token", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          await expect(
            desImages
              .connect(user)
              .transferFrom(user.address, wallets[2].address, tokenId)
          ).to.be.reverted;
        });
      });
    });
  });

  // TODO: approve
});
