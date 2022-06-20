import { BigNumber, Contract, ethers } from 'ethers';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { decrypt, encrypt } from 'src/shared/utils/des';
import { getTokenStatus as _getTokenStatus, getOwnerOf as _getOwnerOf, tokenURI } from 'src/shared/services/contract';
import { LOCAL_STORAGE_TOKEN_DATA_KEY } from 'src/shared/constants';
import { isSameAddress } from 'src/shared/utils/contractHelpers';

function toHexString(value: string): string {
  return parseInt(value).toString(16);
}

export function getTokenData({
  year,
  month,
  day,
  plaintext,
  ciphertext,
}: {
  year: string;
  month: string;
  day: string;
  plaintext?: string;
  ciphertext?: string;
}): TokenData {
  const _ciphertext = ciphertext || encrypt(`${year}${month}${day}`, plaintext || undefined);
  const _plaintext = plaintext || (ciphertext ? decrypt(`${year}${month}${day}`, ciphertext as string) : undefined);
  return {
    year: year.padStart(4, '0'),
    month: month.padStart(2, '0'),
    day: day.padStart(2, '0'),
    dateHex: `0x${toHexString(year)}${toHexString(month)}${toHexString(day).padStart(2, '0')}`,
    ciphertext: _ciphertext,
    plaintext: _plaintext,
  };
}

export function isSameTokenData(d1: TokenData, d2: TokenData): boolean {
  return d1.dateHex === d2.dateHex && d1.ciphertext === d2.ciphertext;
}

export function decryptSvg(svg: string): string {
  return `0x${svg
    .match(/fill="#([0-9a-fA-F]{6})"/gi)
    ?.map((str) => {
      const res = /fill="#([0-9a-fA-F]{2})[0-9a-fA-F]{4}"/.exec(str);
      return (res && res[1]) ?? '';
    })
    .join('')}`;
}

export function convertTokenURIToTokenData(
  uri: string,
  tokenId: string,
  isOwner = true,
  status = TOKEN_STATUS.MINTED,
  isInProcess = false,
): TokenData {
  try {
    const json = JSON.parse(atob(uri?.replace('data:application/json;base64,', '') ?? ''));
    const date = json?.name?.replace('desImages#', '');
    const svg = atob(json?.image?.replace('data:image/svg+xml;base64,', '') ?? '');
    return {
      ...getTokenData({
        year: date.slice(0, 4),
        month: date.slice(4, 6),
        day: date.slice(6),
        ciphertext: decryptSvg(svg),
      }),
      isOwner,
      status,
      tokenId,
      isInProcess,
    };
  } catch (err: any) {
    throw new Error(err);
  }
}

const cachedTokenData: { [key: string]: TokenData } = {};

export function deleteTokenDataCacheOf(id: string): void {
  cachedTokenData[id] && delete cachedTokenData[id];
}

export async function getTokenDataFromTokenIds(contract: Contract, ids: string[]): Promise<TokenData[]> {
  const res: TokenData[] = [];
  if (!ids || !Array.isArray(ids)) {
    return res;
  }
  for (const id of ids) {
    if (id) {
      if (cachedTokenData[id]) {
        res.push({ ...cachedTokenData[id] });
        continue;
      }
      try {
        const uri = await tokenURI(contract, id);
        const data = convertTokenURIToTokenData(uri, id);
        cachedTokenData[id] = { ...data };
        res.push(data);
      } catch (err) {
        console.error(err);
      }
    }
  }
  return res;
}

export function getTokenId(dateHex: string, ciphertext: string): string {
  return ethers.utils.solidityKeccak256(['uint32', 'uint128'], [parseInt(dateHex), BigNumber.from(ciphertext)]);
}

export async function getTokenStatus(
  contract: Contract | null | undefined,
  data: TokenData,
): Promise<TOKEN_STATUS | undefined> {
  if (!contract) {
    return undefined;
  }
  try {
    return await _getTokenStatus(contract, data.dateHex, data.ciphertext);
  } catch (err) {}
  return undefined;
}

export async function getOwnerOf(contract: Contract | null | undefined, data: TokenData): Promise<string> {
  if (!contract) {
    return '';
  }
  try {
    return await _getOwnerOf(contract, data.dateHex, data.ciphertext);
  } catch (err) {}
  return '';
}

export async function updateTokenDataStatus(
  contract: Contract | null,
  tokenData: TokenData[],
  walletAddress: string,
): Promise<TokenData[]> {
  const result: TokenData[] = [];
  for (const data of tokenData) {
    if (data) {
      let _data: TokenData = { ...data };
      const status = await getTokenStatus(contract, _data);
      _data = { ..._data, status };
      const ownerAddress = await getOwnerOf(contract, _data);
      const isOwner = ownerAddress.length === 0 ? false : isSameAddress(ownerAddress, walletAddress);
      const tokenId = isOwner ? getTokenId(_data.dateHex, _data.ciphertext) : '';
      _data = { ..._data, isOwner, tokenId };
      result.push(_data);
    }
  }
  return result;
}

export function writeTokenDataToLocalStorage(data: TokenData[]): void {
  try {
    window.localStorage.setItem(
      LOCAL_STORAGE_TOKEN_DATA_KEY,
      JSON.stringify(
        data.map(({ day, month, year, dateHex, ciphertext, plaintext }) => ({
          year,
          month,
          day,
          dateHex,
          ciphertext,
          plaintext,
        })),
      ),
    );
  } catch (err) {}
}

export function getTokenDataFromLocalStorage(): TokenData[] {
  const storedData = window.localStorage.getItem(LOCAL_STORAGE_TOKEN_DATA_KEY);
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData)) {
        return parsedData;
      }
    } catch (err) {}
  }
  return [];
}
