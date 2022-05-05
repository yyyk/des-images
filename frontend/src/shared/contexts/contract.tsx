import { ethers, Contract } from 'ethers';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import DesImages from 'src/abi/DesImages.json';
import {
  getTotalEverMinted as _getTotalEverMinted,
  getCurrentPrice as _getCurrentPrice,
  getTokenStatus as _getTokenStatus,
  getTotalSupply as _getTotalSupply,
  mint as _mint,
} from 'src/shared/utils/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { TOKEN_STATUS } from '../interfaces';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS ?? '';

interface ContextState {
  isLoading: boolean;
  cost: string;
  getCurrentPrice: () => Promise<string | undefined>;
  totalEverMinted: string;
  getTotalEverMinted: () => Promise<string | undefined>;
  totalSupply: string;
  getTotalSupply: () => Promise<string | undefined>;
  getTokenStatus: (dateHex: string, ciphertext: string) => Promise<TOKEN_STATUS | undefined>;
  mint: (dateHex: string, ciphertext: string) => Promise<void>;
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { isWalletInstalled, walletAddress, signer } = useWalletContext();
  const [cost, setCost] = useState('');
  const [totalEverMinted, setTotalEverMinted] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const contract = useRef<Contract | null>(null);
  const contractWithSigner = useRef<Contract | null>(null);

  useEffect(() => {
    if (!isWalletInstalled || !signer) {
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    contract.current = newContract;
    getTotalEverMinted();
    getCurrentPrice();
    getTotalSupply();
    return () => {
      newContract.removeAllListeners();
    };
  }, [isWalletInstalled, signer]);

  useEffect(() => {
    if (!walletAddress || !signer) {
      return;
    }
    const newContractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    // newContractWithSigner.on(
    //   newContractWithSigner.filters.Minted(walletAddress),
    //   (to: string, tokenId: BigNumber, totalEverMinted: BigNumber, timestamp: BigNumber) => {
    //     console.log('Minted', to, tokenId, totalEverMinted, timestamp);
    //   },
    // );
    contractWithSigner.current = newContractWithSigner;
    return () => {
      newContractWithSigner.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const getTotalEverMinted = async (): Promise<string | undefined> => {
    if (!contract.current) {
      setTotalEverMinted('');
      return '';
    }
    const newTotalEverMinted = await _getTotalEverMinted(contract.current);
    setTotalEverMinted(newTotalEverMinted ?? '');
    return newTotalEverMinted;
  };

  const getCurrentPrice = async (): Promise<string | undefined> => {
    if (!contract.current) {
      setCost('');
      return '';
    }
    const newCost = await _getCurrentPrice(contract.current);
    setCost(newCost ?? '');
    return '';
  };

  const getTotalSupply = async (): Promise<string | undefined> => {
    if (!contract.current) {
      return;
    }
    const newTotalSupply = await _getTotalSupply(contract.current);
    setTotalSupply(newTotalSupply ?? '');
    return '';
  };

  const getTokenStatus = async (dateHex: string, ciphertext: string): Promise<number | undefined> => {
    if (!contract.current) {
      return;
    }
    return await _getTokenStatus(contract.current, dateHex, ciphertext);
  };

  const mint = async (dateHex: string, ciphertext: string): Promise<void> => {
    if (!contractWithSigner.current) {
      return;
    }
    setIsLoading(true);
    _mint(contractWithSigner.current, walletAddress, dateHex, ciphertext, cost);
    setIsLoading(false);
  };

  return (
    <ContractContext.Provider
      value={{
        isLoading,
        cost,
        getCurrentPrice,
        totalEverMinted,
        getTotalEverMinted,
        totalSupply,
        getTokenStatus,
        getTotalSupply,
        mint,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

export default ContractContextProvider;
