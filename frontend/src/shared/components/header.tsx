import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWalletContext } from 'src/shared/contexts/wallet';
import WalletModal from 'src/shared/components/walletModal';

const Header = () => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const { walletAddress } = useWalletContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <header
      style={{ minHeight: '120px' }}
      className="prose w-full flex justify-between items-center flex-wrap pt-8 pb-10 mx-auto"
    >
      <div className="flex justify-start items-end">
        <h1 className="m-0">
          {pathname === '/' ? (
            'desImages'
          ) : (
            <Link className="font-extrabold text-inherit no-underline hover:underline" to="/">
              desImages
            </Link>
          )}
        </h1>
        <div className="tooltip tooltip-bottom ml-1" data-tip={pathname !== '/mod' ? 'mod?' : 'back to official'}>
          {pathname !== '/mod' ? (
            <Link className="badge badge-ghost font-normal no-underline" to="/mod" state={{ previousPath: pathname }}>
              official
            </Link>
          ) : (
            <Link className="badge badge-outline font-normal no-underline" to="/">
              mod
            </Link>
          )}
        </div>
      </div>
      {pathname === '/' && (
        <Link className="btn btn-md" to="/catalog">
          to the catalog
        </Link>
      )}
      {pathname === '/mod' && (state as any)?.previousPath === '/catalog' && (
        <button className="btn btn-md" onClick={() => navigate(-1)}>
          go back
        </button>
      )}
      {pathname === '/catalog' &&
        (walletAddress.length > 0 ? (
          <span>{`Connected: ${String(walletAddress).substring(0, 6)}...${String(walletAddress).substring(38)}`}</span>
        ) : (
          <>
            <button className="btn btn-md" onClick={() => setWalletModalOpen(true)}>
              Connect Wallet
            </button>
            <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
          </>
        ))}
    </header>
  );
};

export default Header;
