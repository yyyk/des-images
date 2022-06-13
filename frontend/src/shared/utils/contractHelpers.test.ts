import { BigNumber } from 'ethers';
import { calcMintPrice, calcBurnReward, isSameAddress } from 'src/shared/utils/contractHelpers';

describe('contractHelpers', function () {
  // queryTokenIds

  describe('calcMintPrice', function () {
    it('returns mint price based on the provided total supply amount', function () {
      expect(calcMintPrice(BigNumber.from(1))).toEqual('0.011');
      expect(calcMintPrice(BigNumber.from(2))).toEqual('0.012');
      expect(calcMintPrice(BigNumber.from(10))).toEqual('0.02');
      expect(calcMintPrice(BigNumber.from(100))).toEqual('0.11');
    });
  });

  describe('calcBurnReward', function () {
    it('returns burn reward based on the provided total supply amount', function () {
      expect(calcBurnReward(BigNumber.from(1))).toEqual('0.00995');
      expect(calcBurnReward(BigNumber.from(2))).toEqual('0.010945');
      expect(calcBurnReward(BigNumber.from(10))).toEqual('0.018905');
      expect(calcBurnReward(BigNumber.from(100))).toEqual('0.108455');
    });
  });

  describe('isSameAddress', function () {
    it('returns true if provided addresses are the same', function () {
      const a = '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570';
      const b = '0x36c02da8a0983159322a80ffe9f24b1acff8B570';
      expect(isSameAddress(a, b)).toBeTruthy();
    });

    it('returns false if provided addresses are not the same', function () {
      const a = '0x36C02dA8a0983159322a80FFE9F24b1acfF8B570';
      const b = '0x36C02dA8a0983159322a80FFE9F24b1acfF88589';
      expect(isSameAddress(a, b)).toBeFalsy();
    });
  });
});
