import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWalletContext } from 'src/shared/contexts/wallet';
import WalletModal from 'src/shared/components/walletModal';

const HomeLink = () => (
  <Link className="block font-extrabold text-inherit no-underline hover:underline" to="/">
    desImages
  </Link>
);

const OfficialBadgeLink = ({ pathname }: { pathname: string }) => (
  <Link className="block badge badge-ghost font-normal no-underline" to="/mod" state={{ previousPath: pathname }}>
    official
  </Link>
);

const ModBadgeLink = ({ toCatalog }: { toCatalog: boolean }) => (
  <Link className="block badge badge-outline font-normal no-underline" to={toCatalog ? '/catalog' : '/'}>
    mod
  </Link>
);

const CatalogLink = () => (
  <Link className="btn btn-md ml-auto" to="/catalog">
    to the catalog
  </Link>
);

const GoBackButton = () => {
  const navigate = useNavigate();
  return (
    <button className="btn btn-md btn-outline ml-auto" onClick={() => navigate(-1)}>
      go back
    </button>
  );
};

const WalletAddress = () => {
  const { walletAddress } = useWalletContext();
  return (
    <span className="ml-auto">{`Connected: ${String(walletAddress).substring(0, 6)}...${String(walletAddress).substring(
      38,
    )}`}</span>
  );
};

const ConnectWalletButton = () => {
  const { checkIfWalletInstalled } = useWalletContext();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const handleClick = () => {
    checkIfWalletInstalled();
    setWalletModalOpen(true);
  };
  return (
    <>
      <>
        <button className="btn btn-md ml-auto" onClick={handleClick}>
          Connect Wallet
        </button>
        <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      </>
    </>
  );
};

const Header = () => {
  const { pathname, state } = useLocation();
  const { walletAddress } = useWalletContext();

  const isPrevPathCatalog = (state as any)?.previousPath === '/catalog';

  return (
    <header
      style={{ minHeight: '48px' }}
      className="prose w-full flex justify-between items-center flex-wrap mt-3 sm:mt-6 mb-8 sm:mb-10 mx-auto"
    >
      <div className="flex justify-start items-end">
        <h1 className="m-0">{pathname === '/' ? 'desImages' : <HomeLink />}</h1>
        <div
          className="tooltip tooltip-bottom ml-1 mb-0.5"
          data-tip={pathname !== '/mod' ? 'mod?' : `back to ${isPrevPathCatalog ? 'catalog' : 'official'}?`}
        >
          {pathname !== '/mod' ? (
            <OfficialBadgeLink pathname={pathname} />
          ) : (
            <ModBadgeLink toCatalog={isPrevPathCatalog} />
          )}
        </div>
      </div>
      {pathname === '/' && <CatalogLink />}
      {pathname === '/mod' && isPrevPathCatalog && <GoBackButton />}
      {pathname === '/catalog' && (walletAddress.length > 0 ? <WalletAddress /> : <ConnectWalletButton />)}
    </header>
  );
};

export default Header;
