import { MouseEvent } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { WalletProvider } from 'src/shared/interfaces';
import Modal from 'src/shared/components/modal';
import MetaMaskLogo from 'src/shared/components/logos/metamask';
import CoinbaseWalletLogo from 'src/shared/components/logos/coinbaseWallet';
import WalletConnectLogo from 'src/shared/components/logos/walletConnect';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { providers, connectWallet } = useWalletContext();
  const isMetaMaskNotInstalled = !providers.some((provider) => provider?.type === 'metamask');
  // console.log(providers);

  const listClasses = 'p-0 mx-0 mt-0 mb-4 last:mb-0 w-full';
  const buttonClasses =
    'font-normal w-full px-4 py-3 flex row nowrap justify-center items-center border border-solid border-neutral-300 rounded';
  const linkClasses = `no-underline ${buttonClasses}`;
  const logoContainerClasses = 'w-9 mr-2';

  const handleConnectWallet = (provider: WalletProvider) => async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await connectWallet(provider);
    if (res.success || (!res.success && res.error?.type === 'InvalidChainIdError')) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ul className="list-none p-0 m-0">
        {isMetaMaskNotInstalled && (
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
            <button className={buttonClasses} onClick={handleConnectWallet(provider)}>
              <span className={logoContainerClasses}>
                {provider?.type === 'metamask' && <MetaMaskLogo />}
                {provider?.type === 'coinbase' && <CoinbaseWalletLogo />}
                {provider?.type === 'wallet-connect' && <WalletConnectLogo />}
              </span>
              <span>{provider?.name ?? ''}</span>
            </button>
          </li>
        ))}
      </ul>
      {isMetaMaskNotInstalled && (
        <p className="text-center m-0 mt-4 -mb-2">Note: Please reload the page after installing MetaMask.</p>
      )}
    </Modal>
  );
};

export default WalletModal;
