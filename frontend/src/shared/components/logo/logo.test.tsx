import { render } from '@testing-library/react';
import AuthereumLogo from './logos/authereum';
import BraveLogo from './logos/brave';
import CoinbaseWalletLogo from './logos/coinbaseWallet';
import FortmaticLogo from './logos/fortmatic';
import MetaMaskLogo from './logos/metamask';
import OperaLogo from './logos/opera';
import PortisLogo from './logos/portis';
import WalletConnectLogo from './logos/walletConnect';

describe('Logos', function () {
  describe('<AuthereumLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<AuthereumLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<BraveLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<BraveLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<CoinbaseWalletLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<CoinbaseWalletLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<FortmaticLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<FortmaticLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<MetaMaskLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<MetaMaskLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<OperaLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<OperaLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<PortisLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<PortisLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  describe('<WalletConnectLogo>', function () {
    it('matches snapshot', function () {
      const { asFragment } = render(<WalletConnectLogo />);
      expect(asFragment()).toMatchSnapshot();
    });
  });
});
