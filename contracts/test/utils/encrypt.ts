import crypto from "crypto";

export function encrypt(year: number, month: number, date: number): string {
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
