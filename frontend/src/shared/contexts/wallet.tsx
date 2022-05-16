import { ethers } from 'ethers';
import { createContext, ReactNode, useContext } from 'react';
import { useWallet } from 'src/shared/hooks/wallet';
import { Provider, WalletProvider } from 'src/shared/interfaces';

interface ContextState {
  signer: ethers.providers.JsonRpcSigner | null;
  provider: Provider | null;
  providers: WalletProvider[];
  isWalletInstalled: boolean;
  walletAddress: string;
  connectWallet: (provider: WalletProvider) => void;
}

const WalletContext = createContext({} as ContextState);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { providers, provider, signer, isWalletInstalled, walletAddress, connectWallet } = useWallet();

  return (
    <WalletContext.Provider
      value={{
        signer,
        provider,
        providers,
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
