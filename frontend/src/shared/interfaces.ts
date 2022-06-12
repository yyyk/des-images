import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

export enum WALLET_TYPE {
  METAMASK = 'metamask',
  BRAVE = 'brave',
  OPERA = 'opera',
  COINBASE = 'coinbase',
  WALLET_CONNECT = 'wallet-connect',
  PORTIS = 'portis',
  AUTHEREUM = 'authereum',
  FORTMATIC = 'fortmatic',
}

export enum WALLET_NAME {
  METAMASK = 'MetaMask',
  BRAVE = 'Brave Wallet',
  OPERA = 'Opera Wallet',
  COINBASE = 'Coinbase Wallet',
  WALLET_CONNECT = 'WalletConnect',
  PORTIS = 'Portis',
  AUTHEREUM = 'Authereum',
  FORTMATIC = 'Fortmatic',
}

export type Provider = ethers.providers.Provider | WalletConnectProvider;

export interface WalletProvider {
  type: WALLET_TYPE;
  name: WALLET_NAME;
  provider: Provider;
  logout?: () => Promise<void> | void;
}

// export type ChainName = 'mainnet' | 'rinkeby' | 'ropsten' | 'localhost' | 'hardhat';

export enum CHAIN_NAME {
  MAIN_NET = 'mainnet',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  LOCALHOST = 'localhost',
  HARD_HAT = 'hardhat',
}

export enum CHAIN_ID {
  MAIN_NET = '0x1',
  ROPSTEN = '0x3',
  RINKEBY = '0x4',
  LOCALHOST = '0x539',
  HARD_HAT = '0x7a69',
}

export interface Chain {
  id: CHAIN_ID;
  name: CHAIN_NAME;
}

export enum TOKEN_STATUS {
  FOR_SALE = 0,
  MINTED,
  BURNED,
}

export interface TokenData {
  year: string;
  month: string;
  day: string;
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

export enum NOTIFICATION_TYPE {
  SUCCESS = 'success',
  WARNING = 'warning',
}

export interface Notification {
  id: string;
  type: NOTIFICATION_TYPE;
  text: string;
}

export enum ERROR_TYPE {
  WALLET_CONNECT_FAILED = 'WalletConnectFailed',
  INVALID_PROVIDER = 'INVALID_PROVIDER',
  INVALID_CHAIN_ID = 'InvalidChainIdError',
  NO_ADDRESS_FOUND = 'NoAddressFound',
  USER_CONNECTION_REJECTED = 'UserConnectionRejected',
  UNKNOWN_CONNECTION_ERROR = 'UnknownConnectionError',
}

export interface ConnectWalletResponse {
  success: boolean;
  error?: { type: string; message: string };
}
