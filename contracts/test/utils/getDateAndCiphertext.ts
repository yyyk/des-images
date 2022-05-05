/* eslint-disable node/no-missing-import */
import { BigNumber } from "ethers";
import { encrypt } from "test/utils/encrypt";

export function getDateAndCiphertext(
  year: number,
  month: number,
  day: number
): { date: number; ciphertext: BigNumber } {
  const yearString = year.toString(16);
  const monthString = month.toString(16);
  const dayString = day.toString(16).padStart(2, "0");
  const date = parseInt(`0x${yearString}${monthString}${dayString}`);
  const ciphertext = encrypt(2020, 1, 1);
  return { date, ciphertext: BigNumber.from(ciphertext) };
}
