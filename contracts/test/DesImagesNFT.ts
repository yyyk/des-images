/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, waffle } from "hardhat";
import { encrypt } from "test/utils/encrypt";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";

describe("DesImages", function () {
  let desImages: Contract;
  let signers: SignerWithAddress[];
  let wallets: Wallet[];

  beforeEach(async function () {
    signers = await ethers.getSigners();
    wallets = waffle.provider.getWallets();
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

  // TODO:
  // pause()
  // unpause()

  describe("mint()", function () {
    describe("Expected:", function () {
      it("mints a token", async function () {
        // console.log(await signers[0].getBalance());
        // console.log(await wallets[1].getBalance());
        // console.log(await waffle.provider.getBalance(desImages.address));
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        const receipt = await tx.wait();
        const ev = receipt.events.filter((ev: any) => ev.event === "Minted");
        expect(ev[0].args.to).to.equal(wallets[1].address);
        expect(ev[0].args.tokenId.toHexString().length).to.be.greaterThan(0);
        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(1);
        // console.log(await signers[0].getBalance());
        // console.log(await wallets[1].getBalance());
        // console.log(await waffle.provider.getBalance(desImages.address));

        // console.log(
        //   await desImages.callStatic.mint(
        //     signers[1].address,
        //     "02012020",
        //     BigNumber.from(value)
        //   )
        // );
      });

      // TODO: reserve and return extra

      it("is mintable from a contract", async function () {
        const date = 8274177;
        const ciphertext = "0x79030f7920aaa3cfbbd92afbb93e70ba";
        // Contract deploy
        const MinterBurner = await ethers.getContractFactory("MinterBurner", {
          signer: signers[2],
        });
        const minterBurner = await MinterBurner.deploy(
          date,
          BigNumber.from(ciphertext),
          0
        );
        await minterBurner.deployed();
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(minterBurner.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        let result = false;
        try {
          // Mint
          const tx = await minterBurner
            .connect(wallets[2])
            .mint(desImages.address, {
              value: ethers.utils.parseEther("1"),
            });
          await tx.wait();
          // console.log(await wallets[2].getBalance());
          // console.log(await waffle.provider.getBalance(minterBurner.address));
          // console.log(await waffle.provider.getBalance(desImages.address));
          result = true;
        } catch (err) {
          // console.log(err);
        }
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(minterBurner.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        expect(result).to.equal(true);
      });
    });

    describe("Security:", function () {
      it("prevents from minting existing tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        await tx.wait();
        let result = false;
        try {
          const tx = await desImages
            .connect(wallets[2])
            .mint(date, ciphertext, {
              value: ethers.utils.parseEther("0.2"),
            });
          await tx.wait();
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });

      describe("prevents from minting invalid date's token", function () {
        describe("Before 2020", function () {
          it("2019-12-31", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2019, 12, 31);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });
        });

        describe("After 10000", function () {
          it("10000-01-01", async function () {
            const { date, ciphertext } = getDateAndCiphertext(10000, 1, 1);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });
        });

        describe("Invalid Leap Year", function () {
          it("2020-02-30", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 2, 30);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });

          it("2021-02-29", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2021, 2, 29);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });
        });

        describe("Non Existent Month", function () {
          it("2020-13-10", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 13, 10);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });
        });

        describe("Non Existent Date", function () {
          it("2020-01-40", async function () {
            const { date, ciphertext } = getDateAndCiphertext(2020, 1, 40);
            let result = false;
            try {
              const tx = await desImages
                .connect(wallets[1])
                .mint(date, ciphertext, {
                  value: ethers.utils.parseEther("0.2"),
                });
              await tx.wait();
              result = true;
            } catch (err) {}
            expect(result).to.equal(false);
          });
        });
      });

      it("prevents from minting future date's token", async function () {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getUTCDate() + 1);
        const dayString = tomorrow.getUTCDate().toString(16).padStart(2, "0");
        const monthString = (tomorrow.getUTCMonth() + 1).toString(16);
        const yearString = tomorrow.getUTCFullYear().toString(16);
        const date = parseInt(`0x${yearString}${monthString}${dayString}`);
        const value = encrypt(
          tomorrow.getUTCFullYear(),
          tomorrow.getUTCMonth() + 1,
          tomorrow.getUTCDate()
        );
        let result = false;
        try {
          const tx = await desImages
            .connect(wallets[1])
            .mint(date, BigNumber.from(value), {
              value: ethers.utils.parseEther("0.2"),
            });
          await tx.wait();
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });

      it("prevents from minting with the value bigger than uint128 max value", async function () {
        const { date } = getDateAndCiphertext(2020, 1, 1);
        const value = "0xffffffffffffffffffffffffffffffff1";
        let result = false;
        try {
          const tx = await desImages
            .connect(wallets[1])
            .mint(date, BigNumber.from(value), {
              value: ethers.utils.parseEther("0.2"),
            });
          await tx.wait();
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });

      it("prevents from re-entrancy", async function () {
        const date = 8274177;
        const ciphertext = "0x79030f7920aaa3cfbbd92afbb93e70ba";
        // Contract deploy
        const MaliciousMinter = await ethers.getContractFactory(
          "MinterBurner",
          {
            signer: signers[2],
          }
        );
        const maliciousMinter = await MaliciousMinter.deploy(
          date,
          BigNumber.from(ciphertext),
          1
        );
        await maliciousMinter.deployed();
        const { date: _date, ciphertext: _ciphertext } = getDateAndCiphertext(
          2020,
          1,
          2
        );
        const tx = await desImages
          .connect(wallets[1])
          .mint(_date, _ciphertext, {
            value: ethers.utils.parseEther("0.1"),
          });
        await tx.wait();
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(maliciousMinter.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        let result = false;
        try {
          // Mint
          const tx = await maliciousMinter
            .connect(wallets[2])
            .mint(desImages.address, {
              value: ethers.utils.parseEther("1"),
            });
          await tx.wait();
          // console.log(await wallets[2].getBalance());
          // console.log(await waffle.provider.getBalance(maliciousMinter.address));
          // console.log(await waffle.provider.getBalance(desImages.address));
          result = true;
        } catch (err) {
          // console.log(err);
        }
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(maliciousMinter.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        expect(result).to.equal(false);
      });
    });

    // TODO: not enough gas sent
    // TODO: whenPaused
  });

  describe("burn()", function () {
    describe("Expected:", function () {
      it("burn tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        let tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        let receipt = await tx.wait();
        let ev = receipt.events.filter((ev: any) => ev.event === "Minted");
        const tokenId = ev[0].args.tokenId.toHexString();
        tx = await desImages.connect(wallets[1]).burn(BigNumber.from(tokenId));
        receipt = await tx.wait();
        ev = receipt.events.filter((ev: any) => ev.event === "Burned");
        expect(ev[0].args.from).to.equal(wallets[1].address);
        expect(ev[0].args.tokenId.toHexString()).to.equal(tokenId);
        expect(await desImages.getTokenStatus(date, ciphertext)).to.equal(2);
      });

      // TODO: can burn from contract
    });

    describe("Security:", function () {
      it("prevents from minting burned tokens", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        let tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        const receipt = await tx.wait();
        const ev = receipt.events.filter((ev: any) => ev.event === "Minted");
        const tokenId = ev[0].args.tokenId.toHexString();
        tx = await desImages.connect(wallets[1]).burn(BigNumber.from(tokenId));
        await tx.wait();
        let result = false;
        try {
          const tx = await desImages
            .connect(wallets[1])
            .mint(date, ciphertext, {
              value: ethers.utils.parseEther("0.2"),
            });
          await tx.wait();
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });

      // TODO:
      // it("prevents from burning non-minted tokens", async function () {});

      // TODO:
      // it("prevents from burning burned tokens", async function () {});

      // TODO:
      // it("prevents from burning other people's tokens", async function () {});

      it("prevents from re-entrancy", async function () {
        const date = 8274177;
        const ciphertext = "0x79030f7920aaa3cfbbd92afbb93e70ba";
        const tokenId =
          "0x904c30d7b2b143b3fff62dfadb49ac588fa11f3dd5c82b1011841032f09c260d";
        // Contract deploy
        const MaliciousBurner = await ethers.getContractFactory(
          "MinterBurner",
          {
            signer: signers[2],
          }
        );
        const maliciousBurner = await MaliciousBurner.deploy(
          date,
          BigNumber.from(ciphertext),
          2
        );
        await maliciousBurner.deployed();
        const { date: _date, ciphertext: _ciphertext } = getDateAndCiphertext(
          2020,
          2,
          2
        );
        let tx = await desImages.connect(wallets[1]).mint(_date, _ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        await tx.wait();
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(maliciousBurner.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        // Mint
        tx = await maliciousBurner.connect(wallets[2]).mint(desImages.address, {
          value: ethers.utils.parseEther("1"),
        });
        await tx.wait();
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(maliciousBurner.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        // SetTokenId
        tx = await maliciousBurner
          .connect(wallets[2])
          .setTokenId(BigNumber.from(tokenId));
        await tx.wait();
        let result = false;
        try {
          // Burn
          const tx = await maliciousBurner
            .connect(wallets[2])
            .burn(desImages.address);
          await tx.wait();
          // console.log(await wallets[2].getBalance());
          // console.log(await waffle.provider.getBalance(maliciousBurner.address));
          // console.log(await waffle.provider.getBalance(desImages.address));
          result = true;
        } catch (err) {
          // console.log(err);
        }
        // console.log(await wallets[2].getBalance());
        // console.log(await waffle.provider.getBalance(maliciousBurner.address));
        // console.log(await waffle.provider.getBalance(desImages.address));
        expect(result).to.equal(false);
      });
    });
  });

  describe("tokenURI()", function () {
    it("gets tokenURI", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
        value: ethers.utils.parseEther("0.1"),
      });
      const receipt = await tx.wait();
      const ev = receipt.events.filter((ev: any) => ev.event === "Minted");
      const tokenId = ev[0].args.tokenId.toHexString();
      const tokenURI = await desImages
        .connect(wallets[1])
        .tokenURI(BigNumber.from(tokenId));
      // console.log(tokenURI);
      expect(tokenURI?.length).to.be.greaterThan(0);
    });

    describe("Security:", function () {
      it("fails to get burned tokenURI", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        let tx = await desImages.connect(wallets[1]).mint(date, ciphertext, {
          value: ethers.utils.parseEther("0.1"),
        });
        const receipt = await tx.wait();
        const ev = receipt.events.filter((ev: any) => ev.event === "Minted");
        const tokenId = ev[0].args.tokenId.toHexString();
        tx = await desImages.connect(wallets[1]).burn(BigNumber.from(tokenId));
        await tx.wait();
        let result = false;
        try {
          await desImages.connect(wallets[1]).tokenURI(BigNumber.from(tokenId));
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });

      it("fails to get nonexistent token", async function () {
        const tokenId =
          "0x904c30d7b2b143b3fff62dfadb49ac588fa11f3dd5c82b1011841032f09c260d";
        let result = false;
        try {
          await desImages.connect(wallets[1]).tokenURI(BigNumber.from(tokenId));
          result = true;
        } catch (err) {}
        expect(result).to.equal(false);
      });
    });
  });

  // TODO:
  // paused
  // unpaused
  // .ownerOf(tokenId)
  // tokenIdsOf
});
