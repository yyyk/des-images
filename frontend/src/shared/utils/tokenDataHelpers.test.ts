import { getTokenData, isSameTokenData } from 'src/shared/utils/tokenDataHelpers';

describe('tokenDataHelpers', function () {
  describe('getTokenData', function () {
    it('returns TokenData of provided year, month, and day', function () {
      expect(getTokenData({ year: '2020', month: '01', day: '01' })).toStrictEqual({
        year: '2020',
        month: '01',
        day: '01',
        dateHex: '0x7e4101',
        ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
        plaintext: undefined,
      });
    });
  });

  describe('isSameTokenData', function () {
    it('checks if provided TokenData are the same', function () {
      const a = {
        year: '2020',
        month: '01',
        day: '01',
        dateHex: '0x7e4101',
        ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
        plaintext: undefined,
      };
      let b = {
        year: '2020',
        month: '01',
        day: '01',
        dateHex: '0x7e4101',
        ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
        plaintext: undefined,
      };
      expect(isSameTokenData(a, b)).toBeTruthy();
      b = {
        year: '2020',
        month: '01',
        day: '02',
        dateHex: '0x7e4102',
        ciphertext: '0x352010205f73416bc52b5d25b30be77d',
        plaintext: undefined,
      };
      expect(isSameTokenData(a, b)).toBeFalsy();
    });
  });

  // convertTokenURIToTokenData

  // getTokenDataFromTokenIds

  // getTokenId

  // getTokenStatus

  // getOwnerOf

  // updateTokenDataStatus
});
