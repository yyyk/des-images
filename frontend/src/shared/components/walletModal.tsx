import { MouseEvent } from 'react';
import Modal from 'src/shared/components/modal';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { WalletProvider } from 'src/shared/interfaces';
import MetaMaskLogo from 'src/shared/components/logos/metamask';
import CoinbaseWalletLogo from 'src/shared/components/logos/coinbaseWallet';
import WalletConnectLogo from 'src/shared/components/logos/walletConnect';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { providers, connectWallet } = useWalletContext();
  // console.log(providers);

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
        {!providers.some((provider) => provider?.type === 'metamask') && (
          <li className="p-0 mx-0 mt-0 mb-4 w-full">
            <a
              className="font-normal no-underline w-full px-4 py-3 flex row nowrap justify-center items-center border border-solid border-neutral-300 rounded"
              href="https://metamask.io/download.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="w-9 mr-2">
                <MetaMaskLogo />
              </span>
              <span>Metamask</span>
            </a>
          </li>
        )}
        {providers.map((provider) => (
          <li key={provider?.type} className="p-0 mx-0 mt-0 mb-4 last:mb-0 w-full">
            <button
              className="font-normal w-full px-4 py-3 flex row nowrap justify-center items-center border border-solid border-neutral-300 rounded"
              onClick={handleConnectWallet(provider)}
            >
              {provider?.type === 'metamask' && (
                <span className="w-9 mr-2">
                  <MetaMaskLogo />
                </span>
              )}
              {provider?.type === 'coinbase' && (
                <span className="w-9 mr-2">
                  <CoinbaseWalletLogo />
                </span>
              )}
              {provider?.type === 'wallet-connect' && (
                <span className="w-9 mr-2">
                  <WalletConnectLogo />
                </span>
              )}
              <span>{provider?.name ?? ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default WalletModal;
