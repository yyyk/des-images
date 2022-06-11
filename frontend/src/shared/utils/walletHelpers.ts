import WalletConnectProvider from '@walletconnect/web3-provider';
import Portis from '@portis/web3';
import Authereum from 'authereum';
import Fortmatic from 'fortmatic';
// import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ETH_MAINNET_JSONRPC_URL, ETH_NETWORK, ETH_RINKEBY_JSONRPC_URL } from 'src/shared/constants';
import {
  CHAIN_ID,
  CHAIN_NAME,
  ConnectWalletResponse,
  ERROR_TYPE,
  Provider,
  WalletProvider,
} from 'src/shared/interfaces';

export function createErrorResponse(type: ERROR_TYPE, message: string): ConnectWalletResponse {
  return {
    success: false,
    error: {
      type,
      message,
    },
  };
}

export function isWalletConnect(provider: WalletProvider): boolean {
  return provider?.type === 'wallet-connect';
}

export function isWalletPortis(provider: WalletProvider): boolean {
  return provider?.type === 'portis';
}

export function isWalletAuthereum(provider: WalletProvider): boolean {
  return provider?.type === 'authereum';
}

export function isWalletFortmatic(provider: WalletProvider): boolean {
  return provider?.type === 'fortmatic';
}

export function getInjectedProvider(key: string): Provider[] {
  if (!key) {
    return [];
  }
  return window.ethereum?.providers?.length
    ? window.ethereum?.providers.filter((x: any) => x?.[key])
    : window?.ethereum?.[key]
    ? [window?.ethereum]
    : [];
}

export function createWalletConnectProvider(): WalletProvider {
  return {
    type: 'wallet-connect',
    name: 'WalletConnect',
    provider: new WalletConnectProvider({
      rpc: {
        [parseInt(CHAIN_ID.MAIN_NET)]: ETH_MAINNET_JSONRPC_URL,
        [parseInt(CHAIN_ID.RINKEBY)]: ETH_RINKEBY_JSONRPC_URL,
      },
    }),
  };
}

export function createMetaMaskProvider(provider: Provider): WalletProvider {
  return {
    type: 'metamask',
    name: 'MetaMask',
    provider,
  };
}

export function createBraveWalletProvider(provider: Provider): WalletProvider {
  return {
    type: 'brave',
    name: 'Brave Wallet',
    provider,
  };
}

export function createOperaWalletProvider(provider: Provider): WalletProvider {
  return {
    type: 'opera',
    name: 'Opera Wallet',
    provider,
  };
}

export function createCoinbaseWalletProvider(provider: Provider): WalletProvider {
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
  return {
    type: 'coinbase',
    name: 'Coinbase Wallet',
    provider,
  };
}

export function createPortisProvider(): WalletProvider | null {
  if (!process.env.REACT_APP_PORTIS_ID || !ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST) {
    return null;
  }
  try {
    const portis = new Portis(process.env.REACT_APP_PORTIS_ID ?? '', ETH_NETWORK);
    const { provider } = portis;
    return {
      type: 'portis',
      name: 'Portis',
      provider,
    };
  } catch (e) {
    return null;
  }
}

export function createAuthereumProvider(): WalletProvider | null {
  if (!ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST) {
    return null;
  }
  try {
    const authereum = new Authereum(ETH_NETWORK);
    const provider = authereum.getProvider();
    return {
      type: 'authereum',
      name: 'Authereum',
      provider,
    };
  } catch (e) {
    return null;
  }
}

export function createFortmaticProvider(): WalletProvider | null {
  if (!ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST) {
    return null;
  }
  const apiKey =
    ETH_NETWORK === CHAIN_NAME.MAIN_NET
      ? process.env.REACT_APP_FORMATIC_MAINNET_ID
      : process.env.REACT_APP_FORMATIC_TESTNET_ID;
  if (!apiKey) {
    return null;
  }
  try {
    const fm = new Fortmatic(apiKey);
    const provider = fm.getProvider() as any as Provider;
    return {
      type: 'fortmatic',
      name: 'Fortmatic',
      provider,
    };
  } catch (e) {
    return null;
  }
}

// TODO:
// torus?
// frame?

export function getProviders(): WalletProvider[] {
  const providers = [];
  // MetaMask
  const metaMaskProvider = getInjectedProvider('isMetaMask');
  if (metaMaskProvider?.length) {
    metaMaskProvider.forEach((provider) => {
      if (!(provider as any)?.isBraveWallet && !(provider as any)?.isWalletLink) {
        // MetaMask
        providers.push(createMetaMaskProvider(provider));
      } else if ((provider as any)?.isBraveWallet && !(provider as any)?.isWalletLink) {
        // Brave
        providers.push(createBraveWalletProvider(provider));
      }
    });
  } else {
    // Brave
    const braveWalletProvider = getInjectedProvider('isBraveWallet');
    if (braveWalletProvider?.length) {
      providers.push(createBraveWalletProvider(braveWalletProvider[0]));
    }
  }
  // Opera
  const operaProvider = getInjectedProvider('isOpera');
  if (operaProvider?.length) {
    providers.push(createOperaWalletProvider(operaProvider[0]));
  }
  // Coinbase Wallet
  const coinbaseProvider = getInjectedProvider('isWalletLink');
  if (coinbaseProvider?.length) {
    providers.push(createCoinbaseWalletProvider(coinbaseProvider[0]));
  }
  // Portis
  const portisProvider = createPortisProvider();
  if (portisProvider) {
    providers.push(portisProvider);
  }
  // Authereum
  const authereumProvider = createAuthereumProvider();
  if (authereumProvider) {
    providers.push(authereumProvider);
  }
  // Fortmatic
  const fortmaticProvider = createFortmaticProvider();
  if (fortmaticProvider) {
    providers.push(fortmaticProvider);
  }
  // WalletConnect
  providers.push(createWalletConnectProvider());

  return providers;
}

export function isMobile(): boolean {
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
      navigator.userAgent,
    ) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
      navigator.userAgent.substr(0, 4),
    )
  ) {
    return true;
  }
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {}
  return false;
}
