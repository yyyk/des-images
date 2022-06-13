import { WALLET_TYPE } from 'src/shared/interfaces';
import MetaMaskLogo from 'src/shared/components/logo/logos/metamask';
import CoinbaseWalletLogo from 'src/shared/components/logo/logos/coinbaseWallet';
import WalletConnectLogo from 'src/shared/components/logo/logos/walletConnect';
import BraveLogo from 'src/shared/components/logo/logos/brave';
import OperaLogo from 'src/shared/components/logo/logos/opera';
import PortisLogo from 'src/shared/components/logo/logos/portis';
import AuthereumLogo from 'src/shared/components/logo/logos/authereum';
import FortmaticLogo from 'src/shared/components/logo/logos/fortmatic';

const Logo = ({ type }: { type: WALLET_TYPE }) => {
  switch (type) {
    case WALLET_TYPE.METAMASK:
      return <MetaMaskLogo />;
    case WALLET_TYPE.BRAVE:
      return <BraveLogo />;
    case WALLET_TYPE.OPERA:
      return <OperaLogo />;
    case WALLET_TYPE.COINBASE:
      return <CoinbaseWalletLogo />;
    case WALLET_TYPE.PORTIS:
      return <PortisLogo />;
    case WALLET_TYPE.AUTHEREUM:
      return <AuthereumLogo />;
    case WALLET_TYPE.FORTMATIC:
      return <FortmaticLogo />;
    case WALLET_TYPE.WALLET_CONNECT:
      return <WalletConnectLogo />;
    default:
      return null;
  }
};

export default Logo;
