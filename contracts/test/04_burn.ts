/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, waffle } from "hardhat";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";
import { getTokenId } from "test/utils/getTokenId";

describe("DesImages--burn", function () {
  let desImages: Contract;
  let signers: SignerWithAddress[];
  let wallets: Wallet[];
  let user: Wallet;
  let mintPrice: BigNumber;
  let burnReward: BigNumber;

  beforeEach(async function () {
    signers = await ethers.getSigners();
    wallets = waffle.provider.getWallets();
    user = wallets[1];
    const DesImages = await ethers.getContractFactory("DesImages");
    desImages = await DesImages.deploy();
    await desImages.deployed();
    mintPrice = await desImages.currentMintPrice();
    burnReward = await desImages.currentBurnReward();

    const [owner] = signers;
    const paused = await desImages.paused();
    if (paused) {
      await desImages.connect(owner).unpause();
    }
  });

  describe("burn()", function () {
    describe("Expected:", function () {
      it("burns a token", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));
        let tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        burnReward = await desImages.currentBurnReward();

        tx = await desImages.connect(user).burn(tokenId);
        const receipt = await tx.wait();
        const ev = receipt.events.filter((ev: any) => ev.event === "Burned");

        expect(ev[0].args.from).to.equal(user.address);
        expect(ev[0].args.tokenId).to.equal(tokenId);
        expect(ev[0].args.burnReward).to.equal(burnReward);
        expect(ev[0].args.totalSupply.toString()).to.equal("0");

        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(2);
        await expect(desImages.ownerOf(tokenId)).to.be.reverted;
        expect(await desImages.balanceOf(user.address)).to.equal(
          BigNumber.from(0)
        );
        const tokenIds = await desImages.connect(user).tokenIdsOf();
        expect(tokenIds.length).to.equal(0);
      });

      it("burns a token from a contract", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        const MinterBurner = await ethers.getContractFactory("MinterBurner", {
          signer: signers[2],
        });
        const minterBurner = await MinterBurner.deploy(date, ciphertext, 0);
        await minterBurner.deployed();

        const tx = await minterBurner
          .connect(wallets[2])
          .mint(desImages.address, {
            value: mintPrice,
          });
        await tx.wait();

        await minterBurner.connect(wallets[2]).setTokenId(tokenId);
        await expect(minterBurner.connect(wallets[2]).burn(desImages.address))
          .to.emit(minterBurner, "Burned")
          .withArgs(minterBurner.address, tokenId);
      });

      it("emits 'Burned' event", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();

        burnReward = await desImages.currentBurnReward();
        await expect(desImages.connect(user).burn(tokenId))
          .to.emit(desImages, "Burned")
          .withArgs(user.address, tokenId, burnReward, BigNumber.from(0));
      });

      it("sends the reward ether to the token owner", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        let tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();

        const balanceBeforeBurn = await user.getBalance();
        burnReward = await desImages.currentBurnReward();
        tx = await desImages.connect(user).burn(tokenId);
        const receipt = await tx.wait();
        const balanceAfterBurn = await user.getBalance();
        const balanceBack = balanceAfterBurn.sub(balanceBeforeBurn);

        expect(
          balanceBack.eq(
            burnReward.sub(receipt.gasUsed.mul(receipt.effectiveGasPrice))
          )
        ).to.equal(true);
      });
    });

    describe("Security:", function () {
      it("prevents from burning non-minted tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(0);
        await expect(desImages.connect(user).burn(tokenId)).to.be.reverted;
      });

      it("prevents from burning already burned tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        let tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        tx = await desImages.connect(user).burn(tokenId);
        await tx.wait();

        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(2);
        await expect(desImages.connect(user).burn(tokenId)).to.be.reverted;
      });

      it("prevents from burning other owner's tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        const tx = await desImages.connect(wallets[2]).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();

        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(1);
        await expect(desImages.connect(user).burn(tokenId)).to.be.revertedWith(
          "DesImages__TokenNotOwned"
        );
      });

      it("prevents from re-entrancy", async function () {
        const { date: d1, ciphertext: c1 } = getDateAndCiphertext(2020, 1, 1);
        let tx = await desImages.connect(user).mint(d1, c1, {
          value: mintPrice,
        });
        await tx.wait();

        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 2);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));

        const MinterBurner = await ethers.getContractFactory("MinterBurner", {
          signer: signers[2],
        });
        const minterBurner = await MinterBurner.deploy(date, ciphertext, 2);
        await minterBurner.deployed();

        mintPrice = await desImages.currentMintPrice();
        tx = await minterBurner.connect(wallets[2]).mint(desImages.address, {
          value: mintPrice,
        });
        await tx.wait();

        await minterBurner.connect(wallets[2]).setTokenId(tokenId);
        await expect(
          minterBurner.connect(wallets[2]).burn(desImages.address)
        ).to.be.revertedWith("DesImages__OwnerTransferFail");
      });
    });
  });
});
