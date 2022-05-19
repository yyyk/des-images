import { ReactNode } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import AlertBanner from 'src/shared/components/alertBanner';
import Header from 'src/shared/components/header';
import Footer from 'src/shared/components/footer';

const Layout = ({ children }: { children: ReactNode }) => {
  const { theme } = useThemeContext();
  const { isInvalidChainId } = useWalletContext();

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col flex-nowrap">
      {isInvalidChainId && <AlertBanner />}
      <div className="px-3 py-0 flex flex-col flex-nowrap grow">
        <Header />
        <main className="prose w-full mx-auto mt-0 pt-0 pb-14 flex flex-col flex-nowrap grow">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
