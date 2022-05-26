import { BigNumber, Contract, ethers } from 'ethers';
import { isPaused } from 'src/shared/services/contract';

// TODO: replace with subgraph?
export async function queryTokenIds(contract: Contract, walletAddress: string): Promise<string[]> {
  const startBlock = parseInt(process.env.REACT_START_BLOCK ?? '0');
  const endBlock = await contract.provider.getBlockNumber();
  let result: string[] = [];
  for (let i = startBlock; i <= endBlock; i += 5000) {
    const _startBlock = i;
    const _endBlock = Math.min(endBlock, i + 4999);
    const sentLogs = await contract.queryFilter(contract.filters.Transfer(walletAddress, null), _startBlock, _endBlock);
    const receivedLogs = await contract.queryFilter(
      contract.filters.Transfer(null, walletAddress),
      _startBlock,
      _endBlock,
    );
    const logs = sentLogs
      .concat(receivedLogs)
      .sort((a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex);
    const owned: Set<string> = new Set();
    for (const log of logs) {
      if (log) {
        const { from, to, tokenId } = log?.args ?? ({} as any);
        if (!tokenId?.toHexString()) {
          continue;
        }
        if (to?.toLowerCase() === walletAddress.toLowerCase()) {
          owned.add(tokenId.toHexString());
        } else if (from?.toLowerCase() === walletAddress.toLowerCase()) {
          owned.delete(tokenId.toHexString());
        }
      }
    }
    result = result.concat(Array.from(owned));
  }
  // console.log('result', result.reverse());
  return result;
}

export function calcMintPrice(totalSupply: BigNumber): string {
  const basePrice = ethers.utils.parseEther('0.01');
  const coef = ethers.utils.parseEther('0.001');
  return ethers.utils.formatEther(basePrice.add(coef.mul(totalSupply))).toString();
}

export function calcBurnReward(totalSupply: BigNumber): string {
  const basePrice = ethers.utils.parseEther('0.01');
  const coef = ethers.utils.parseEther('0.001');
  return ethers.utils
    .formatEther(
      basePrice
        .add(coef.mul(totalSupply.sub(1)))
        .mul(9950)
        .div(10000),
    )
    .toString();
}

export async function getIsPaused(contract: Contract | null): Promise<boolean> {
  return !contract ? true : (await isPaused(contract)) ?? true;
}
