import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import {
  ETH_MAINNET_JSONRPC_URL,
  HARDHAT_CHAIN_ID,
  HARDHAT_JSONRPC_URL,
  LOCAL_STORAGE_WALLET_KEY,
  MAINNET_CHAIN_ID,
} from 'src/shared/constants';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { ChainId, Provider, WalletProvider } from 'src/shared/interfaces';
import { getProviders } from 'src/shared/utils/walletHelpers';

export const useWallet = () => {
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [providers, setProviders] = useState<WalletProvider[]>([]);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);
  const [isInvalidChainId, setIsInvalidChainId] = useState(false);

  useEffectOnce(() => {
    const isInstalled = !!window.ethereum;
    setIsWalletInstalled(isInstalled);
    setProviders(getProviders());
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
      setWalletAddress('');
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

  const connectWallet = async (provider: WalletProvider, needRequest = true) => {
    if (!provider?.provider) {
      return;
    }
    if (provider?.type === 'wallet-connect') {
      try {
        await (provider?.provider as WalletConnectProvider)?.enable();
      } catch (err: any) {
        const index = providers.findIndex((provider) => provider.type === 'wallet-connect');
        if (index >= 0) {
          setProviders([
            ...providers.slice(0, index),
            {
              type: 'wallet-connect',
              name: 'WalletConnect',
              provider: new WalletConnectProvider({
                rpc: {
                  [MAINNET_CHAIN_ID]: ETH_MAINNET_JSONRPC_URL,
                  [HARDHAT_CHAIN_ID]: HARDHAT_JSONRPC_URL,
                },
              }),
            },
            ...providers.slice(index + 1),
          ]);
        }
        throw new Error(err?.message ?? err);
      }
    }
    try {
      const web3Provider = new ethers.providers.Web3Provider(provider.provider as ethers.providers.ExternalProvider);
      const _signer = web3Provider.getSigner();
      const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      const chainId = await web3Provider.send('eth_chainId', []);
      if (
        (process.env.NODE_ENV === 'production' && chainId !== ChainId.MAIN_NET) ||
        // TODO:
        // (process.env.NODE_ENV === 'test' && chainId !== ChainId.RINKEBY) ||
        (process.env.NODE_ENV === 'development' && chainId !== ChainId.LOCALHOST)
      ) {
        setIsInvalidChainId(true);
        return;
      }
      // console.log(_address);
      if (_address && _address.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, provider.type);
        setProvider(provider.provider);
        setSigner(_signer);
        setWalletAddress(_address[0]);
        return;
      }
    } catch (err: any) {
      throw new Error(err?.message ?? err);
    }
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
  };

  return {
    isWalletInstalled,
    isInvalidChainId,
    walletAddress,
    connectWallet,
    providers,
    provider,
    signer,
  };
};
