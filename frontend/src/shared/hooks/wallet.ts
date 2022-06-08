import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ETH_NETWORK, LOCAL_STORAGE_WALLET_KEY } from 'src/shared/constants';
import { CHAIN_ID, CHAIN_NAME, ERROR_TYPE, Provider, WalletProvider } from 'src/shared/interfaces';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { createWalletConnectProvider, getProviders } from 'src/shared/utils/walletHelpers';

export const useWallet = () => {
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [isInvalidChainId, setIsInvalidChainId] = useState(false);

  const checkIfWalletInstalled = () => {
    const isInstalled = !!window.ethereum;
    setIsWalletInstalled(isInstalled);
    setProviders(getProviders());
  };

  useEffectOnce(() => {
    checkIfWalletInstalled();
  });

  useEffect(() => {
    if (!isWalletInstalled) {
      return;
    }
    const wallet = localStorage.getItem(LOCAL_STORAGE_WALLET_KEY);
    if (wallet) {
      const index = providers.findIndex((provider) => wallet === provider.type);
      if (index > -1) {
        connectWallet(providers[index], false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletInstalled]);

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
    if (accounts && accounts.length > 0) {
      setWalletAddress(accounts[0]);
    } else {
      _handleDisconnect();
    }
  };

  const _handleChainChanged = (_chainId: string) => {
    console.log('chainChanged:', parseInt(_chainId));
    window.location.reload();
  };

  const _handleDisconnect = () => {
    // console.log('wallet disconnected');
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    setWalletAddress('');
    setSigner(null);
    setProvider(null);
    setProviders(getProviders());
    setIsInvalidChainId(false);
  };

  const connectWallet = async (
    provider: WalletProvider,
    needRequest = true,
  ): Promise<{ success: boolean; error?: { type: string; message: string } }> => {
    if (!provider?.provider) {
      return { success: false };
    }
    if (provider?.type === 'wallet-connect') {
      try {
        await (provider?.provider as WalletConnectProvider)?.enable();
      } catch (err: any) {
        const index = providers.findIndex((provider) => provider.type === 'wallet-connect');
        if (index >= 0) {
          setProviders([...providers.slice(0, index), createWalletConnectProvider(), ...providers.slice(index + 1)]);
        }
        return {
          success: false,
          error: {
            type: ERROR_TYPE.WALLET_CONNECT_FAILED,
            message: err?.message ?? err,
          },
        };
      }
    }
    let error: any = undefined;
    try {
      if (provider?.type !== 'wallet-connect') {
        try {
          await (provider.provider as any).request({ method: needRequest ? 'eth_requestAccounts' : 'eth_accounts' });
        } catch (error) {
          throw new Error('User Rejected');
        }
      }
      const web3Provider = new ethers.providers.Web3Provider(provider.provider as ethers.providers.ExternalProvider);
      const _signer = web3Provider.getSigner();
      const network = await web3Provider.ready;
      const userAddress = await web3Provider.getSigner().getAddress();
      // const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      const chainId = await web3Provider.send('eth_chainId', []);
      console.log(`connected to ${network?.name}`, userAddress, chainId);
      if (
        (ETH_NETWORK === CHAIN_NAME.LOCALHOST && chainId !== CHAIN_ID.LOCALHOST) ||
        (ETH_NETWORK === CHAIN_NAME.RINKEBY && chainId !== CHAIN_ID.RINKEBY) ||
        (ETH_NETWORK === CHAIN_NAME.MAIN_NET && chainId !== CHAIN_ID.MAIN_NET)
      ) {
        _handleDisconnect();
        setIsInvalidChainId(true);
        if (provider?.type !== 'wallet-connect') {
          setProvider(provider.provider);
        }
        return {
          success: false,
          error: {
            type: ERROR_TYPE.INVALID_CHAIN_ID,
            message: 'Invalid Chain ID',
          },
        };
      }
      // console.log('address', userAddress);
      if (userAddress && userAddress.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, provider.type);
        setWalletAddress(userAddress);
        setProvider(provider.provider);
        setSigner(_signer);
        return { success: true };
      }
      error = { type: ERROR_TYPE.NO_ADDRESS_FOUND, message: 'No address found.' };
    } catch (err: any) {
      error = {
        type:
          err?.message === 'User Rejected' ? ERROR_TYPE.USER_CONNECTION_REJECTED : ERROR_TYPE.UNKNOWN_CONNECTION_ERROR,
        message: err?.message ?? err,
      };
    }
    // console.log('error', error);
    _handleDisconnect();
    return {
      success: false,
      error,
    };
  };

  return {
    isWalletInstalled,
    isInvalidChainId,
    walletAddress,
    providers,
    signer,
    connectWallet,
    checkIfWalletInstalled,
  };
};
