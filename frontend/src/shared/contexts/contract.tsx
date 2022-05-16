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
  const [contract, setContract] = useState<Contract | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [totalEverMinted, setTotalEverMinted] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [burnPrice, setBurnPrice] = useState('');

  useEffect(() => {
    if (!isWalletInstalled || !walletAddress || !signer) {
      contract && contract.removeAllListeners();
      setContract(null);
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    setContract(newContract);
    return () => {
      newContract.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletInstalled, signer, walletAddress]);

  const updateIsPaused = async () => {
    if (!contract) {
      return;
    }
    const res = await _isPaused(contract);
    setIsPaused(res ?? false);
  };

  const updateTotalEverMinted = async () => {
    if (!contract) {
      return;
    }
    const res = await getTotalEverMinted(contract);
    setTotalEverMinted(res ?? '');
  };

  const updateTotalSupply = async () => {
    if (!contract) {
      return;
    }
    const res = await getTotalSupply(contract);
    setTotalSupply(res ?? '');
  };

  const updateMintPrice = async () => {
    if (!contract) {
      return;
    }
    const res = await getCurrentPrice(contract);
    setMintPrice(res ?? '');
  };

  const updateBurnPrice = async () => {
    if (!contract) {
      return;
    }
    const res = await currentBurnReward(contract);
    setBurnPrice(res ?? '');
  };

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    const cost = await getCurrentPrice(contract);
    setMintPrice(cost);
    // TODO: add 0.01 eth buffer
    const res = await _mint(contract, walletAddress, dateHex, ciphertext, cost);
    return res;
  };

  const burn = async (tokenId: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    const res = await _burn(contract, tokenId);
    return res;
  };

  return (
    <ContractContext.Provider
      value={{
        contract,
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
