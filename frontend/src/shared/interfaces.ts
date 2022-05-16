import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

export type Provider = ethers.providers.Provider | WalletConnectProvider;

export interface WalletProvider {
  type: string;
  name: string;
  provider: Provider;
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
