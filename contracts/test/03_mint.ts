/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, waffle } from "hardhat";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";
import { getTokenId } from "test/utils/getTokenId";

describe("DesImages--mint", function () {
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

  describe("mint()", function () {
    describe("Expected:", function () {
      it("mints a token", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));
        expect(await desImages.getTokenStatus(tokenId)).to.equal(0);

        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        const receipt = await tx.wait();
        const ev = receipt.events.filter((ev: any) => ev.event === "Minted");
        expect(ev[0].args.to).to.equal(wallets[1].address);
        expect(ev[0].args.tokenId).to.equal(tokenId);
        expect(ev[0].args.mintPrice).to.equal(mintPrice);
        expect(ev[0].args.totalSupply.toString()).to.equal("1");
        expect(ev[0].args.totalEverMinted.toString()).to.equal("1");

        expect(await desImages.getTokenStatus(tokenId)).to.equal(1);
        expect(await desImages.ownerOf(tokenId)).to.equal(wallets[1].address);
        expect(await desImages.balanceOf(wallets[1].address)).to.equal(
          BigNumber.from(1)
        );
      });

      it("mints a token from a contract", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);

        const MinterBurner = await ethers.getContractFactory("MinterBurner", {
          signer: signers[2],
        });
        const minterBurner = await MinterBurner.deploy(date, ciphertext, 0);
        await minterBurner.deployed();

        await expect(
          minterBurner.connect(wallets[2]).mint(desImages.address, {
            value: mintPrice,
          })
        )
          .to.emit(minterBurner, "Minted")
          .withArgs(
            minterBurner.address,
            BigNumber.from(getTokenId(date, ciphertext))
          );
      });

      it("emits 'Minted' event", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 4, 1);
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        )
          .to.emit(desImages, "Minted")
          .withArgs(
            user.address,
            BigNumber.from(getTokenId(date, ciphertext)),
            mintPrice,
            BigNumber.from(1),
            BigNumber.from(1)
          );
      });

      it("emits 'Transfer' event", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 4, 1);
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        )
          .to.emit(desImages, "Transfer")
          .withArgs(
            "0x0000000000000000000000000000000000000000",
            user.address,
            BigNumber.from(getTokenId(date, ciphertext))
          );
      });

      it("sends back ether if more than mintPrice is sent", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const balanceBeforeMint = await user.getBalance();
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice.add(ethers.utils.parseEther("1")),
        });
        const receipt = await tx.wait();
        const balanceAfterMint = await user.getBalance();
        const balanceSpent = balanceBeforeMint.sub(balanceAfterMint);

        expect(
          balanceSpent.eq(
            mintPrice.add(receipt.gasUsed.mul(receipt.effectiveGasPrice))
          )
        ).to.equal(true);
        expect(balanceSpent.lte(ethers.utils.parseEther("1"))).to.equal(true);
      });

      it("reserves ether (99.5% of mintPrice) in the contract", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        const contractBalance = await waffle.provider.getBalance(
          desImages.address
        );

        expect(
          contractBalance.eq(
            mintPrice.mul(BigNumber.from(9950)).div(BigNumber.from(10000))
          )
        ).to.equal(true);
      });

      it("sends ether (0.5% of mintPrice) to the contract owner", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const [owner] = signers;
        const balanceBeforeMint = await owner.getBalance();
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        const balanceAfterMint = await owner.getBalance();
        const balanceAdded = balanceAfterMint.sub(balanceBeforeMint);

        expect(
          balanceAdded.eq(
            mintPrice.mul(BigNumber.from(50)).div(BigNumber.from(10000))
          )
        ).to.equal(true);
      });

      it("accepts leap year dates", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 2, 29);
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        ).to.emit(desImages, "Minted");
      });
    });

    describe("Security:", function () {
      it("fails if not enough ether is sent", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice.div(BigNumber.from(2)),
          })
        ).to.be.revertedWith("DesImages__NotEnoughETHSent");
      });

      it("fails if the contract is paused", async function () {
        const [owner] = signers;
        const paused = await desImages.paused();
        if (!paused) {
          await desImages.connect(owner).pause();
        }
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice.div(BigNumber.from(2)),
          })
        ).to.be.reverted;
      });

      it("prevents from minting already minted or burned tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();

        mintPrice = await desImages.currentMintPrice();
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        ).to.be.revertedWith("DesImages__TokenNotForSale");

        await desImages.connect(user).burn(getTokenId(date, ciphertext));
        mintPrice = await desImages.currentMintPrice();
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        ).to.be.revertedWith("DesImages__TokenNotForSale");
      });

      describe("prevents from minting invalid date's token", function () {
        describe("Before 2020:", function () {
          it("2019-12-31", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2019, 12, 31);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });
        });

        describe("After 10000", function () {
          it("10000-01-01", async function () {
            const { date, ciphertext } = getDateAndCiphertext(10000, 1, 1);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });
        });

        describe("Invalid Leap Year", function () {
          it("2020-02-30", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 2, 30);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });

          it("2021-02-29", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2021, 2, 29);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });
        });

        describe("Non Existent Month", function () {
          it("2020-13-10", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 13, 10);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });
        });

        describe("Non Existent Date", function () {
          it("2020-01-40", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 1, 40);
            await expect(
              desImages.connect(user).mint(date, ciphertext, {
                value: mintPrice,
              })
            ).to.be.revertedWith("DesImages__InvalidDate");
          });
        });
      });

      it("prevents from minting future date's token", async function () {
        const today = new Date(new Date().setUTCHours(0, 0, 0, 0));
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const { date, ciphertext } = getDateAndCiphertext(
          tomorrow.getUTCFullYear(),
          tomorrow.getUTCMonth() + 1,
          tomorrow.getUTCDate()
        );
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        ).to.be.revertedWith("DesImages__FutureDate");
      });

      it("prevents from minting with the ciphertext bigger than uint128 max value", async function () {
        const { date } = getDateAndCiphertext(2020, 1, 1);
        const ciphertext = BigNumber.from(
          "0x1ffffffffffffffffffffffffffffffff"
        );
        await expect(
          desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          })
        ).to.be.reverted;
      });

      it("prevents from re-entrancy", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();

        const { date: date2, ciphertext: ciphertext2 } = getDateAndCiphertext(
          2020,
          1,
          2
        );
        const MaliciousMinter = await ethers.getContractFactory(
          "MinterBurner",
          {
            signer: signers[2],
          }
        );
        const maliciousMinter = await MaliciousMinter.deploy(
          date2,
          ciphertext2,
          1
        );
        await maliciousMinter.deployed();
        await expect(
          maliciousMinter.connect(wallets[2]).mint(desImages.address, {
            value: ethers.utils.parseEther("1"),
          })
        ).to.be.revertedWith("DesImages__OwnerTransferFail");
      });
    });
  });
});
