import { BigNumber } from "ethers";
import { ethers } from "hardhat";

export function getTokenId(date: number, ciphertext: BigNumber): string {
  return ethers.utils.solidityKeccak256(
    ["uint32", "uint128"],
    [date, ciphertext]
  );
}
