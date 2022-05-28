import { BigNumber, Contract, ethers } from 'ethers';
import { BASE_MINT_PRICE, ETH_NETWORK, MINT_PRICE_COEF, RESERVE_CUT_OVER_10000 } from 'src/shared/constants';
import { ChainName } from '../interfaces';

// TODO: replace with subgraph in the future?
export async function queryTokenIds(contract: Contract, walletAddress: string): Promise<string[]> {
  const startBlock = parseInt(
    ETH_NETWORK === ChainName.RINKEBY
      ? '10755524'
      : ETH_NETWORK === ChainName.MAIN_NET
      ? '14859331' // TODO: update needed once contract deployed
      : '0',
  );
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
        if (isSameAddress(to ?? '', walletAddress)) {
          owned.add(tokenId.toHexString());
        } else if (isSameAddress(from ?? '', walletAddress)) {
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
  const basePrice = ethers.utils.parseEther(BASE_MINT_PRICE);
  const coef = ethers.utils.parseEther(MINT_PRICE_COEF);
  return ethers.utils.formatEther(basePrice.add(coef.mul(totalSupply))).toString();
}

export function calcBurnReward(totalSupply: BigNumber): string {
  const basePrice = ethers.utils.parseEther(BASE_MINT_PRICE);
  const coef = ethers.utils.parseEther(MINT_PRICE_COEF);
  return ethers.utils
    .formatEther(
      basePrice
        .add(coef.mul(totalSupply.sub(1)))
        .mul(RESERVE_CUT_OVER_10000)
        .div(10000),
    )
    .toString();
}

export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
