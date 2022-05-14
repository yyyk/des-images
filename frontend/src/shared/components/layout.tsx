import { ReactNode } from 'react';
// import { useWalletContext } from 'src/shared/contexts/wallet';
// import AlertBanner from 'src/shared/components/alertBanner';
import { useThemeContext } from 'src/shared/contexts/theme';
import Header from 'src/shared/components/header';

const Layout = ({ children }: { children: ReactNode }) => {
  // const { isWalletInstalled } = useWalletContext();
  const { theme } = useThemeContext();

  return (
    <div data-theme={theme} className="px-3 pt-0 pb-14 flex flex-col flex-nowrap min-h-screen">
      {/* {!isWalletInstalled && <AlertBanner />} */}
      <Header />
      <main className="prose w-full mx-auto mt-0 flex flex-col flex-nowrap">{children}</main>
    </div>
  );
};

export default Layout;
