import { BigNumber, Contract, ethers } from 'ethers';
import { TOKEN_STATUS } from '../interfaces';

export async function getTotalEverMinted(contract: Contract): Promise<string | undefined> {
  try {
    const newTotalEverMinted = (await contract.totalEverMinted()).toString();
    return newTotalEverMinted;
  } catch (err) {
    console.error(err);
  }
  return '';
}

export async function getTotalSupply(contract: Contract): Promise<string | undefined> {
  try {
    const newTotalSupply = (await contract.totalSupply()).toString();
    return newTotalSupply;
  } catch (err) {
    console.error(err);
  }
  return '';
}

export async function getCurrentPrice(contract: Contract): Promise<string | undefined> {
  try {
    // console.log(
    //   JSON.parse(
    //     atob(
    //       (
    //         await contract.current.tokenURI(
    //           BigNumber.from('0x0c807bfbbe2e0aa939e0d2841ed15d6d1c3df0601741ea7790dfec8964e51c00'),
    //         )
    //       ).replace(/^data:application\/json;base64,/, ''),
    //     ),
    //   ),
    // );
    const newCost = ethers.utils.formatEther(await contract.currentMintPrice());
    return newCost;
  } catch (err) {
    console.error(err);
  }
  return '';
}

export async function getTokenStatus(
  contract: Contract,
  dateHex: string,
  ciphertext: string,
): Promise<TOKEN_STATUS | undefined> {
  try {
    return await contract.getTokenStatus(parseInt(dateHex), BigNumber.from(ciphertext));
  } catch (err) {
    console.error(err);
  }
}

export async function mint(
  contract: Contract,
  walletAddress: string,
  dateHex: string,
  ciphertext: string,
  cost: string,
) {
  try {
    const tx = await contract.mint(walletAddress, parseInt(dateHex), BigNumber.from(ciphertext), {
      value: ethers.utils.parseEther(cost),
    });
    const receipt = await tx.wait();
    const ev = receipt.events.filter((ev: any) => ev.event === 'Minted');
    console.log(ev?.[0]?.args?.tokenId?.toHexString());
  } catch (err) {}
}

// TODO: burn
