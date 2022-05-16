import WalletConnectProvider from '@walletconnect/web3-provider';
// import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ETH_MAINNET_JSONRPC_URL, HARDHAT_CHAIN_ID, HARDHAT_JSONRPC_URL, MAINNET_CHAIN_ID } from 'src/shared/constants';
import { Provider, WalletProvider } from 'src/shared/interfaces';

export function getWindowEthereum(key: string): Provider[] {
  if (!key) {
    return [];
  }
  return window.ethereum?.providers
    ? window.ethereum?.providers.filter((x: any) => x?.[key])
    : window?.ethereum?.[key]
    ? [window?.ethereum]
    : [];
}

export function getProviders(): WalletProvider[] {
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
}
