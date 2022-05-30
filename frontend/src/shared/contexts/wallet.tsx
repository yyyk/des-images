import { createContext, ReactNode, useContext } from 'react';
import { ethers } from 'ethers';
import { useWallet } from 'src/shared/hooks/wallet';
import { WalletProvider } from 'src/shared/interfaces';

interface ContextState {
  signer: ethers.providers.JsonRpcSigner | null;
  providers: WalletProvider[];
  isWalletInstalled: boolean;
  isInvalidChainId: boolean;
  walletAddress: string;
  connectWallet: (provider: WalletProvider) => Promise<{ success: boolean; error?: { type: string; message: string } }>;
  checkIfWalletInstalled: () => void;
}

const WalletContext = createContext({} as ContextState);

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const {
    providers,
    signer,
    isWalletInstalled,
    isInvalidChainId,
    walletAddress,
    connectWallet,
    checkIfWalletInstalled,
  } = useWallet();

  return (
    <WalletContext.Provider
      value={{
        signer,
        providers,
        isWalletInstalled,
        isInvalidChainId,
        walletAddress,
        connectWallet,
        checkIfWalletInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);

export default WalletContextProvider;
