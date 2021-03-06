import { ContractState } from 'src/shared/interfaces';

export const defaultTokenData = {
  year: '2020',
  month: '01',
  day: '02',
  dateHex: '0x7e4102',
  ciphertext: '0x352010205f73416bc52b5d25b30be77d',
};

export const PLAINTEXT_LENGTH = 16;
export const CIPHERTEXT_LENGTH = 34;

export const DEFAULT_PLAINTEXT = 'i am still alive';
export const DEFAULT_CIPHERTEXT = '0x00112233445566778899aabbccddeeff';

const year = '2020';
const month = '01';
const day = '01';
export const DEFAULT_DATE = `${year}-${month}-${day}`;

export const LOCAL_STORAGE_WALLET_KEY = 'wallet';
export const LOCAL_STORAGE_TOKEN_DATA_KEY = 'tokenData';

export const BASE_MINT_PRICE = '0.01';
export const MINT_PRICE_COEF = '0.001';
export const RESERVE_CUT_OVER_10000 = 9950;

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';
export const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK ?? '';

export const APP_LOGO_URL = 'https://desimages.xyz/logo512.png';

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

export const DEFAULT_CONTRACT_STATE: ContractState = {
  isPaused: true,
  totalSupply: '',
  totalEverMinted: '',
  mintPrice: '',
  burnPrice: '',
};
