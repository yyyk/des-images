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
  <>
    <Link className="btn btn-square w-[36px] h-[36px] min-h-[36px] ml-auto flex sm:hidden" to="/catalog">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
        />
      </svg>
    </Link>
    <Link className="btn btn-md ml-auto hidden sm:flex" to="/catalog">
      to the catalog
    </Link>
  </>
);

const GoBackButton = () => {
  const navigate = useNavigate();
  return (
    <>
      <button
        className="btn btn-square w-[36px] h-[36px] min-h-[36px] ml-auto flex sm:hidden"
        onClick={() => navigate(-1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
      </button>
      <button className="btn btn-md ml-auto hidden sm:flex" onClick={() => navigate(-1)}>
        go back
      </button>
    </>
  );
};

const WalletAddress = () => {
  const { walletAddress } = useWalletContext();
  return (
    <span className="hidden sm:inline ml-auto">{`Connected: ${String(walletAddress).substring(0, 6)}...${String(
      walletAddress,
    ).substring(38)}`}</span>
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
        <button className="btn btn-square w-[36px] h-[36px] min-h-[36px] ml-auto flex sm:hidden" onClick={handleClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </button>
        <button className="btn btn-md ml-auto hidden sm:flex" onClick={handleClick}>
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
      className="w-full flex justify-between items-center flex-wrap mt-3 sm:mt-6 mb-8 sm:mb-10 mx-auto"
    >
      <div className="flex justify-start items-end">
        <h1 className="m-0">{pathname === '/' ? 'desImages' : <HomeLink />}</h1>
        <div
          className="tooltip tooltip-bottom ml-1 mb-[5px]"
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
