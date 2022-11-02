import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ethers, Contract, BigNumber } from 'ethers';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { CONTRACT_ADDRESS, DEFAULT_CONTRACT_STATE, MINT_PRICE_COEF, NULL_ADDRESS } from 'src/shared/constants';
import { ContractState } from 'src/shared/interfaces';
import {
  mint as _mint,
  burn as _burn,
  getTotalEverMinted,
  getTotalSupply,
  getCurrentPrice,
  getCurrentBurnReward,
  isPaused as _isPaused,
} from 'src/shared/services/contract';
import DesImages from 'src/abi/DesImages.json';
import { calcBurnReward, calcMintPrice, isSameAddress, queryTokenIds } from 'src/shared/utils/contractHelpers';
import { deleteTokenDataCacheOf } from 'src/shared/utils/tokenDataHelpers';

interface ContextState {
  contract: Contract | null;
  contractState: ContractState;
  ownedTokenIds: string[];
  isUserTokenIDsLoading: boolean;
  mintedToken: { to: string; id: string } | null;
  burnedToken: { from: string; id: string } | null;
  mint: (dateHex: string, ciphertext: string) => Promise<boolean>;
  burn: (tokenId: string) => Promise<boolean>;
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { signer, walletAddress } = useWalletContext();
  const [contract, setContract] = useState<Contract | null>(null);
  const [contractState, setContractState] = useState(DEFAULT_CONTRACT_STATE);
  const [mintedToken, setMintedToken] = useState<{ to: string; id: string } | null>(null);
  const [burnedToken, setBurnedToken] = useState<{ from: string; id: string } | null>(null);
  const [isUserTokenIDsLoading, setIsUserTokenIDsLoading] = useState(false);
  const [ownedTokenIds, setOwnedTokenIds] = useState<string[]>([]);

  const _eventHandler = (type: string, startBlockNumber: number, walletAddress: string) => {
    switch (type) {
      case 'Transfer':
        return async (from: string, to: string, tokenId: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Transferred');
          setOwnedTokenIds((prev) => {
            const _tokenId = tokenId.toHexString();
            const index = prev.findIndex((id) => id === _tokenId);
            if (isSameAddress(from, walletAddress)) {
              // console.log('remove', _tokenId, index);
              deleteTokenDataCacheOf(_tokenId);
              if (index > -1) {
                return [...prev.slice(0, index), ...prev.slice(index + 1)];
              }
            } else if (isSameAddress(to, walletAddress)) {
              // console.log('add', _tokenId, index);
              if (index === -1) {
                return [_tokenId, ...prev];
              }
            }
            return [...prev];
          });
        };
      case 'Minted':
        return (
          to: string,
          tokenId: BigNumber,
          _mintPrice: BigNumber,
          totalSupply: BigNumber,
          totalEverMinted: BigNumber,
          event: any,
        ) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Minted');
          setMintedToken({ to, id: tokenId.toHexString() });
          setContractState((prev) => ({
            ...prev,
            totalSupply: totalSupply.toString(),
            totalEverMinted: totalEverMinted.toString(),
            mintPrice: calcMintPrice(totalSupply),
            burnPrice: calcBurnReward(totalSupply),
          }));
        };
      case 'Burned':
        return (from: string, tokenId: BigNumber, _burnReward: BigNumber, totalSupply: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Burned');
          setBurnedToken({ from, id: tokenId.toHexString() });
          setContractState((prev) => ({
            ...prev,
            totalSupply: totalSupply.toString(),
            mintPrice: calcMintPrice(totalSupply),
            burnPrice: calcBurnReward(totalSupply),
          }));
        };
      case 'Paused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Paused');
          setContractState((prev) => ({
            ...prev,
            isPaused: true,
          }));
        };
      case 'UnPaused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('UnPaused');
          setContractState((prev) => ({
            ...prev,
            isPaused: false,
          }));
        };
      default:
        return () => {};
    }
  };

  const _setupContractListeners = (contract: Contract, walletAddress: string, currentBlockNumber: number) => {
    try {
      contract.on(
        contract.filters.Transfer([NULL_ADDRESS, walletAddress], [NULL_ADDRESS, walletAddress]),
        _eventHandler('Transfer', currentBlockNumber, walletAddress),
      );
      contract.on(contract.filters.Minted(), _eventHandler('Minted', currentBlockNumber, walletAddress));
      contract.on(contract.filters.Burned(), _eventHandler('Burned', currentBlockNumber, walletAddress));
      // contract.on(contract.filters.UnPaused(), _eventHandler('UnPaused', currentBlockNumber, walletAddress));
    } catch (err) {
      console.error(err);
    }
  };

  const _queryTokenIds = async (contract: Contract, walletAddress: string, currentBlockNumber: number) => {
    try {
      const ids = await queryTokenIds(contract, walletAddress, currentBlockNumber);
      setOwnedTokenIds(ids);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   async function _setupInitialContractState(contract: Contract | null) {
  //     try {
  //       const state = !!contract
  //         ? {
  //             isPaused: await _isPaused(contract),
  //             totalSupply: await getTotalSupply(contract),
  //             totalEverMinted: await getTotalEverMinted(contract),
  //             mintPrice: await getCurrentPrice(contract),
  //             burnPrice: await getCurrentBurnReward(contract),
  //           }
  //         : { ...DEFAULT_CONTRACT_STATE };
  //       setContractState(state);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  //   _setupInitialContractState(contract);
  // }, [contract]);

  useEffect(() => {
    if (!signer) {
      setContractState({ ...DEFAULT_CONTRACT_STATE });
      setContract(null);
      return;
    }
    async function setupContract(contract: Contract) {
      setIsUserTokenIDsLoading(true);
      try {
        // const isPaused = await _isPaused(contract);
        // const totalSupply = await getTotalSupply(contract);
        // const totalEverMinted = await getTotalEverMinted(contract);
        // const mintPrice = await getCurrentPrice(contract);
        // const burnPrice = await getCurrentBurnReward(contract);
        // setContractState({
        //   isPaused,
        //   totalSupply,
        //   totalEverMinted,
        //   mintPrice,
        //   burnPrice,
        // });
        console.log('walletAddress', walletAddress);
        setContract(contract);
        const currentBlockNumber = await contract.provider?.getBlockNumber();
        currentBlockNumber && _setupContractListeners(contract, walletAddress, currentBlockNumber);
        currentBlockNumber && (await _queryTokenIds(contract, walletAddress, currentBlockNumber));
      } catch (err) {
        console.error(err);
      }
      setIsUserTokenIDsLoading(false);
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    newContract && setupContract(newContract);
    return () => {
      newContract.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return Promise.resolve(false);
    }
    let cost = await getCurrentPrice(contract);
    cost = ethers.utils.formatEther(
      ethers.utils.parseEther(cost).add(ethers.utils.parseEther(MINT_PRICE_COEF).mul(10)),
    );
    return await _mint(contract, dateHex, ciphertext, cost);
  };

  const burn = async (tokenId: string): Promise<boolean> => {
    if (!contract) {
      return Promise.resolve(false);
    }
    return await _burn(contract, tokenId);
  };

  return (
    <ContractContext.Provider
      value={{
        contract,
        contractState,
        ownedTokenIds,
        isUserTokenIDsLoading,
        mintedToken,
        burnedToken,
        mint,
        burn,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

export default ContractContextProvider;
