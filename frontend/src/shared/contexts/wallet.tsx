import { createContext, ReactNode, useContext } from 'react';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { LOCAL_STORAGE_WALLET_KEY } from 'src/shared/constants';
import { ConnectWalletResponse, ERROR_TYPE, WalletProvider } from 'src/shared/interfaces';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import {
  createErrorResponse,
  getProviders,
  isCoinbaseWallet,
  isCoinbaseWalletAndDisconnected,
  isInvalidChain,
  isWalletAuthereum,
  isWalletConnect,
  isWalletFortmatic,
  isWalletPortis,
} from 'src/shared/utils/walletHelpers';

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
  const [walletAddress, setWalletAddress] = useState('');
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [isInvalidChainId, setIsInvalidChainId] = useState(false);
  const [canLogout, setCanLogout] = useState(false);

  useEffectOnce(() => {
    const providers = getProviders();
    setProviders(providers);
    const wallet = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
    if (!wallet) {
      return;
    }
    const index = providers.findIndex((provider) => wallet === provider.type);
    if (index < 0) {
      return;
    }
    if (isCoinbaseWalletAndDisconnected(providers[index])) {
      logoutWallet(providers[index]);
      return;
    }
    connectWallet(providers[index]);
  });

  useEffect(() => {
    if (!walletProvider) {
      return;
    }
    const { provider } = walletProvider;
    const handleAccountChange = _handleAccountChange(walletProvider);
    const handleChainChanged = _handleChainChanged(walletProvider);
    const handleDisconnect = _handleDisconnect(walletProvider);
    if (provider?.on) {
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);
      return () => {
        if (provider?.removeListener) {
          provider.removeListener('accountsChanged', handleAccountChange);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletProvider]);

  const _handleAccountChange =
    (walletProvider: WalletProvider) =>
    async (accounts: string[]): Promise<void> => {
      console.log('wallet account changed:', (accounts?.length && accounts[0]) || []);
      if (accounts && accounts?.length) {
        setWalletAddress(accounts[0]);
        walletProvider && connectWallet(walletProvider);
      } else {
        await logoutWallet(walletProvider);
      }
    };

  const _handleChainChanged =
    (walletProvider: WalletProvider) =>
    async (_chainId: string): Promise<void> => {
      console.log('wallet chain changed:', parseInt(_chainId));
      await logoutWallet(walletProvider);
      window.location.reload();
    };

  const _handleDisconnect = (walletProvider: WalletProvider) => async (): Promise<void> => {
    console.log('wallet disconnected:', walletProvider?.name);
    await logoutWallet(walletProvider);
  };

  const _resetState = () => {
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    setWalletAddress('');
    setSigner(null);
    setWalletProvider(null);
    setCanLogout(false);
    setProviders(getProviders());
    setIsInvalidChainId(false);
  };

  const logoutWallet = async (walletProvider: WalletProvider | null): Promise<void> => {
    if (walletProvider?.logout) {
      try {
        if (walletProvider?.logout.constructor.name === 'AsyncFunction') {
          // if (isWalletFortmatic(walletProvider) || isCoinbaseWallet(walletProvider)) {
          await walletProvider.logout();
        } else {
          walletProvider.logout();
        }
      } catch (e) {
        console.log('logout failed:', e);
      }
    }
    _resetState();
    console.log('logout completed');
  };

  const connectWallet = async (walletProvider: WalletProvider): Promise<ConnectWalletResponse> => {
    if (!walletProvider?.provider) {
      return createErrorResponse(ERROR_TYPE.INVALID_PROVIDER, 'Invalid Provider');
    }
    let isWalletEnabled = false;
    if (
      isCoinbaseWallet(walletProvider) ||
      isWalletConnect(walletProvider) ||
      isWalletAuthereum(walletProvider) ||
      isWalletPortis(walletProvider)
    ) {
      isWalletEnabled = true;
      try {
        const accounts = await (walletProvider?.provider as any)?.enable();
        console.log(`User's address: ${accounts[0]}`);
      } catch (err: any) {
        console.error(err);
        await logoutWallet(walletProvider);
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    if (isWalletFortmatic(walletProvider)) {
      isWalletEnabled = true;
      try {
        await (walletProvider.provider as any)?.fm?.user?.login();
        const isLoggedIn = await (walletProvider.provider as any)?.fm?.user?.isLoggedIn();
        if (!isLoggedIn) {
          throw new Error('Failed to login to Fortmatic');
        }
      } catch (err: any) {
        console.error(err);
        await logoutWallet(walletProvider);
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    let error: ConnectWalletResponse | undefined = undefined;
    try {
      // if (!isWalletEnabled) {
      //   try {
      //     await (walletProvider.provider as any).request({
      //       method: 'eth_requestAccounts',
      //     });
      //   } catch (error) {
      //     throw new Error('User Rejected');
      //   }
      // }
      const web3Provider = new ethers.providers.Web3Provider(walletProvider.provider as any);
      if (!isWalletEnabled) {
        try {
          await web3Provider.send('eth_requestAccounts', []);
        } catch (error) {
          throw new Error('User Rejected');
        }
      }
      const signer = web3Provider.getSigner();
      const network = await web3Provider.ready;
      const userAddress = await signer.getAddress();
      // const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      const chainId: number | string = await web3Provider.send('eth_chainId', []);
      // const chainId: number = await signer.getChainId();
      console.log(`connected to ${chainId}: ${network?.name}`);
      console.log(`userAddress: ${userAddress}`);
      // if (isInvalidChain(chainId)) {
      //   await logoutWallet(walletProvider);
      //   setIsInvalidChainId(true);
      //   setWalletProvider(walletProvider);
      //   return createErrorResponse(ERROR_TYPE.INVALID_CHAIN_ID, 'Invalid Chain ID');
      // }
      if (isInvalidChain(chainId)) {
        setIsInvalidChainId(true);
      }
      if (userAddress && userAddress?.length) {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, walletProvider.type);
        setWalletAddress(userAddress);
        setWalletProvider(walletProvider);
        setCanLogout(!!walletProvider.logout);
        !isInvalidChain(chainId) && setSigner(signer);
        console.log('wallet connected');
        return { success: true };
      }
      error = createErrorResponse(ERROR_TYPE.NO_ADDRESS_FOUND, 'No address found');
    } catch (err: any) {
      error = createErrorResponse(
        err?.message === 'User Rejected' ? ERROR_TYPE.USER_CONNECTION_REJECTED : ERROR_TYPE.UNKNOWN_CONNECTION_ERROR,
        err?.message ?? err,
      );
    }
    console.log('wallet connection error', error);
    await logoutWallet(walletProvider);
    return error;
  };

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
