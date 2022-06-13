import { Contract } from 'ethers';
import { isPaused } from 'src/shared/services/contract';

describe('contract service', function () {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('isPaused', function () {
    it('returns true if the contract is paused', async function () {
      const contract = {
        paused: jest.fn().mockResolvedValue(true),
      } as unknown as Contract;
      expect(await isPaused(contract)).toBeTruthy();
    });

    it('returns false if the contract is not paused', async function () {
      const contract = {
        paused: jest.fn().mockResolvedValue(false),
      } as unknown as Contract;
      expect(await isPaused(contract)).toBeFalsy();
    });

    it('throws error', async function () {
      const contract = {
        paused: jest.fn().mockRejectedValue({ message: 'error message' }),
      } as unknown as Contract;
      await expect(isPaused(contract)).rejects.toThrowError();
    });
  });

  // getTotalEverMinted

  // getTotalSupply

  // getCurrentPrice

  // getCurrentBurnReward

  // getTokenStatus

  // getOwnerOf

  // mint

  // burn

  // tokenURI
});
