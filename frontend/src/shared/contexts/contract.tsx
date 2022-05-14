import { ethers, Contract } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import DesImages from 'src/abi/DesImages.json';
import {
  isPaused as _isPaused,
  mint as _mint,
  burn as _burn,
  getTotalEverMinted,
  getTotalSupply,
  getCurrentPrice,
  currentBurnReward,
} from 'src/shared/services/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { CONTRACT_ADDRESS } from 'src/shared/constants';

interface ContextState {
  contract: Contract | null;
  isLoading: boolean;
  isPaused: boolean;
  totalEverMinted: string;
  totalSupply: string;
  mintPrice: string;
  burnPrice: string;
  mint: (dateHex: string, ciphertext: string) => Promise<boolean>;
  burn: (tokenId: string) => Promise<boolean>;
  updateIsPaused: () => void;
  updateTotalEverMinted: () => void;
  updateTotalSupply: () => void;
  updateMintPrice: () => void;
  updateBurnPrice: () => void;
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { isWalletInstalled, walletAddress, signer } = useWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  // TODO: state
  const [contract, setContract] = useState<Contract | null>(null);
  // const contract = useRef<Contract | null>(null);
  // const contractWithSigner = useRef<Contract | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [totalEverMinted, setTotalEverMinted] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [burnPrice, setBurnPrice] = useState('');

  useEffect(() => {
    if (!isWalletInstalled || !signer) {
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    // contract.current = newContract;
    setContract(newContract);
    return () => {
      newContract.removeAllListeners();
    };
  }, [isWalletInstalled, signer]);

  // useEffect(() => {
  //   if (!walletAddress || !signer) {
  //     return;
  //   }
  //   const newContractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
  //   // newContractWithSigner.on(
  //   //   newContractWithSigner.filters.Minted(walletAddress),
  //   //   (to: string, tokenId: BigNumber, totalEverMinted: BigNumber, timestamp: BigNumber) => {
  //   //     console.log('Minted', to, tokenId, totalEverMinted, timestamp);
  //   //   },
  //   // );
  //   contractWithSigner.current = newContractWithSigner;
  //   return () => {
  //     newContractWithSigner.removeAllListeners();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [walletAddress]);

  const updateIsPaused = async () => {
    if (!contract) {
      return;
    }
    setIsLoading(true);
    const res = await _isPaused(contract);
    setIsLoading(false);
    setIsPaused(res ?? false);
  };

  const updateTotalEverMinted = async () => {
    if (!contract) {
      return;
    }
    setIsLoading(true);
    const res = await getTotalEverMinted(contract);
    setIsLoading(false);
    setTotalEverMinted(res ?? '');
  };

  const updateTotalSupply = async () => {
    if (!contract) {
      return;
    }
    setIsLoading(true);
    const res = await getTotalSupply(contract);
    setIsLoading(false);
    setTotalSupply(res ?? '');
  };

  const updateMintPrice = async () => {
    if (!contract) {
      return;
    }
    setIsLoading(true);
    const res = await getCurrentPrice(contract);
    setIsLoading(false);
    setMintPrice(res ?? '');
  };

  const updateBurnPrice = async () => {
    if (!contract) {
      return;
    }
    setIsLoading(true);
    const res = await currentBurnReward(contract);
    setIsLoading(false);
    setBurnPrice(res ?? '');
  };

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    setIsLoading(true);
    const cost = await getCurrentPrice(contract);
    setMintPrice(cost);
    // TODO: add 0.01 eth buffer
    const res = await _mint(contract, walletAddress, dateHex, ciphertext, cost);
    setIsLoading(false);
    return res;
  };

  const burn = async (tokenId: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    setIsLoading(true);
    const res = await _burn(contract, tokenId);
    setIsLoading(false);
    return res;
  };

  return (
    <ContractContext.Provider
      value={{
        contract,
        isLoading,
        isPaused,
        totalEverMinted,
        totalSupply,
        mintPrice,
        burnPrice,
        mint,
        burn,
        updateIsPaused,
        updateTotalEverMinted,
        updateTotalSupply,
        updateMintPrice,
        updateBurnPrice,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

export default ContractContextProvider;
