import { ReactNode } from 'react';
import { useWalletContext } from 'src/shared/contexts/wallet';
import AlertBanner from 'src/shared/components/alertBanner';
import { useThemeContext } from '../contexts/theme';

const Layout = ({ children }: { children: ReactNode }) => {
  const { isWalletInstalled } = useWalletContext();
  const { theme } = useThemeContext();

  return (
    <div data-theme={theme}>
      {!isWalletInstalled && <AlertBanner />}
      <main className="prose mx-auto pt-8 pb-14 flex flex-col flex-nowrap min-h-screen">{children}</main>
    </div>
  );
};

export default Layout;
