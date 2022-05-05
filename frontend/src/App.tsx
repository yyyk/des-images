import { Routes, Route } from 'react-router-dom';
import ContractContextProvider from 'src/shared/contexts/contract';
import WalletContextProvider from 'src/shared/contexts/wallet';
import ThemeContextProvider from 'src/shared/contexts/theme';
import Layout from 'src/shared/components/layout';
import Main from 'src/main';
import Mod from 'src/mod';

const App = () => {
  return (
    <WalletContextProvider>
      <ContractContextProvider>
        <ThemeContextProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="mod" element={<Mod />} />
            </Routes>
          </Layout>
        </ThemeContextProvider>
      </ContractContextProvider>
    </WalletContextProvider>
  );
};

export default App;
