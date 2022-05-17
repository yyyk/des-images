import { ethers, Contract } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { CONTRACT_ADDRESS } from 'src/shared/constants';
import {
  isPaused as _isPaused,
  mint as _mint,
  burn as _burn,
  getTotalEverMinted,
  getTotalSupply,
  getCurrentPrice,
  currentBurnReward,
} from 'src/shared/services/contract';
import DesImages from 'src/abi/DesImages.json';

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

  useEffect(() => {
    updateIsPaused();
    updateTotalEverMinted();
    updateTotalSupply();
    updateMintPrice();
    updateBurnPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const updateIsPaused = async () => {
    if (!contract) {
      setIsPaused(true);
      return;
    }
    setIsPaused((await _isPaused(contract)) ?? true);
  };

  const updateTotalEverMinted = async () => {
    if (!contract) {
      setTotalEverMinted('');
      return;
    }
    setTotalEverMinted((await getTotalEverMinted(contract)) ?? '');
  };

  const updateTotalSupply = async () => {
    if (!contract) {
      setTotalSupply('');
      return;
    }
    setTotalSupply((await getTotalSupply(contract)) ?? '');
  };

  const updateMintPrice = async () => {
    if (!contract) {
      setMintPrice('');
      return;
    }
    setMintPrice((await getCurrentPrice(contract)) ?? '');
  };

  const updateBurnPrice = async () => {
    if (!contract) {
      setBurnPrice('');
      return;
    }
    setBurnPrice((await currentBurnReward(contract)) ?? '');
  };

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    const cost = await getCurrentPrice(contract);
    setMintPrice(cost);
    // TODO: add 0.01 eth buffer
    return await _mint(contract, walletAddress, dateHex, ciphertext, cost);
  };

  const burn = async (tokenId: string): Promise<boolean> => {
    if (!contract) {
      return false;
    }
    return await _burn(contract, tokenId);
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
