const PERMUTED_CHOICE1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55,
  47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

const PERMUTED_CHOICE2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30,
  40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
];

const INITIAL_PERMUTATION = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24,
  16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31,
  23, 15, 7,
];

const EXPANSION = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22,
  23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
];

const PERMUTATION = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];

const INVERSE_PERMUTATION = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21,
  61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49,
  17, 57, 25,
];

const SUBSTITUTION_BOX = [
  [
    14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 4, 1,
    14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13,
  ],
  [
    15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5, 0, 14,
    7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9,
  ],
  [
    10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 13, 6,
    4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12,
  ],
  [
    7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 10, 6,
    9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14,
  ],
  [
    2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 4, 2, 1,
    11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3,
  ],
  [
    12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 9, 14,
    15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13,
  ],
  [
    4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 1, 4,
    11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12,
  ],
  [
    13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 7, 11,
    4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11,
  ],
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

function strToBinaryArray(str: string): number[] {
  let v = [];
  for (let i = 0; i < str.length; i++) {
    const index = str.charCodeAt(i);
    if (index > 255) {
      // TODO:
      throw new Error(`invalid character: ${str[i]}`);
    }
    v.push(index);
  }
  return v.reduce(
    (res, value) => [
      ...res,
      ...value
        .toString(2)
        .padStart(8, '0')
        .split('')
        .map((v) => parseInt(v)),
    ],
    [] as number[],
  );
}

function hexToBinaryArray(hex: string): number[] {
  let v = [];
  for (let i = 0; i < hex.length; i += 2) {
    v.push(parseInt(hex[i] + hex[i + 1], 16));
  }
  return v.reduce(
    (res, value) => [
      ...res,
      ...value
        .toString(2)
        .padStart(8, '0')
        .split('')
        .map((v) => parseInt(v)),
    ],
    [] as number[],
  );
}

function BinaryArrToHexString(arr: number[]): string {
  let result = '';
  for (let i = 0; i < arr.length; i += 4) {
    result += parseInt(arr.slice(i, i + 4).join(''), 2).toString(16);
  }
  return `0x${result}`;
}

function BinaryArrToString(arr: number[]): string {
  let result = '';
  for (let i = 0; i < arr.length; i += 8) {
    const index = parseInt(arr.slice(i, i + 8).join(''), 2);
    if ((index >= 0 && index <= 31) || (index >= 127 && index <= 160) || index === 173) {
      result += `\\x${index.toString(16).padStart(2, '0')}`;
      continue;
    }
    result += String.fromCharCode(index);
  }
  return result;
}

function shiftLeft(arr: number[], amount: number): number[] {
  return [...arr.slice(amount), ...arr.slice(0, amount)];
}

function permute(bits: number[], table: number[]): number[] {
  return table.map((value) => bits[value - 1]);
}

function xor(arr1: number[], arr2: number[]): number[] {
  return arr1.map((value, index) => value ^ arr2[index]);
}

function genKey(keyString: string): number[][] {
  let key = strToBinaryArray(keyString);
  key = permute(key, PERMUTED_CHOICE1);
  let keySet = [key.slice(0, 28), key.slice(28)];
  const result = [];
  for (const val of SHIFTS) {
    keySet = [shiftLeft(keySet[0], val), shiftLeft(keySet[1], val)];
    result.push(permute([...keySet[0], ...keySet[1]], PERMUTED_CHOICE2));
  }
  return result;
}

function process(arr: number[], key: number[]): number[] {
  const block = xor(permute(arr, EXPANSION), key);
  let result: number[] = [];
  for (let i = 0; i < SUBSTITUTION_BOX.length; i++) {
    const box = SUBSTITUTION_BOX[i];
    const b6 = parseInt(`${block.slice(i * 6, i * 6 + 6).join('')}`, 2);
    result = result.concat(
      box[(b6 & 0b100000) | ((b6 & 0b000001) << 4) | ((b6 & 0b011110) >> 1)]
        .toString(2)
        .padStart(4, '0')
        .split('')
        .map((v) => parseInt(v)),
    );
  }
  return permute(result, PERMUTATION);
}

function encodeBlock(block: number[], keys: number[][]) {
  const _block = permute(block, INITIAL_PERMUTATION);
  let blocks = [_block.slice(0, 32), _block.slice(32)];
  for (const key of keys) {
    blocks = [blocks[1], xor(blocks[0], process(blocks[1], key))];
  }
  return permute([...blocks[1], ...blocks[0]], INVERSE_PERMUTATION);
}

function encode(message: string, keys: number[][], encryption = true): number[] {
  const messageArray = encryption ? strToBinaryArray(message) : hexToBinaryArray(message);
  const blocks = [messageArray.slice(0, 64), messageArray.slice(64)];
  return blocks.flatMap((block) => encodeBlock(block, keys));
}

export function isValidPlaintext(plaintext: string): boolean {
  for (let i = 0; i < plaintext.length; i++) {
    const code = plaintext.charCodeAt(i);
    if (code < 0 || code > 255) {
      return false;
    }
  }
  return true;
}

export function isValidCiphertext(ciphertext: string): boolean {
  return new RegExp(/^0x[0-9a-f]*$/, 'gi').test(ciphertext);
}

export function generateDateString(year: number, month: number, date: number): string {
  return `${year}${month.toString().padStart(2, '0')}${date.toString().padStart(2, '0')}`;
}

export function encrypt(key: string, plaintext: string = 'i am still alive'): string {
  if (key.length !== 8) {
    throw new Error('key has to be 8 char long');
  }
  if (!isValidPlaintext(plaintext)) {
    throw new Error('invalid plaintext');
  }
  const encryptionKey = genKey(key);
  return BinaryArrToHexString(encode(plaintext.padEnd(16, ' '), encryptionKey, true));
}

export function decrypt(key: string, ciphertext: string): string {
  if (key.length !== 8) {
    throw new Error('key has to be 8 char long');
  }
  if (!isValidCiphertext(ciphertext.length === 32 ? `0x${ciphertext}` : ciphertext)) {
    throw new Error('invalid ciphertext');
  }
  if (ciphertext.length % 8 === 2 && new RegExp(/^0x/).test(ciphertext)) {
    ciphertext = ciphertext.slice(2);
  }
  if (ciphertext.length !== 32) {
    throw new Error('invalid ciphertext length');
  }
  const decyptionKey = genKey(key).reverse();
  return BinaryArrToString(encode(ciphertext, decyptionKey, false));
}
