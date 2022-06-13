import crypto from 'crypto';
import { generateDateString, encrypt } from 'src/shared/utils/des';

function _encrypt(year: number, month: number, date: number, plaintext: string = 'i am still alive'): string {
  const algorithm = 'des-ecb';
  const key = Buffer.from(generateDateString(year, month, date), 'latin1');

  const cipher = crypto.createCipheriv(algorithm, key, null);
  cipher.setAutoPadding(false);
  let encrypted = cipher.update(plaintext.padEnd(16, ' '), 'latin1', 'hex');
  encrypted += cipher.final('hex');
  return `0x${encrypted}`;
}

function _decrypt(key: string, ciphertext: string): string {
  const algorithm = 'des-ecb';
  const _key = Buffer.from(key, 'latin1');
  const decipher = crypto.createDecipheriv(algorithm, _key, null);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(ciphertext, 'hex', 'hex');
  decrypted += decipher.final('hex');
  let result = '';
  for (let i = 0; i < decrypted.length; i += 2) {
    const index = parseInt(`${decrypted.charAt(i)}${decrypted.charAt(i + 1)}`, 16);
    if ((index >= 0 && index <= 31) || (index >= 127 && index <= 160)) {
      result += `\\x${decrypted.charAt(i)}${decrypted.charAt(i + 1)}`;
      continue;
    }
    result += String.fromCharCode(index);
  }
  return result;
}

describe('encrypt', function () {
  it('returns ciphertext encrypted with DES', function () {
    expect(encrypt('20200101')).toEqual(_encrypt(2020, 1, 1));

    const plaintext = 'i was so lost...';
    expect(encrypt('20200101', plaintext)).toEqual(_encrypt(2020, 1, 1, plaintext));

    expect(encrypt('20201203')).toEqual(_encrypt(2020, 12, 3));
    expect(encrypt('20201203')).toEqual(_encrypt(2021, 12, 3)); // key clustering

    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const m = month.toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        expect(encrypt(`2020${m}${d}`)).toEqual(_encrypt(2020, month, day));
        expect(encrypt(`2021${m}${d}`)).toEqual(_encrypt(2021, month, day));
        expect(encrypt(`2022${m}${d}`)).toEqual(_encrypt(2022, month, day));

        expect(encrypt(`2020${m}${d}`, plaintext)).toEqual(_encrypt(2020, month, day, plaintext));
      }
    }

    // console.log(_decrypt('20200101', '00112233445566778899aabbccddeeff'));
  });
});

// const algorithm = "des-ecb";
// const key = Buffer.from("01012020", "latin1");
// const cipher = crypto.createCipheriv(algorithm, key, null);
// cipher.setAutoPadding(false);
// let encrypted = cipher.update("i am still alive", "latin1", "hex");
// encrypted += cipher.final("hex");
// console.log("Encrypted: ", `0x${encrypted}`);
// const decipher = crypto.createDecipheriv(algorithm, key, null);
// decipher.setAutoPadding(false);
// let decrypted = decipher.update(encrypted, "hex", "latin1");
// decrypted += decipher.final("latin1");
// console.log("Decrypted: ", decrypted);
