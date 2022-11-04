import { createContext, ReactNode, useContext, useEffect } from 'react';
import { Contract, ethers } from 'ethers';
import { MINT_PRICE_COEF } from 'src/shared/constants';
import { ContractState, TokenData } from 'src/shared/interfaces';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { mint as _mint, burn as _burn, getCurrentPrice } from 'src/shared/services/contract';
import useContract from 'src/shared/hooks/contract';

interface ContextState {
  contract: Contract | null;
  contractState: ContractState;
  mint: (dateHex: string, ciphertext: string) => Promise<boolean>;
  burn: (tokenId: string) => Promise<boolean>;
  tokenData: TokenData[];
  addTokenData: (data: TokenData) => Promise<boolean>;
  removeTokenData: (data: TokenData) => void;
  updateTokenData: (data: TokenData) => void;
}

const ContractContext = createContext({} as ContextState);

const ContractContextProvider = ({ children }: { children: ReactNode }) => {
  const { signer, walletProvider, logout } = useWalletContext();
  const { contract, contractState, tokenData, addTokenData, removeTokenData, updateTokenData } = useContract(signer);

  // If the user leaves the page while mint or burn is in progress, logout the wallet
  // to prevent the user seeing mint or burn button not in loading state after reload.
  useEffect(() => {
    if (!walletProvider) {
      return;
    }
    async function beforeunloadListener() {
      if (walletProvider && tokenData.some((data) => data.isInProcess)) {
        await logout(walletProvider);
      }
    }
    window.addEventListener('beforeunload', beforeunloadListener);
    return () => {
      window.removeEventListener('beforeunload', beforeunloadListener);
    };
  }, [walletProvider, tokenData, logout]);

  const mint = async (dateHex: string, ciphertext: string): Promise<boolean> => {
    if (!contract) {
      return Promise.resolve(false);
    }
    const cost = ethers.utils.formatEther(
      ethers.utils.parseEther(await getCurrentPrice(contract)).add(ethers.utils.parseEther(MINT_PRICE_COEF).mul(10)),
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
        mint,
        burn,
        tokenData,
        addTokenData,
        removeTokenData,
        updateTokenData,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

export default ContractContextProvider;
