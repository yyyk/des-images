import { MouseEvent } from 'react';
import Modal from 'src/shared/components/modal';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { WalletProvider } from 'src/shared/interfaces';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { providers, connectWallet } = useWalletContext();
  // console.log(providers);

  const handleConnectWallet = (provider: WalletProvider) => async (e: MouseEvent) => {
    e.preventDefault();
    try {
      await connectWallet(provider);
    } catch (err) {
      console.log(err);
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ul className="list-none p-0 m-0">
        {!providers.some((provider) => provider?.type === 'metamask') && (
          <li className="p-0 m-0">
            <a className="link" href="https://metamask.io/download.html" target="_blank" rel="noreferrer">
              Install Metamask
            </a>
          </li>
        )}
        {providers.map((provider) => (
          <li key={provider?.type} className="p-0 m-0">
            <button onClick={handleConnectWallet(provider)}>{provider?.name ?? ''}</button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default WalletModal;
