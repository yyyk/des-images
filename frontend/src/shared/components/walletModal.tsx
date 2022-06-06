import { MouseEvent, useEffect, useRef } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { ERROR_TYPE, NOTIFICATION_TYPE, WalletProvider } from 'src/shared/interfaces';
import Modal from 'src/shared/components/modal';
import MetaMaskLogo from 'src/shared/components/logos/metamask';
import CoinbaseWalletLogo from 'src/shared/components/logos/coinbaseWallet';
import WalletConnectLogo from 'src/shared/components/logos/walletConnect';
import BraveLogo from 'src/shared/components/logos/brave';
import OperaLogo from 'src/shared/components/logos/opera';
import { useNotificationContext } from 'src/shared/contexts/notification';
import { isMobile } from 'src/shared/utils/walletHelpers';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { providers, connectWallet } = useWalletContext();
  const { add: addNotification } = useNotificationContext();
  const walletConnectRef = useRef<HTMLButtonElement>(null);
  const isNotMobile = !isMobile();
  const showMetaMaskInstallLink = !providers.some(
    (provider) => provider?.type === 'metamask' || provider?.type === 'brave' || provider?.type === 'opera',
  );
  // console.log(providers);

  const listClasses = 'p-0 mx-0 mt-0 mb-4 last:mb-0 w-full';
  const buttonClasses =
    'font-normal w-full px-4 py-3 flex row nowrap justify-center items-center border border-solid border-neutral-300 rounded';
  const linkClasses = `no-underline ${buttonClasses}`;
  const logoContainerClasses = 'w-9 mr-2';

  useEffect(() => {
    try {
      !isNotMobile && open && providers.length === 1 && walletConnectRef?.current?.click();
    } catch (err) {}
  }, [isNotMobile, open, providers]);

  const handleConnectWallet = (provider: WalletProvider) => async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await connectWallet(provider);
    if (res.success || (!res.success && res.error?.type === ERROR_TYPE.INVALID_CHAIN_ID)) {
      onClose();
      return;
    }
    onClose();
    addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Connection canceled.' });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ul className="list-none p-0 m-0">
        {isNotMobile && showMetaMaskInstallLink && (
          <li className={listClasses}>
            <a className={linkClasses} href="https://metamask.io/download.html" target="_blank" rel="noreferrer">
              <span className={logoContainerClasses}>
                <MetaMaskLogo />
              </span>
              <span>Install Metamask</span>
            </a>
          </li>
        )}
        {providers.map((provider) => (
          <li key={provider?.type} className={listClasses}>
            <button
              ref={provider?.type === 'wallet-connect' ? walletConnectRef : undefined}
              className={buttonClasses}
              onClick={handleConnectWallet(provider)}
            >
              <span className={logoContainerClasses}>
                {provider?.type === 'metamask' && <MetaMaskLogo />}
                {provider?.type === 'brave' && <BraveLogo />}
                {provider?.type === 'opera' && <OperaLogo />}
                {provider?.type === 'coinbase' && <CoinbaseWalletLogo />}
                {provider?.type === 'wallet-connect' && <WalletConnectLogo />}
              </span>
              <span>{provider?.name ?? ''}</span>
            </button>
          </li>
        ))}
      </ul>
      {isNotMobile && showMetaMaskInstallLink && (
        <p className="text-center m-0 mt-4">Note: Please reload the page after installing MetaMask.</p>
      )}
    </Modal>
  );
};

export default WalletModal;
