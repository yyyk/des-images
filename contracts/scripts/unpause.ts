import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.CONTRACT_ADDRESS) {
    return;
  }

  const DesImages = await ethers.getContractFactory("DesImages");
  const desImages = await DesImages.attach(process.env.CONTRACT_ADDRESS);
  const tx = await desImages.unpause();
  console.log("desImages unpause.");

  const receipt = await tx.wait();
  console.log("gasUsed:", receipt.gasUsed._hex);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
