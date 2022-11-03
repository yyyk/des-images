import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { LOCAL_STORAGE_WALLET_KEY } from 'src/shared/constants';
import { ConnectWalletResponse, ERROR_TYPE, WalletProvider } from 'src/shared/interfaces';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import {
  createErrorResponse,
  getProviders,
  isCoinbaseWalletAndDisconnected,
  isInvalidChain,
  isWalletAuthereum,
  isWalletConnect,
  isWalletFortmatic,
  isWalletPortis,
} from 'src/shared/utils/walletHelpers';

export const useWallet = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [walletProvider, setWalletProvider] = useState<WalletProvider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [isInvalidChainId, setIsInvalidChainId] = useState(false);
  const [canLogout, setCanLogout] = useState(false);

  useEffectOnce(() => {
    const providers = getProviders();
    const wallet = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
    if (!wallet) {
      return;
    }
    const index = providers.findIndex((provider) => wallet === provider.type);
    if (index < 0) {
      return;
    }
    if (isCoinbaseWalletAndDisconnected(providers[index])) {
      // logoutWallet(providers[index])
      //   .then(() => {})
      //   .catch(() => {});
      providers[index].logout && (providers[index] as any).logout();
      _resetState();
    } else {
      connectWallet(providers[index]);
    }
    setProviders(providers);
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

  // TODO:
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
        if (isWalletFortmatic(walletProvider)) {
          await walletProvider.logout();
        } else {
          walletProvider.logout();
        }
      } catch (e) {
        console.log('logout failed:', e);
      }
    }
    _resetState();
  };

  const connectWallet = async (walletProvider: WalletProvider): Promise<ConnectWalletResponse> => {
    if (!walletProvider?.provider) {
      return createErrorResponse(ERROR_TYPE.INVALID_PROVIDER, 'Invalid Provider');
    }
    if (isWalletConnect(walletProvider) || isWalletAuthereum(walletProvider) || isWalletPortis(walletProvider)) {
      try {
        await (walletProvider?.provider as any)?.enable();
      } catch (err: any) {
        await logoutWallet(walletProvider);
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    if (isWalletFortmatic(walletProvider)) {
      try {
        await (walletProvider.provider as any)?.fm?.user?.login();
        const isLoggedIn = await (walletProvider.provider as any)?.fm?.user?.isLoggedIn();
        if (!isLoggedIn) {
          throw new Error('Failed to login to Fortmatic');
        }
      } catch (err: any) {
        await logoutWallet(walletProvider);
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    let error: ConnectWalletResponse | undefined = undefined;
    try {
      if (
        !isWalletConnect(walletProvider) &&
        !isWalletPortis(walletProvider) &&
        !isWalletAuthereum(walletProvider) &&
        !isWalletFortmatic(walletProvider)
      ) {
        try {
          await (walletProvider.provider as any).request({
            method: 'eth_requestAccounts',
          });
        } catch (error) {
          throw new Error('User Rejected');
        }
      }
      const web3Provider = new ethers.providers.Web3Provider(walletProvider.provider as any);
      const signer = web3Provider.getSigner();
      const network = await web3Provider.ready;
      const userAddress = await signer.getAddress();
      // const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      const chainId: number | string = await web3Provider.send('eth_chainId', []);
      // const chainId: number = await signer.getChainId();
      console.log(`connected to ${network?.name}`);
      if (isInvalidChain(chainId)) {
        await logoutWallet(walletProvider);
        setIsInvalidChainId(true);
        setWalletProvider(walletProvider);
        return createErrorResponse(ERROR_TYPE.INVALID_CHAIN_ID, 'Invalid Chain ID');
      }
      // console.log('address', userAddress);
      if (userAddress && userAddress?.length) {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, walletProvider.type);
        setWalletAddress(userAddress);
        setWalletProvider(walletProvider);
        setCanLogout(!!walletProvider.logout);
        setSigner(signer);
        return { success: true };
      }
      error = createErrorResponse(ERROR_TYPE.NO_ADDRESS_FOUND, 'No address found');
    } catch (err: any) {
      error = createErrorResponse(
        err?.message === 'User Rejected' ? ERROR_TYPE.USER_CONNECTION_REJECTED : ERROR_TYPE.UNKNOWN_CONNECTION_ERROR,
        err?.message ?? err,
      );
    }
    // console.log('error', error);
    await logoutWallet(walletProvider);
    return error;
  };

  return {
    isInvalidChainId,
    walletAddress,
    walletProvider,
    providers,
    signer,
    canLogout,
    connectWallet,
    logoutWallet,
  };
};
