/* eslint-disable node/no-missing-import */
import crypto from "crypto";
import { BigNumber } from "ethers";

function encrypt(year: number, month: number, date: number): string {
  const algorithm = "des-ecb";
  const key = Buffer.from(
    `${year}${month.toString().padStart(2, "0")}${date
      .toString()
      .padStart(2, "0")}`,
    "ascii"
  );

  const cipher = crypto.createCipheriv(algorithm, key, null);
  cipher.setAutoPadding(false);
  let encrypted = cipher.update("i am still alive", "ascii", "hex");
  encrypted += cipher.final("hex");
  return `0x${encrypted}`;
}

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
