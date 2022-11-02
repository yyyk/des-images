import { BigNumber, Contract, ethers } from 'ethers';
import { BASE_MINT_PRICE, ETH_NETWORK, MINT_PRICE_COEF, RESERVE_CUT_OVER_10000 } from 'src/shared/constants';
import { CHAIN_NAME } from 'src/shared/interfaces';
import { isNil } from 'src/shared/utils/isNil';

// TODO: replace with subgraph in the future?
export async function queryTokenIds(
  contract: Contract,
  walletAddress: string,
  currentBlock?: number,
): Promise<string[]> {
  const startBlock = parseInt(
    ETH_NETWORK === CHAIN_NAME.RINKEBY ? '10793462' : ETH_NETWORK === CHAIN_NAME.MAIN_NET ? '15074398' : '0', // localhost
  );
  const endBlock = (isNil(currentBlock) ? await contract.provider.getBlockNumber() : currentBlock) as number;
  const owned: Set<string> = new Set();
  for (let i = startBlock; i <= endBlock; i += 2000) {
    const _startBlock = i;
    const _endBlock = Math.min(endBlock, i + 1999);
    const sentLogs = await contract.queryFilter(contract.filters.Transfer(walletAddress, null), _startBlock, _endBlock);
    const receivedLogs = await contract.queryFilter(
      contract.filters.Transfer(null, walletAddress),
      _startBlock,
      _endBlock,
    );
    const logs = sentLogs
      .concat(receivedLogs)
      .sort((a, b) => a.blockNumber - b.blockNumber || a.transactionIndex - b.transactionIndex);
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
  }
  const result = Array.from(owned);
  return result.reverse();
}

const BASE_PRICE = ethers.utils.parseEther(BASE_MINT_PRICE);
const COEF = ethers.utils.parseEther(MINT_PRICE_COEF);

export function calcMintPrice(totalSupply: BigNumber): string {
  return ethers.utils.formatEther(BASE_PRICE.add(COEF.mul(totalSupply)));
}

export function calcBurnReward(totalSupply: BigNumber): string {
  return ethers.utils.formatEther(
    BASE_PRICE.add(COEF.mul(totalSupply.sub(1)))
      .mul(RESERVE_CUT_OVER_10000)
      .div(10000),
  );
}

export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}
