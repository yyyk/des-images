import { ethers } from 'ethers';
import { createContext, ReactNode, useContext } from 'react';
import { useWallet } from 'src/shared/hooks/useWallet';

interface ContextState {
  signer: ethers.providers.JsonRpcSigner | null;
  provider: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc | null;
  isWalletInstalled: boolean;
  walletAddress: string;
  connectWallet: () => void;
}

const WalletContext = createContext({} as ContextState);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { provider, signer, isWalletInstalled, walletAddress, connectWallet } = useWallet();

  return (
    <WalletContext.Provider
      value={{
        signer,
        provider,
        isWalletInstalled,
        walletAddress,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);

export default WalletContextProvider;
