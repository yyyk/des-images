import { ethers, Contract, BigNumber } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { CONTRACT_ADDRESS } from 'src/shared/constants';
import {
  mint as _mint,
  burn as _burn,
  getTotalEverMinted,
  getTotalSupply,
  getCurrentPrice,
  currentBurnReward,
  isPaused as _isPaused,
} from 'src/shared/services/contract';
import DesImages from 'src/abi/DesImages.json';
import { calcBurnReward, calcMintPrice, queryTokenIds } from 'src/shared/utils/contractHelpers';

interface ContextState {
  contract: Contract | null;
  isPaused: boolean;
  totalSupply: string;
  totalEverMinted: string;
  mintPrice: string;
  burnPrice: string;
  ownedTokenIds: string[];
  mint: (dateHex: string, ciphertext: string) => Promise<boolean>;
  burn: (tokenId: string) => Promise<boolean>;
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { isWalletInstalled, signer, walletAddress } = useWalletContext();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [totalEverMinted, setTotalEverMinted] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [burnPrice, setBurnPrice] = useState('');
  const ownedTokenIds = useRef<string[]>([]);

  const _updateOwnedTokenIds = (from: string, to: string, tokenId: BigNumber) => {
    const _tokenId = tokenId.toHexString();
    const index = ownedTokenIds.current.findIndex((id) => id === _tokenId);
    if (from.toLowerCase() === walletAddress.toLowerCase()) {
      // console.log('remove', _tokenId, index);
      if (index > -1) {
        ownedTokenIds.current = [...ownedTokenIds.current.slice(0, index), ...ownedTokenIds.current.slice(index + 1)];
      }
    } else if (to.toLowerCase() === walletAddress.toLowerCase()) {
      // console.log('add', _tokenId, index);
      if (index === -1) {
        ownedTokenIds.current = ownedTokenIds.current.concat(_tokenId);
      }
    }
  };

  const _eventHandler = (type: string, contract: Contract, startBlockNumber: number) => {
    switch (type) {
      case 'Transfer':
        return async (from: string, to: string, tokenId: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          _updateOwnedTokenIds(from, to, tokenId);
          setIsPaused(!contract ? true : await _isPaused(contract));
        };
      case 'Minted':
        return (
          _to: string,
          _tokenId: BigNumber,
          _mintPrice: BigNumber,
          totalSupply: BigNumber,
          totalEverMinted: BigNumber,
          event: any,
        ) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          setTotalSupply(totalSupply.toString());
          setTotalEverMinted(totalEverMinted.toString());
          setMintPrice(calcMintPrice(totalSupply));
          setBurnPrice(calcBurnReward(totalSupply));
        };
      case 'Burned':
        return (_from: string, _tokenId: BigNumber, _burnReward: BigNumber, totalSupply: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          setTotalSupply(totalSupply.toString());
          setMintPrice(calcMintPrice(totalSupply));
          setBurnPrice(calcBurnReward(totalSupply));
        };
      default:
        return () => {};
    }
  };

  const _setupContractListeners = async (contract: Contract) => {
    const startBlockNumber = await contract.provider.getBlockNumber();
    contract.on(contract.filters.Transfer(), _eventHandler('Transfer', contract, startBlockNumber));
    contract.on(contract.filters.Minted(), _eventHandler('Minted', contract, startBlockNumber));
    contract.on(contract.filters.Burned(), _eventHandler('Burned', contract, startBlockNumber));
  };

  const _queryTokenIds = async (contract: Contract, walletAddress: string) => {
    // TODO: set loading
    ownedTokenIds.current = await queryTokenIds(contract, walletAddress);
    // TODO: unset loading
  };

  const _setup = async (contract: Contract | null) => {
    setIsPaused(!!contract ? await _isPaused(contract) : true);
    setTotalSupply(!!contract ? await getTotalSupply(contract) : '');
    setTotalEverMinted(!!contract ? await getTotalEverMinted(contract) : '');
    setMintPrice(!!contract ? await getCurrentPrice(contract) : '');
    setBurnPrice(!!contract ? await currentBurnReward(contract) : '');
  };

  useEffect(() => {
    _setup(contract);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    if (!isWalletInstalled || !signer) {
      setContract(null);
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    _queryTokenIds(newContract, walletAddress);
    _setupContractListeners(newContract);
    setContract(newContract);
    return () => {
      newContract.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletInstalled, signer]);

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return Promise.resolve(false);
    }
    const cost = await getCurrentPrice(contract);
    setMintPrice(cost);
    // TODO: add 0.01 eth buffer
    // ethers.utils.formatEther(ethers.utils.parseEther(cost).add(ethers.utils.parseEther('0.01'))).toString()
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
        isPaused,
        totalSupply,
        totalEverMinted,
        mintPrice,
        burnPrice,
        ownedTokenIds: ownedTokenIds.current,
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
