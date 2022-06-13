import Modal from 'src/shared/components/modal';
import { useWalletContext } from 'src/shared/contexts/wallet';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
}

const LogoutModal = ({ open, onClose }: LogoutModalProps) => {
  const { walletProvider, logout } = useWalletContext();
  const handleLogout = async () => {
    if (!walletProvider) {
      return;
    }
    await logout(walletProvider);
    onClose();
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      actions={
        <>
          <button className="btn btn-outline mr-4" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
        </>
      }
    >
      <div>
        <p className="m-0">Are you sure you want to logout?</p>
      </div>
    </Modal>
  );
};

export default LogoutModal;
