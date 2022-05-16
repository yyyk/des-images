import { BigNumber, ethers } from 'ethers';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import { decrypt, encrypt } from 'src/shared/utils/des';

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
    day: day.padStart(2, '0'),
    month: month.padStart(2, '0'),
    year: year.padStart(4, '0'),
    dateHex: `0x${toHexString(year)}${toHexString(month)}${toHexString(day).padStart(2, '0')}`,
    ciphertext: _ciphertext,
    plaintext: _plaintext,
  };
}

export function isSameTokenData(d1: TokenData, d2: TokenData): boolean {
  return d1.dateHex === d2.dateHex && d1.ciphertext === d2.ciphertext;
}

export function convertTokenURIToTokenData(uri: string, tokenId: string): TokenData {
  try {
    const json = JSON.parse(atob(uri?.replace('data:application/json;base64,', '') ?? ''));
    const date = json?.name?.replace('desImages#', '');
    const svg = atob(json?.image?.replace('data:image/svg+xml;base64,', '') ?? '');
    return {
      ...getTokenData({
        year: date.slice(0, 4),
        month: date.slice(4, 6),
        day: date.slice(6),
        ciphertext: `0x${svg
          .match(/fill="#([0-9a-fA-F]{6})"/gi)
          ?.map((str) => {
            const res = /fill="#([0-9a-fA-F]{2})[0-9a-fA-F]{4}"/.exec(str);
            return (res && res[1]) ?? '';
          })
          .join('')}`,
      }),
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId,
    };
  } catch (err: any) {
    throw new Error(err);
  }
}

export function getTokenId(data: TokenData): string {
  return ethers.utils.solidityKeccak256(
    ['uint32', 'uint128'],
    [parseInt(data.dateHex), BigNumber.from(data.ciphertext)],
  );
}
