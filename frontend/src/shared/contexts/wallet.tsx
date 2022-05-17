import { ethers } from 'ethers';
import { createContext, ReactNode, useContext } from 'react';
import { useWallet } from 'src/shared/hooks/wallet';
import { Provider, WalletProvider } from 'src/shared/interfaces';

interface ContextState {
  signer: ethers.providers.JsonRpcSigner | null;
  provider: Provider | null;
  providers: WalletProvider[];
  isWalletInstalled: boolean;
  isInvalidChainId: boolean;
  walletAddress: string;
  connectWallet: (provider: WalletProvider) => Promise<{ success: boolean; error?: { type: string; message: string } }>;
}

const WalletContext = createContext({} as ContextState);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { providers, provider, signer, isWalletInstalled, isInvalidChainId, walletAddress, connectWallet } =
    useWallet();

  return (
    <WalletContext.Provider
      value={{
        signer,
        provider,
        providers,
        isWalletInstalled,
        isInvalidChainId,
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
