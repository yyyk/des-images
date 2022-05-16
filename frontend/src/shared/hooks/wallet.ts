import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
// import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import WalletConnectProvider from '@walletconnect/web3-provider';
import {
  ETH_MAINNET_JSONRPC_URL,
  HARDHAT_CHAIN_ID,
  HARDHAT_JSONRPC_URL,
  LOCAL_STORAGE_WALLET_KEY,
  MAINNET_CHAIN_ID,
} from 'src/shared/constants';
import { useEffectOnce } from 'src/shared/utils/hookHelper';

// async function getAccount(needRequest = false): Promise<string> {
//   const eth = window.ethereum;
//   if (!eth) {
//     return '';
//   }
//   const accounts = (await eth.request({ method: needRequest ? 'eth_requestAccounts' : 'eth_accounts' })) as string[];
//   // console.log(accounts);
//   if (!accounts || accounts.length === 0) {
//     return '';
//   }
//   // console.log(accounts[0]);
//   return accounts[0];
// }

function handleChainChanged(_chainId: string) {
  console.log('chainChanged:', parseInt(_chainId));
  window.location.reload();
}

const getWindowEthereum = (key: string): any[] => {
  if (!key) {
    return [];
  }
  return window.ethereum?.providers
    ? window.ethereum?.providers.filter((x: any) => x?.[key])
    : window?.ethereum?.[key]
    ? [window?.ethereum]
    : [];
};

const getProviders = () => {
  const providers = [];
  // MetaMask
  const metaMaskProvider = getWindowEthereum('isMetaMask');
  if (metaMaskProvider.length > 0) {
    providers.push({
      type: 'metamask',
      name: 'MetaMask',
      provider: metaMaskProvider[0],
    });
  }
  // Coinbase Wallet
  const coinbaseProvider = getWindowEthereum('isWalletLink');
  if (coinbaseProvider.length > 0) {
    // const coinbaseWallet = new CoinbaseWalletSDK({
    //   appName: 'desImages',
    //   appLogoUrl: '',
    //   darkMode: false,
    // });
    // providers.push({
    //   type: 'coinbase',
    //   name: 'Coinbase Wallet',
    //   provider: coinbaseWallet.makeWeb3Provider(
    //     process.env.NODE_ENV === 'development' ? HARDHAT_JSONRPC_URL : ETH_MAINNET_JSONRPC_URL,
    //     process.env.NODE_ENV === 'development' ? HARDHAT_CHAIN_ID : MAINNET_CHAIN_ID,
    //   ),
    // });
    providers.push({
      type: 'coinbase',
      name: 'Coinbase Wallet',
      provider: coinbaseProvider[0],
    });
  }
  // WalletConnect
  providers.push({
    type: 'wallet-connect',
    name: 'WalletConnect',
    provider: new WalletConnectProvider({
      rpc: {
        [MAINNET_CHAIN_ID]: ETH_MAINNET_JSONRPC_URL,
        [HARDHAT_CHAIN_ID]: HARDHAT_JSONRPC_URL,
      },
    }),
  });

  return providers;
};

export const useWallet = () => {
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);

  useEffectOnce(() => {
    const isInstalled = !!window.ethereum;
    setIsWalletInstalled(isInstalled);
    setProviders(getProviders());
  });

  useEffect(() => {
    if (!isWalletInstalled) {
      return;
    }
    // TODO: read local storage for provider
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
  }, [provider]);

  const handleAccountChange = (accounts: string[]) => {
    if (accounts && accounts.length > 0) {
      setWalletAddress(accounts[0]);
    } else {
      setWalletAddress('');
    }
  };

  const handleDisconnect = () => {
    console.log('wallet disconnected');
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
    setWalletAddress('');
    setSigner(null);
    setProvider(null);
    setProviders(getProviders());
  };

  const connectWallet = async (provider: any, needRequest = true) => {
    // isCoinbaseWallet, isMetaMask
    // const walletProvider = window.ethereum?.providers?.filter((x: ethers.providers.ExternalProvider) => x?.isMetaMask);
    // if (walletProvider && walletProvider.length > 0) {
    //   const web3Provider = new ethers.providers.Web3Provider(walletProvider[0]);
    //   const _signer = web3Provider.getSigner();
    //   const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
    //   if (_address && _address.length > 0) {
    //     setProvider(walletProvider[0]);
    //     setSigner(_signer);
    //     setWalletAddress(_address[0]);
    //   }
    // }
    if (provider?.type === 'wallet-connect') {
      try {
        await provider?.provider?.enable();
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
        throw new Error(err);
      }
    }
    const web3Provider = new ethers.providers.Web3Provider(provider.provider);
    const _signer = web3Provider.getSigner();
    const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
    // console.log(_address);
    if (_address && _address.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_WALLET_KEY, provider.type);
      setProvider(provider.provider);
      setSigner(_signer);
      setWalletAddress(_address[0]);
      return;
    }
    localStorage.removeItem(LOCAL_STORAGE_WALLET_KEY);
  };

  return {
    isWalletInstalled,
    walletAddress,
    connectWallet,
    providers,
    provider,
    signer,
  };
};
