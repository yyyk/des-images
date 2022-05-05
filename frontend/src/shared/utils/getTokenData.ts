import { TokenData } from 'src/shared/interfaces';
import { encrypt } from 'src/shared/utils/des';

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
  return {
    day: day.padStart(2, '0'),
    month: month.padStart(2, '0'),
    year: year.padStart(4, '0'),
    dateHex: `0x${toHexString(year)}${toHexString(month)}${toHexString(day).padStart(2, '0')}`,
    ciphertext: ciphertext || encrypt(`${year}${month}${day}`, plaintext || undefined),
  };
}
