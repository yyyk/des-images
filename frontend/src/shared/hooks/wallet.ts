import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ETH_NETWORK, LOCAL_STORAGE_WALLET_KEY } from 'src/shared/constants';
import {
  CHAIN_ID,
  CHAIN_NAME,
  ConnectWalletResponse,
  ERROR_TYPE,
  Provider,
  WalletProvider,
} from 'src/shared/interfaces';
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
  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [isInvalidChainId, setIsInvalidChainId] = useState(false);

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
    if (provider?.on) {
      provider.on('accountsChanged', _handleAccountChange);
      provider.on('chainChanged', _handleChainChanged);
      provider.on('disconnect', _handleDisconnect);
      return () => {
        if (provider?.removeListener) {
          provider.removeListener('accountsChanged', _handleAccountChange);
          provider.removeListener('chainChanged', _handleChainChanged);
          provider.removeListener('disconnect', _handleDisconnect);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  const _handleAccountChange = (accounts: string[]) => {
    console.log('wallet account changed:', (accounts?.length && accounts[0]) || []);
    if (accounts && accounts?.length) {
      setWalletAddress(accounts[0]);
      console.log(walletProvider);
      walletProvider && connectWallet(walletProvider);
    } else {
      _handleDisconnect();
    }
  };

  const _handleChainChanged = (_chainId: string) => {
    console.log('wallet chain changed:', parseInt(_chainId));
    window.location.reload();
  };

  const _handleDisconnect = () => {
    console.log('wallet disconnected');
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    setWalletAddress('');
    setSigner(null);
    setProvider(null);
    setWalletProvider(null);
    setProviders(getProviders());
    setIsInvalidChainId(false);
  };

  const connectWallet = async (provider: WalletProvider, needRequest = true): Promise<ConnectWalletResponse> => {
    if (!provider?.provider) {
      return createErrorResponse(ERROR_TYPE.INVALID_PROVIDER, 'Invalid Provider');
    }
    if (isWalletConnect(provider)) {
      try {
        await (provider?.provider as WalletConnectProvider)?.enable();
      } catch (err: any) {
        const index = providers.findIndex(isWalletConnect);
        if (index >= 0) {
          setProviders([...providers.slice(0, index), createWalletConnectProvider(), ...providers.slice(index + 1)]);
        }
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    if (isWalletAuthereum(provider)) {
      try {
        await (provider?.provider as any)?.enable();
      } catch (err: any) {
        return createErrorResponse(ERROR_TYPE.WALLET_CONNECT_FAILED, err?.message ?? err);
      }
    }
    let error: ConnectWalletResponse | undefined = undefined;
    try {
      if (
        !isWalletConnect(provider) &&
        !isWalletPortis(provider) &&
        !isWalletAuthereum(provider) &&
        !isWalletFortmatic(provider)
      ) {
        try {
          await (provider.provider as any).request({ method: needRequest ? 'eth_requestAccounts' : 'eth_accounts' });
        } catch (error) {
          throw new Error('User Rejected');
        }
      }
      const web3Provider = new ethers.providers.Web3Provider(provider.provider as any);
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
        _handleDisconnect();
        setIsInvalidChainId(true);
        setProvider(provider.provider);
        setWalletProvider(provider);
        return createErrorResponse(ERROR_TYPE.INVALID_CHAIN_ID, 'Invalid Chain ID');
      }
      // console.log('address', userAddress);
      if (userAddress && userAddress?.length) {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, provider.type);
        setWalletAddress(userAddress);
        setProvider(provider.provider);
        setWalletProvider(provider);
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
    _handleDisconnect();
    return error;
  };

  return {
    isInvalidChainId,
    walletAddress,
    providers,
    signer,
    connectWallet,
  };
};
