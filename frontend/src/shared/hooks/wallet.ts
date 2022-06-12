import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ETH_NETWORK, LOCAL_STORAGE_WALLET_KEY } from 'src/shared/constants';
import { CHAIN_ID, CHAIN_NAME, ConnectWalletResponse, ERROR_TYPE, WalletProvider } from 'src/shared/interfaces';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import {
  createErrorResponse,
  createWalletConnectProvider,
  getProviders,
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
    setProviders(providers);
    const wallet = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
    if (!wallet) {
      return;
    }
    const index = providers.findIndex((provider) => wallet === provider.type);
    if (index < 0) {
      return;
    }
    connectWallet(providers[index], false);
  });

  useEffect(() => {
    if (!walletProvider) {
      return;
    }
    const { provider } = walletProvider;
    const handleAccountChange = _handleAccountChange(walletProvider);
    const handleDisconnect = _handleDisconnect(walletProvider);
    if (provider?.on) {
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', _handleChainChanged);
      provider.on('disconnect', handleDisconnect);
      return () => {
        if (provider?.removeListener) {
          provider.removeListener('accountsChanged', handleAccountChange);
          provider.removeListener('chainChanged', _handleChainChanged);
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
        console.log(walletProvider);
        walletProvider && connectWallet(walletProvider);
      } else {
        await _handleDisconnect(walletProvider)();
      }
    };

  // TODO:
  const _handleChainChanged = (_chainId: string): void => {
    console.log('wallet chain changed:', parseInt(_chainId));
    window.location.reload();
  };

  const _handleDisconnect = (walletProvider: WalletProvider) => async (): Promise<void> => {
    console.log('wallet disconnected:', walletProvider?.name);
    if (walletProvider) {
      await logoutWallet(walletProvider);
    }
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    setWalletAddress('');
    setSigner(null);
    setWalletProvider(null);
    setCanLogout(false);
    setProviders(getProviders());
    setIsInvalidChainId(false);
  };

  const logoutWallet = async (walletProvider: WalletProvider): Promise<void> => {
    if (!walletProvider.logout) {
      return;
    }
    try {
      // if (isWalletConnect(walletProvider)) {
      //   (walletProvider?.provider as WalletConnectProvider)?.disconnect();
      // }
      // if (isWalletPortis(walletProvider)) {
      //   (walletProvider.provider as any)?._portis?.logout();
      // }
      // if (isWalletAuthereum(walletProvider)) {
      //   (walletProvider.provider as any)?.disable();
      // }
      // if (isWalletFortmatic(walletProvider)) {
      //   await (walletProvider.provider as any)?.fm?.user?.logout();
      // }
      if (isWalletFortmatic(walletProvider)) {
        await walletProvider.logout();
      } else {
        walletProvider.logout();
      }
    } catch (e) {
      console.log('logout failed:', e);
    }
  };

  const connectWallet = async (walletProvider: WalletProvider, needRequest = true): Promise<ConnectWalletResponse> => {
    if (!walletProvider?.provider) {
      return createErrorResponse(ERROR_TYPE.INVALID_PROVIDER, 'Invalid Provider');
    }
    if (isWalletConnect(walletProvider) || isWalletAuthereum(walletProvider) || isWalletPortis(walletProvider)) {
      try {
        await (walletProvider?.provider as any)?.enable();
      } catch (err: any) {
        await logoutWallet(walletProvider);
        if (isWalletConnect(walletProvider)) {
          const index = providers.findIndex(isWalletConnect);
          if (index >= 0) {
            setProviders([...providers.slice(0, index), createWalletConnectProvider(), ...providers.slice(index + 1)]);
          }
        }
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
    const handleDisconnect = _handleDisconnect(walletProvider);
    try {
      if (
        !isWalletConnect(walletProvider) &&
        !isWalletPortis(walletProvider) &&
        !isWalletAuthereum(walletProvider) &&
        !isWalletFortmatic(walletProvider)
      ) {
        try {
          await (walletProvider.provider as any).request({
            method: needRequest ? 'eth_requestAccounts' : 'eth_accounts',
          });
        } catch (error) {
          throw new Error('User Rejected');
        }
      }
      const web3Provider = new ethers.providers.Web3Provider(walletProvider.provider as any);
      const signer = web3Provider.getSigner();
      const network = await web3Provider.ready;
      const userAddress = await web3Provider.getSigner().getAddress();
      // const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      const chainId: number | string = await web3Provider.send('eth_chainId', []);
      console.log(`connected to ${network?.name}`);
      if (
        (ETH_NETWORK === CHAIN_NAME.LOCALHOST &&
          chainId !== CHAIN_ID.LOCALHOST &&
          chainId !== parseInt(CHAIN_ID.LOCALHOST)) ||
        (ETH_NETWORK === CHAIN_NAME.RINKEBY &&
          chainId !== CHAIN_ID.RINKEBY &&
          chainId !== parseInt(CHAIN_ID.RINKEBY)) ||
        (ETH_NETWORK === CHAIN_NAME.MAIN_NET &&
          chainId !== CHAIN_ID.MAIN_NET &&
          chainId !== parseInt(CHAIN_ID.MAIN_NET))
      ) {
        await handleDisconnect();
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
      error = createErrorResponse(ERROR_TYPE.NO_ADDRESS_FOUND, 'No address found.');
    } catch (err: any) {
      error = createErrorResponse(
        err?.message === 'User Rejected' ? ERROR_TYPE.USER_CONNECTION_REJECTED : ERROR_TYPE.UNKNOWN_CONNECTION_ERROR,
        err?.message ?? err,
      );
    }
    // console.log('error', error);
    await handleDisconnect();
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
