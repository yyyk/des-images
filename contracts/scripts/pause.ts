import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  if (!process.env.CONTRACT_ADDRESS) {
    return;
  }

  const DesImages = await ethers.getContractFactory("DesImages");
  const desImages = await DesImages.attach(process.env.CONTRACT_ADDRESS);
  await desImages.pause();
  console.log("desImages paused.");

  const receipt = await desImages.deployTransaction.wait();
  console.log("gasUsed:", receipt.gasUsed._hex);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
