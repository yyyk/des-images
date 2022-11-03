import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import Portis from '@portis/web3';
// import Authereum from 'authereum';
import Fortmatic from 'fortmatic';
import { APP_LOGO_URL, ETH_NETWORK } from 'src/shared/constants';
import {
  CHAIN_ID,
  CHAIN_NAME,
  ConnectWalletResponse,
  ERROR_TYPE,
  Provider,
  WalletProvider,
  WALLET_NAME,
  WALLET_TYPE,
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

export function isCoinbaseWallet(provider: WalletProvider): boolean {
  return provider?.type === WALLET_TYPE.COINBASE;
}

export function isCoinbaseWalletAndDisconnected(provider: WalletProvider): boolean {
  return isCoinbaseWallet(provider) && !(provider.provider as any)?.selectedAddress;
}

export function isWalletConnect(provider: WalletProvider): boolean {
  return provider?.type === WALLET_TYPE.WALLET_CONNECT;
}

export function isWalletPortis(provider: WalletProvider): boolean {
  return provider?.type === WALLET_TYPE.PORTIS;
}

export function isWalletAuthereum(provider: WalletProvider): boolean {
  return provider?.type === WALLET_TYPE.AUTHEREUM;
}

export function isWalletFortmatic(provider: WalletProvider): boolean {
  return provider?.type === WALLET_TYPE.FORTMATIC;
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

export function createMetaMaskProvider(provider: Provider): WalletProvider {
  return {
    type: WALLET_TYPE.METAMASK,
    name: WALLET_NAME.METAMASK,
    provider,
  };
}

export function createBraveWalletProvider(provider: Provider): WalletProvider {
  return {
    type: WALLET_TYPE.BRAVE,
    name: WALLET_NAME.BRAVE,
    provider,
  };
}

export function createOperaWalletProvider(provider: Provider): WalletProvider {
  return {
    type: WALLET_TYPE.OPERA,
    name: WALLET_NAME.OPERA,
    provider,
  };
}

const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'DesImages',
  appLogoUrl: APP_LOGO_URL,
  darkMode: false,
});
export function createCoinbaseWalletSDKProvider(): WalletProvider {
  const infuraId = process.env.REACT_APP_INFRA_ID ?? '';
  const chainId = !ETH_NETWORK ? parseInt(CHAIN_ID.LOCALHOST) : parseInt((CHAIN_ID as any)[ETH_NETWORK]);
  const provider = coinbaseWallet.makeWeb3Provider(`https://mainnet.infura.io/v3/${infuraId}`, chainId);
  return {
    type: WALLET_TYPE.COINBASE,
    name: WALLET_NAME.COINBASE,
    provider,
    logout: () => {
      coinbaseWallet.disconnect && coinbaseWallet.disconnect();
    },
  };
}

export function createCoinbaseWalletInjectedProvider(
  provider: Provider & { disconnect?: () => void; close?: () => void },
): WalletProvider {
  return {
    type: WALLET_TYPE.COINBASE,
    name: WALLET_NAME.COINBASE,
    provider,
    logout: () => {
      provider.disconnect && provider.disconnect();
      provider.close && provider.close();
    },
  };
}

export function createWalletConnectProvider(): WalletProvider | null {
  const infuraId = process.env.REACT_APP_INFRA_ID ?? '';
  if (!infuraId) {
    return null;
  }
  const provider = new WalletConnectProvider({
    infuraId,
  });
  return {
    type: WALLET_TYPE.WALLET_CONNECT,
    name: WALLET_NAME.WALLET_CONNECT,
    provider,
    logout: () => {
      provider.disconnect();
    },
  };
}

export function createPortisProvider(): WalletProvider | null {
  if (!process.env.REACT_APP_PORTIS_ID || !ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST) {
    return null;
  }
  try {
    const portis = new Portis(process.env.REACT_APP_PORTIS_ID, ETH_NETWORK);
    const { provider } = portis;
    return {
      type: WALLET_TYPE.PORTIS,
      name: WALLET_NAME.PORTIS,
      provider,
      logout: () => {
        portis.logout();
      },
    };
  } catch (e) {
    return null;
  }
}

// let authereum: any = null;
// if (ETH_NETWORK && ETH_NETWORK !== CHAIN_NAME.LOCALHOST) {
//   authereum = new Authereum(ETH_NETWORK);
// }
// export function createAuthereumProvider(): WalletProvider | null {
//   if (!authereum) {
//     return null;
//   }
//   try {
//     const provider = authereum.getProvider();
//     return {
//       type: WALLET_TYPE.AUTHEREUM,
//       name: WALLET_NAME.AUTHEREUM,
//       provider,
//       logout: () => {
//         provider.disable();
//       },
//     };
//   } catch (e) {
//     return null;
//   }
// }

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
    const provider = fm.getProvider() as any;
    provider.fm = fm;
    return {
      type: WALLET_TYPE.FORTMATIC,
      name: WALLET_NAME.FORTMATIC,
      provider,
      logout: async () => {
        await fm.user?.logout();
      },
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
    const index = metaMaskProvider.findIndex(
      (provider) => !(provider as any)?.isBraveWallet && !(provider as any)?.isWalletLink,
    );
    index > -1 && providers.push(createMetaMaskProvider(metaMaskProvider[index]));
  }

  // Brave
  const braveWalletProvider = getInjectedProvider('isBraveWallet');
  if (braveWalletProvider?.length) {
    providers.push(createBraveWalletProvider(braveWalletProvider[0]));
  }

  // Opera
  const operaProvider = getInjectedProvider('isOpera');
  if (operaProvider?.length) {
    providers.push(createOperaWalletProvider(operaProvider[0]));
  }

  // Coinbase Wallet
  const coinbaseProvider = getInjectedProvider('isWalletLink');
  if (coinbaseProvider?.length) {
    providers.push(createCoinbaseWalletInjectedProvider(coinbaseProvider[0]));
  }
  // const coinbaseSDKProvider = createCoinbaseWalletSDKProvider();
  // coinbaseSDKProvider && providers.push(coinbaseSDKProvider);

  // Authereum
  // const authereumProvider = createAuthereumProvider();
  // authereumProvider && providers.push(authereumProvider);

  // Fortmatic
  const fortmaticProvider = createFortmaticProvider();
  fortmaticProvider && providers.push(fortmaticProvider);

  // Portis
  const portisProvider = createPortisProvider();
  portisProvider && providers.push(portisProvider);

  // WalletConnect
  const walletConnectProvider = createWalletConnectProvider();
  walletConnectProvider && providers.push(walletConnectProvider);

  return providers;
}

export function isInvalidChain(chainId: number | string): boolean {
  return (
    (ETH_NETWORK === CHAIN_NAME.LOCALHOST &&
      chainId !== CHAIN_ID.LOCALHOST &&
      chainId !== parseInt(CHAIN_ID.LOCALHOST)) ||
    (ETH_NETWORK === CHAIN_NAME.RINKEBY && chainId !== CHAIN_ID.RINKEBY && chainId !== parseInt(CHAIN_ID.RINKEBY)) ||
    (ETH_NETWORK === CHAIN_NAME.MAIN_NET && chainId !== CHAIN_ID.MAIN_NET && chainId !== parseInt(CHAIN_ID.MAIN_NET))
  );
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
