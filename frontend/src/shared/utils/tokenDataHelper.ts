import { TokenData } from 'src/shared/interfaces';
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
