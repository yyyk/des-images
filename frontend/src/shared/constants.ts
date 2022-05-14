export const defaultTokenData = {
  day: '02',
  month: '01',
  year: '2020',
  dateHex: '0x7e4102',
  ciphertext: '0x352010205f73416bc52b5d25b30be77d',
};

export const PLAINTEXT_LENGTH = 16;
export const CIPHERTEXT_LENGTH = 34;

export const DEFAULT_PLAINTEXT = 'i am still alive';
export const DEFAULT_CIPHERTEXT = '0x00112233445566778899aabbccddeeff';
export const DEFAULT_DATE = '2020-01-01'; // `${year}-${month}-${day}`;

// const APP_LOGO_URL = 'https://example.com/logo.png';
export const ETH_MAINNET_JSONRPC_URL = process.env.REACT_ETH_MAINNET_JSONRPC_URL ?? '';
export const HARDHAT_JSONRPC_URL = 'http://127.0.0.1:8545/';
export const MAINNET_CHAIN_ID = 1;
export const HARDHAT_CHAIN_ID = 1337;

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';

export const LOCAL_STORAGE_WALLET_KEY = 'wallet';
