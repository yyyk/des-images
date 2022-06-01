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
  getCurrentBurnReward,
  isPaused as _isPaused,
} from 'src/shared/services/contract';
import DesImages from 'src/abi/DesImages.json';
import { calcBurnReward, calcMintPrice, isSameAddress, queryTokenIds } from 'src/shared/utils/contractHelpers';

interface ContextState {
  contract: Contract | null;
  isPaused: boolean;
  totalSupply: string;
  totalEverMinted: string;
  mintPrice: string;
  burnPrice: string;
  ownedTokenIds: string[];
  isUserTokensLoading: boolean;
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
  const [ownedTokenIds, setOwnedTokenIds] = useState<string[]>([]);
  const [isUserTokensLoading, setIsUserTokensLoading] = useState(false);
  const ownedTokenIdsRef = useRef<string[]>([]);

  const _updateOwnedTokenIds = (from: string, to: string, tokenId: BigNumber) => {
    const _tokenId = tokenId.toHexString();
    const index = ownedTokenIdsRef.current.findIndex((id) => id === _tokenId);
    if (isSameAddress(from, walletAddress)) {
      // console.log('remove', _tokenId, index);
      if (index > -1) {
        ownedTokenIdsRef.current = [
          ...ownedTokenIdsRef.current.slice(0, index),
          ...ownedTokenIdsRef.current.slice(index + 1),
        ];
        setOwnedTokenIds([...ownedTokenIdsRef.current]);
      }
    } else if (isSameAddress(to, walletAddress)) {
      // console.log('add', _tokenId, index);
      if (index === -1) {
        ownedTokenIdsRef.current = ownedTokenIdsRef.current.concat(_tokenId);
        setOwnedTokenIds([...ownedTokenIdsRef.current]);
      }
    }
  };

  const _eventHandler = (type: string, startBlockNumber: number) => {
    switch (type) {
      case 'Transfer':
        return async (from: string, to: string, tokenId: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Transferred');
          _updateOwnedTokenIds(from, to, tokenId);
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
          console.log('Minted');
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
          console.log('Burned');
          setTotalSupply(totalSupply.toString());
          setMintPrice(calcMintPrice(totalSupply));
          setBurnPrice(calcBurnReward(totalSupply));
        };
      case 'Paused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Paused');
          setIsPaused(true);
        };
      case 'UnPaused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('UnPaused');
          setIsPaused(false);
        };
      default:
        return () => {};
    }
  };

  const _setupContractListeners = async (contract: Contract) => {
    const startBlockNumber = await contract.provider.getBlockNumber();
    contract.on(contract.filters.Transfer(), _eventHandler('Transfer', startBlockNumber));
    contract.on(contract.filters.Minted(), _eventHandler('Minted', startBlockNumber));
    contract.on(contract.filters.Burned(), _eventHandler('Burned', startBlockNumber));
    contract.on(contract.filters.Paused(), _eventHandler('Paused', startBlockNumber));
    contract.on(contract.filters.UnPaused(), _eventHandler('UnPaused', startBlockNumber));
  };

  const _queryTokenIds = async (contract: Contract, walletAddress: string) => {
    setIsUserTokensLoading(true);
    ownedTokenIdsRef.current = await queryTokenIds(contract, walletAddress);
    setOwnedTokenIds([...ownedTokenIdsRef.current]);
    setIsUserTokensLoading(false);
  };

  const _setup = async (contract: Contract | null) => {
    setIsPaused(!!contract ? await _isPaused(contract) : true);
    setTotalSupply(!!contract ? await getTotalSupply(contract) : '');
    setTotalEverMinted(!!contract ? await getTotalEverMinted(contract) : '');
    setMintPrice(!!contract ? await getCurrentPrice(contract) : '');
    setBurnPrice(!!contract ? await getCurrentBurnReward(contract) : '');
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
    // const prevTotalSupply = totalSupply;
    // const newTotalSupply = BigNumber.from(prevTotalSupply).add(1);
    // const prevTotalEverMinted = totalEverMinted;
    // const prevBurnPrice = burnPrice;
    // const prevMintPrice = mintPrice;
    const cost = await getCurrentPrice(contract);
    // setTotalSupply(newTotalSupply.toString());
    // setTotalEverMinted(BigNumber.from(prevTotalEverMinted).add(1).toString());
    // setMintPrice(ethers.utils.formatEther(ethers.utils.parseEther(cost).add(ethers.utils.parseEther(MINT_PRICE_COEF))));
    // setBurnPrice(calcBurnReward(newTotalSupply));
    // TODO: add 0.01 eth buffer
    // ethers.utils.formatEther(ethers.utils.parseEther(cost).add(ethers.utils.parseEther(MINT_PRICE_COEF).mul(10)))
    const res = await _mint(contract, dateHex, ciphertext, cost);
    if (!res) {
      // setTotalSupply(prevTotalSupply);
      // setTotalEverMinted(prevTotalEverMinted);
      // setMintPrice(prevMintPrice);
      // setBurnPrice(prevBurnPrice);
    }
    return res;
  };

  const burn = async (tokenId: string): Promise<boolean> => {
    if (!contract) {
      return Promise.resolve(false);
    }
    // const prevBurnPrice = burnPrice;
    // const prevMintPrice = mintPrice;
    // const prevTotalSupply = totalSupply;
    // const newTotalSupply = BigNumber.from(prevTotalSupply).sub(1);
    // setTotalSupply(newTotalSupply.toString());
    // setMintPrice(calcMintPrice(newTotalSupply));
    // setBurnPrice(calcBurnReward(newTotalSupply));
    const res = await _burn(contract, tokenId);
    if (!res) {
      // setTotalSupply(prevTotalSupply);
      // setMintPrice(prevMintPrice);
      // setBurnPrice(prevBurnPrice);
    }
    return res;
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
        ownedTokenIds,
        isUserTokensLoading,
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
