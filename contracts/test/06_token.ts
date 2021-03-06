/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, Wallet } from "ethers";
import { ethers, waffle } from "hardhat";
import { getDateAndCiphertext } from "test/utils/getDateAndCiphertext";
import { getTokenId } from "test/utils/getTokenId";

describe("DesImages--token-utility", function () {
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

  describe("getTokenStatus()", function () {
    it("returns 0 for tokens for sale", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tokenId = BigNumber.from(getTokenId(date, ciphertext));
      const status = await desImages.getTokenStatus(tokenId);
      expect(status).to.equal(0);
    });

    it("returns 1 for minted tokens", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tokenId = BigNumber.from(getTokenId(date, ciphertext));
      const tx = await desImages.connect(user).mint(date, ciphertext, {
        value: mintPrice,
      });
      await tx.wait();
      const status = await desImages.getTokenStatus(tokenId);
      expect(status).to.equal(1);
    });

    it("returns 2 for burned tokens", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tokenId = BigNumber.from(getTokenId(date, ciphertext));
      let tx = await desImages.connect(user).mint(date, ciphertext, {
        value: mintPrice,
      });
      await tx.wait();
      tx = await desImages.connect(user).burn(tokenId);
      await tx.wait();
      const status = await desImages.getTokenStatus(tokenId);
      expect(status).to.equal(2);
    });
  });

  describe("currentMintPrice()", function () {
    it("returns current token price", async function () {
      expect(mintPrice.gt(0)).to.equal(true);
    });

    it("starts at 0.01 ether as the initial price", async function () {
      const initialPrice = ethers.utils.parseEther("0.01");
      mintPrice = await desImages.currentMintPrice();
      expect(mintPrice.eq(initialPrice)).to.equal(true);
    });

    it("is related to the token's total supply amount (the initial price + the total supply amount * 0.001 ether)", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tokenId = BigNumber.from(getTokenId(date, ciphertext));
      const initialPrice = ethers.utils.parseEther("0.01");
      let tx = await desImages.connect(user).mint(date, ciphertext, {
        value: mintPrice,
      });
      await tx.wait();
      let totalSupply = await desImages.totalSupply();
      let newMintPrice = await desImages.currentMintPrice();
      expect(
        newMintPrice.eq(
          initialPrice.add(ethers.utils.parseEther("0.001").mul(totalSupply))
        )
      ).to.equal(true);

      tx = await desImages.connect(user).burn(tokenId);
      await tx.wait();
      totalSupply = await desImages.totalSupply();
      newMintPrice = await desImages.currentMintPrice();
      expect(
        newMintPrice.eq(
          initialPrice.add(ethers.utils.parseEther("0.001").mul(totalSupply))
        )
      ).to.equal(true);
    });
  });

  describe("currentBurnReward()", function () {
    it("returns current token price", async function () {
      const burnReward = await desImages.currentBurnReward();
      expect(burnReward.gt(0)).to.equal(true);
    });

    it("equals to 99.5% of last mint price", async function () {
      const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
      const tx = await desImages.connect(user).mint(date, ciphertext, {
        value: mintPrice,
      });
      await tx.wait();
      const burnReward = await desImages.currentBurnReward();
      expect(burnReward.eq(mintPrice.mul(9950).div(10000))).to.equal(true);
    });
  });

  describe("ERC721:", function () {
    describe("ownerOf()", function () {
      it("returns the owner address of a token", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));
        const tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        expect(await desImages.ownerOf(tokenId)).to.equal(user.address);
      });

      it("fails if no owner of the token is found", async function () {
        const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
        const tokenId = BigNumber.from(getTokenId(date, ciphertext));
        await expect(desImages.ownerOf(tokenId)).to.be.reverted;

        let tx = await desImages.connect(user).mint(date, ciphertext, {
          value: mintPrice,
        });
        await tx.wait();
        tx = await desImages.connect(user).burn(tokenId);
        await tx.wait();
        await expect(desImages.ownerOf(tokenId)).to.be.reverted;
      });
    });

    describe("balanceOf()", function () {
      it("returns the amount of tokens owned by an address", async function () {
        const { date: d1, ciphertext: c1 } = getDateAndCiphertext(2020, 1, 1);
        const tokenId1 = BigNumber.from(getTokenId(d1, c1));
        let tx = await desImages.connect(user).mint(d1, c1, {
          value: mintPrice,
        });
        await tx.wait();
        expect(await desImages.balanceOf(user.address)).to.equal(
          BigNumber.from(1)
        );

        mintPrice = await desImages.currentMintPrice();
        const { date: d2, ciphertext: c2 } = getDateAndCiphertext(2020, 1, 2);
        tx = await desImages.connect(user).mint(d2, c2, {
          value: mintPrice,
        });
        await tx.wait();
        expect(await desImages.balanceOf(user.address)).to.equal(
          BigNumber.from(2)
        );

        tx = await desImages.connect(user).burn(tokenId1);
        await tx.wait();
        expect(await desImages.balanceOf(user.address)).to.equal(
          BigNumber.from(1)
        );
      });
    });
  });

  describe("IERC721Metadata:", function () {
    describe("tokenURI()", function () {
      describe("Expected:", function () {
        it("gets tokenURI", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          const tx = await desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          });
          await tx.wait();
          const tokenURI = await desImages.connect(user).tokenURI(tokenId);
          expect(tokenURI.length).to.be.greaterThan(0);
          const json = JSON.parse(
            Buffer.from(
              tokenURI.replace("data:application/json;base64,", ""),
              "base64"
            ).toString("utf8")
          );

          expect(json.name).to.equal("desImages#20200101");
          expect(json.description).to.equal(
            "'i am still alive' is a plaintext made up of sixteen ISO-8859-1 characters encrypted into a 128-bit ciphertext using the DES algorithm in ECB mode. The phrase refers to Japanese artist On Kawara's canonical series of telegram artworks from 1969. Upon encryption, the ciphertext is then divided up into sixteen units of 8-bit value. Each unit is used to derive the shades of sixteen squares, which are layered on each other in a manner similar to the paintings 'Homage to the Square' by German-American artist Josef Albers. The leftmost 8-bit value corresponds to the shade of the outermost square, while the rightmost value corresponds to the shade of the innermost square. Each token is titled with a UTC date written in the ISO-8601 format (YYYYMMDD) between 2020-01-01 and the timestamp date of the current block. These eight ISO-8859-1 characters form a 64-bit key for the DES algorithm."
          );
          expect(json.image).to.equal(
            "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48dGl0bGU+ZGVzSW1hZ2VzIzIwMjAwMTAxPC90aXRsZT48bWV0YWRhdGEgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIj48cmRmOlJERj48Y2M6V29yayByZGY6YWJvdXQ9IiI+PGNjOmxpY2Vuc2UgcmRmOnJlc291cmNlPSJodHRwczovL2NyZWF0aXZlY29tbW9ucy5vcmcvcHVibGljZG9tYWluL3plcm8vMS4wLyIgLz48L2NjOldvcms+PC9yZGY6UkRGPjwvbWV0YWRhdGE+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIGZpbGw9IiM3OTc5NzkiIHN0cm9rZT0ibm9uZSIgLz48cmVjdCB4PSI0IiB5PSI2IiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzAzMDMwMyIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjgiIHk9IjEyIiB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgZmlsbD0iIzBmMGYwZiIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjEyIiB5PSIxOCIgd2lkdGg9IjEwNCIgaGVpZ2h0PSIxMDQiIGZpbGw9IiM3OTc5NzkiIHN0cm9rZT0ibm9uZSIgLz48cmVjdCB4PSIxNiIgeT0iMjQiIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiIgZmlsbD0iIzIwMjAyMCIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjIwIiB5PSIzMCIgd2lkdGg9Ijg4IiBoZWlnaHQ9Ijg4IiBmaWxsPSIjYWFhYWFhIiBzdHJva2U9Im5vbmUiIC8+PHJlY3QgeD0iMjQiIHk9IjM2IiB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNhM2EzYTMiIHN0cm9rZT0ibm9uZSIgLz48cmVjdCB4PSIyOCIgeT0iNDIiIHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgZmlsbD0iI2NmY2ZjZiIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjMyIiB5PSI0OCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjYmJiYmJiIiBzdHJva2U9Im5vbmUiIC8+PHJlY3QgeD0iMzYiIHk9IjU0IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9IiNkOWQ5ZDkiIHN0cm9rZT0ibm9uZSIgLz48cmVjdCB4PSI0MCIgeT0iNjAiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgZmlsbD0iIzJhMmEyYSIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjQ0IiB5PSI2NiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmJmYmZiIiBzdHJva2U9Im5vbmUiIC8+PHJlY3QgeD0iNDgiIHk9IjcyIiB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9IiNiOWI5YjkiIHN0cm9rZT0ibm9uZSIgLz48cmVjdCB4PSI1MiIgeT0iNzgiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iIzNlM2UzZSIgc3Ryb2tlPSJub25lIiAvPjxyZWN0IHg9IjU2IiB5PSI4NCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjNzA3MDcwIiBzdHJva2U9Im5vbmUiIC8+PHJlY3QgeD0iNjAiIHk9IjkwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjYmFiYWJhIiBzdHJva2U9Im5vbmUiIC8+PC9zdmc+"
          );
          const svg = Buffer.from(
            json.image.replace("data:image/svg+xml;base64,", ""),
            "base64"
          ).toString("utf8");

          expect(svg).to.equal(
            '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 128 128"><title>desImages#20200101</title><metadata xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#"><rdf:RDF><cc:Work rdf:about=""><cc:license rdf:resource="https://creativecommons.org/publicdomain/zero/1.0/" /></cc:Work></rdf:RDF></metadata><rect x="0" y="0" width="128" height="128" fill="#797979" stroke="none" /><rect x="4" y="6" width="120" height="120" fill="#030303" stroke="none" /><rect x="8" y="12" width="112" height="112" fill="#0f0f0f" stroke="none" /><rect x="12" y="18" width="104" height="104" fill="#797979" stroke="none" /><rect x="16" y="24" width="96" height="96" fill="#202020" stroke="none" /><rect x="20" y="30" width="88" height="88" fill="#aaaaaa" stroke="none" /><rect x="24" y="36" width="80" height="80" fill="#a3a3a3" stroke="none" /><rect x="28" y="42" width="72" height="72" fill="#cfcfcf" stroke="none" /><rect x="32" y="48" width="64" height="64" fill="#bbbbbb" stroke="none" /><rect x="36" y="54" width="56" height="56" fill="#d9d9d9" stroke="none" /><rect x="40" y="60" width="48" height="48" fill="#2a2a2a" stroke="none" /><rect x="44" y="66" width="40" height="40" fill="#fbfbfb" stroke="none" /><rect x="48" y="72" width="32" height="32" fill="#b9b9b9" stroke="none" /><rect x="52" y="78" width="24" height="24" fill="#3e3e3e" stroke="none" /><rect x="56" y="84" width="16" height="16" fill="#707070" stroke="none" /><rect x="60" y="90" width="8" height="8" fill="#bababa" stroke="none" /></svg>'
          );
        });
      });

      describe("Security:", function () {
        it("fails to get burned tokenURI", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          let tx = await desImages.connect(user).mint(date, ciphertext, {
            value: mintPrice,
          });
          await tx.wait();
          tx = await desImages.connect(user).burn(tokenId);
          await tx.wait();
          await expect(desImages.connect(user).tokenURI(tokenId)).to.be
            .reverted;
        });

        it("fails to get nonexistent token", async function () {
          const { date, ciphertext } = getDateAndCiphertext(2020, 1, 1);
          const tokenId = BigNumber.from(getTokenId(date, ciphertext));
          await expect(desImages.connect(user).tokenURI(tokenId)).to.be
            .reverted;
        });
      });
    });
  });
});
