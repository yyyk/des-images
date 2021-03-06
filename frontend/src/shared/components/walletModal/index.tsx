import { MouseEvent } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { ERROR_TYPE, NOTIFICATION_TYPE, WalletProvider } from 'src/shared/interfaces';
import { useNotificationContext } from 'src/shared/contexts/notification';
import Modal from 'src/shared/components/modal';
import Logo from 'src/shared/components/logo';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const WalletModal = ({ open, onClose }: WalletModalProps) => {
  const { providers, connectWallet } = useWalletContext();
  const { add: addNotification } = useNotificationContext();
  // console.log(providers);

  const listClasses = 'p-0 mx-0 mt-0 mb-4 last:mb-0 w-full';
  const buttonClasses =
    'font-normal w-full px-4 py-3 flex row nowrap justify-center items-center border border-solid border-gray-200 rounded hover:border-gray-300 hover:bg-gray-100';
  const logoContainerClasses = 'w-auto h-auto max-w-[36px] max-h-[36px] mr-2';

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
        {providers.map((provider) => (
          <li key={provider?.type} className={listClasses}>
            <button className={buttonClasses} onClick={handleConnectWallet(provider)}>
              <span className={logoContainerClasses}>
                <Logo type={provider?.type} />
              </span>
              <span>{provider?.name ?? ''}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default WalletModal;
