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
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { isWalletInstalled, signer } = useWalletContext();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [totalEverMinted, setTotalEverMinted] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [mintPrice, setMintPrice] = useState('');
  const [burnPrice, setBurnPrice] = useState('');

  useEffect(() => {
    if (!isWalletInstalled || !signer) {
      contract && contract.removeAllListeners();
      setContract(null);
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    async function setupListeners() {
      const startBlockNumber = await newContract.provider.getBlockNumber();
      newContract.on(
        newContract.filters.Minted(),
        async (to, tokenId, mintPrice, totalSupply, totalEverMinted, event) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          setTotalSupply(totalSupply.toString());
          setTotalEverMinted(totalEverMinted.toString());
          await _updateIsPaused(newContract);
          await _updateMintPrice(newContract);
          await _updateBurnPrice(newContract);
        },
      );
      newContract.on(newContract.filters.Burned(), async (from, tokenId, burnReward, totalSupply, event) => {
        if (event?.blockNumber <= startBlockNumber) {
          return;
        }
        setTotalSupply(totalSupply.toString());
        await _updateIsPaused(newContract);
        await _updateMintPrice(newContract);
        await _updateBurnPrice(newContract);
      });
    }
    setupListeners();
    setContract(newContract);
    return () => {
      newContract.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletInstalled, signer]);

  useEffect(() => {
    async function setup() {
      await _updateIsPaused(contract);
      await _updateTotalEverMinted(contract);
      await _updateTotalSupply(contract);
      await _updateMintPrice(contract);
      await _updateBurnPrice(contract);
    }
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  const _updateIsPaused = async (contract: Contract | null) => {
    if (!contract) {
      setIsPaused(true);
      return;
    }
    setIsPaused((await _isPaused(contract)) ?? true);
  };

  const _updateTotalEverMinted = async (contract: Contract | null) => {
    if (!contract) {
      setTotalEverMinted('');
      return;
    }
    setTotalEverMinted((await getTotalEverMinted(contract)) ?? '');
  };

  const _updateTotalSupply = async (contract: Contract | null) => {
    if (!contract) {
      setTotalSupply('');
      return;
    }
    setTotalSupply((await getTotalSupply(contract)) ?? '');
  };

  const _updateMintPrice = async (contract: Contract | null) => {
    if (!contract) {
      setMintPrice('');
      return;
    }
    setMintPrice((await getCurrentPrice(contract)) ?? '');
  };

  const _updateBurnPrice = async (contract: Contract | null) => {
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
    return await _mint(contract, dateHex, ciphertext, cost);
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
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

export default ContractContextProvider;
