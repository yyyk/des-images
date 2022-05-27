import { BigNumber, Contract, ethers } from 'ethers';
import { TOKEN_STATUS } from 'src/shared/interfaces';
import { getTokenId } from 'src/shared/utils/tokenDataHelpers';

export async function isPaused(contract: Contract): Promise<boolean> {
  try {
    return await contract.paused();
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function getTotalEverMinted(contract: Contract): Promise<string> {
  try {
    return (await contract.totalEverMinted()).toString();
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function getTotalSupply(contract: Contract): Promise<string> {
  try {
    return (await contract.totalSupply()).toString();
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function getCurrentPrice(contract: Contract): Promise<string> {
  try {
    return ethers.utils.formatEther(await contract.currentMintPrice());
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function currentBurnReward(contract: Contract): Promise<string> {
  try {
    return ethers.utils.formatEther(await contract.currentBurnReward());
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function getTokenStatus(contract: Contract, dateHex: string, ciphertext: string): Promise<TOKEN_STATUS> {
  try {
    const tokenId = getTokenId(dateHex, ciphertext);
    return await contract.getTokenStatus(BigNumber.from(tokenId));
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function mint(contract: Contract, dateHex: string, ciphertext: string, cost: string): Promise<boolean> {
  try {
    const tx = await contract.mint(parseInt(dateHex), BigNumber.from(ciphertext), {
      value: ethers.utils.parseEther(cost),
    });
    await tx.wait();
    // const receipt = await tx.wait();
    // const ev = receipt.events.filter((ev: any) => ev.event === 'Minted');
    // console.log(ev?.[0]?.args?.tokenId?.toHexString());
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function burn(contract: Contract, tokenId: string): Promise<boolean> {
  try {
    const tx = await contract.burn(BigNumber.from(tokenId));
    await tx.wait();
    // const receipt = await tx.wait();
    // const ev = receipt.events.filter((ev: any) => ev.event === 'Burned');
    // console.log(ev?.[0]?.args?.tokenId?.toHexString());
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function getOwnerOf(contract: Contract, dateHex: string, ciphertext: string): Promise<string> {
  try {
    const status = await getTokenStatus(contract, dateHex, ciphertext);
    if (status === 0 || status === 2) {
      return '';
    }
    return await contract.ownerOf(BigNumber.from(getTokenId(dateHex, ciphertext)));
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}

export async function tokenURI(contract: Contract, tokenId: string): Promise<string> {
  try {
    return await contract.tokenURI(BigNumber.from(tokenId));
  } catch (err: any) {
    console.error(err);
    throw new Error(err?.message ?? '');
  }
}
