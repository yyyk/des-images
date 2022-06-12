import { createContext, ReactNode, useContext } from 'react';
import { ethers } from 'ethers';
import { useWallet } from 'src/shared/hooks/wallet';
import { WalletProvider } from 'src/shared/interfaces';

interface ContextState {
  signer: ethers.providers.JsonRpcSigner | null;
  providers: WalletProvider[];
  isInvalidChainId: boolean;
  walletAddress: string;
  walletProvider: WalletProvider | null;
  canLogout: boolean;
  connectWallet: (provider: WalletProvider) => Promise<{ success: boolean; error?: { type: string; message: string } }>;
  logout: (walletProvider: WalletProvider) => Promise<void>;
}

const WalletContext = createContext({} as ContextState);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const { providers, signer, isInvalidChainId, walletAddress, walletProvider, canLogout, connectWallet, logoutWallet } =
    useWallet();

  return (
    <WalletContext.Provider
      value={{
        signer,
        providers,
        isInvalidChainId,
        walletAddress,
        walletProvider,
        canLogout,
        connectWallet,
        logout: logoutWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);

export default WalletContextProvider;
