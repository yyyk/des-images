import { ReactNode } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import AlertBanner from 'src/shared/components/alertBanner';
import Header from 'src/shared/components/header';
import Footer from 'src/shared/components/footer';
import StatsBanner from 'src/shared/components/statsBanner';
import NotificationsContainer from 'src/shared/components/notificationContainer';

const Layout = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  const { isInvalidChainId, walletAddress } = useWalletContext();

  return (
    <div data-theme={theme} className="min-h-screen w-full flex flex-col flex-nowrap">
      {/* <div className="alert alert-info justify-center rounded-none w-screen bg-primary text-primary-content">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Currently in beta on rinkeby network</span>
        </div>
      </div> */}
      {isInvalidChainId && <AlertBanner />}
      {walletAddress && <StatsBanner />}
      <div className="prose w-full mx-auto flex flex-col flex-nowrap grow px-3 py-0 overflow-x-hidden">
        <Header />
        <main className="w-full my-0 mx-auto pt-0 pb-16 flex flex-col flex-nowrap grow">{children}</main>
        <Footer />
      </div>
      <NotificationsContainer />
    </div>
  );
};

export default Layout;
