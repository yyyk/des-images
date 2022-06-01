import { Routes, Route, Navigate } from 'react-router-dom';
import ContractContextProvider from 'src/shared/contexts/contract';
import WalletContextProvider from 'src/shared/contexts/wallet';
import ThemeContextProvider from 'src/shared/contexts/theme';
import CatalogContextProvider from 'src/shared/contexts/catalog';
import NotificationContextProvider from 'src/shared/contexts/notification';
import Layout from 'src/shared/components/layout';
import Main from 'src/main';
import Mod from 'src/mod';
import Catalog from 'src/catalog';

const App = () => {
  return (
    <NotificationContextProvider>
      <WalletContextProvider>
        <ContractContextProvider>
          <CatalogContextProvider>
            <ThemeContextProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Main />} />
                  <Route path="catalog" element={<Catalog />} />
                  <Route path="mod" element={<Mod />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ThemeContextProvider>
          </CatalogContextProvider>
        </ContractContextProvider>
      </WalletContextProvider>
    </NotificationContextProvider>
  );
};

export default App;
