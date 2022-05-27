import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

export type Provider = ethers.providers.BaseProvider | WalletConnectProvider;

export interface WalletProvider {
  type: string;
  name: string;
  provider: Provider;
}

export type ChainName = 'mainnet' | 'rinkeby' | 'ropsten' | 'localhost' | 'hardhat';

export enum ChainId {
  MAIN_NET = '0x1',
  ROPSTEN = '0x3',
  RINKEBY = '0x4',
  LOCALHOST = '0x539',
  HARD_HAT = '0x7a69',
}

export interface Chain {
  id: ChainId;
  name: ChainName;
}

export enum TOKEN_STATUS {
  FOR_SALE = 0,
  MINTED,
  BURNED,
}

export interface TokenData {
  day: string;
  month: string;
  year: string;
  dateHex: string;
  ciphertext: string;
  plaintext?: string;
  status?: TOKEN_STATUS;
  isOwner?: boolean;
  tokenId?: string;
}

export interface PreviewFormData {
  year: string;
  month: string;
  day: string;
  plaintext?: string;
  ciphertext?: string;
}

export interface ContractState {
  isPaused: boolean;
  totalEverMinted: string;
  totalSupply: string;
  mintPrice: string;
  burnPrice: string;
}
