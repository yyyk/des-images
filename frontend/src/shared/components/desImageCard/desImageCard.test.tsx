import { fireEvent, render, screen } from '@testing-library/react';
import * as ThemeContext from 'src/shared/contexts/theme';
import * as CatalogContext from 'src/shared/contexts/catalog';
import * as ContractContext from 'src/shared/contexts/contract';
import * as WalletContext from 'src/shared/contexts/wallet';
import DesImageCard from '.';
import { TokenData } from 'src/shared/interfaces';

describe('<DesImageCard>', function () {
  let themeMock: jest.SpyInstance;
  let walletMock: jest.SpyInstance;
  let contractMock: jest.SpyInstance;
  let catalogMock: jest.SpyInstance;

  const baseTokenData: TokenData = {
    plaintext: 'i am still alive',
    ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
    dateHex: '0x7e4101',
    day: '1',
    month: '1',
    year: '2020',
  };

  beforeEach(() => {
    themeMock = jest
      .spyOn(ThemeContext, 'useThemeContext')
      .mockImplementation(() => ({ theme: 'lofi', setTheme: jest.fn() }));

    walletMock = jest.spyOn(WalletContext, 'useWalletContext').mockImplementation(() => ({
      signer: null,
      providers: [],
      isInvalidChainId: false,
      walletAddress: '0x000000000',
      walletProvider: null,
      canLogout: true,
      connectWallet: jest.fn(),
      logout: jest.fn(),
    }));

    contractMock = jest.spyOn(ContractContext, 'useContractContext').mockImplementation(() => ({
      contract: null,
      isPaused: false,
      totalSupply: '',
      totalEverMinted: '',
      mintPrice: '',
      burnPrice: '',
      ownedTokenIds: [],
      isUserTokenIDsLoading: false,
      mint: (dateHex: string, ciphertext: string) => new Promise((resolve, reject) => resolve(true)),
      burn: (tokenId: string) => new Promise((resolve, reject) => resolve(true)),
    }));

    catalogMock = jest.spyOn(CatalogContext, 'useCatalogContext').mockImplementation(() => ({
      tokenData: [],
      ownedTokenData: [],
      isUserTokensLoading: false,
      add: jest.fn(),
      remove: jest.fn(),
      minted: jest.fn(),
      burned: jest.fn(),
    }));
  });

  afterEach(() => {
    themeMock.mockRestore();
    walletMock.mockRestore();
    contractMock.mockRestore();
    catalogMock.mockRestore();
  });

  it('renders image with title', function () {
    render(<DesImageCard tokenData={baseTokenData} />);
    expect(screen.getByRole('figure')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toHaveTextContent('#20200101');
  });

  describe('Simple card', function () {
    it('renders image, title, ciphertext, plaintext, and remove cta', function () {
      const handleOnRemove = jest.fn();
      render(
        <DesImageCard tokenData={baseTokenData} showPlaintext={true} showCiphertext={true} onRemove={handleOnRemove} />,
      );
      expect(screen.getByRole('figure')).toBeInTheDocument();
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__cta-remove')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__ciphertext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__ciphertext')).toHaveTextContent('0x79030f7920aaa3cfbbd92afbb93e70ba');
      expect(screen.getByTestId('desImagesCard__plaintext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__plaintext')).toHaveTextContent('i am still alive');

      fireEvent.click(screen.getByTestId('desImagesCard__cta-remove'));
      expect(handleOnRemove).toHaveBeenCalled();
    });
  });

  describe('Mintable card', function () {
    it('renders image, title, ciphertext, plaintext, remove cta, status badge, and mint cta', async function () {
      render(
        <DesImageCard
          tokenData={{
            ...baseTokenData,
            status: 0,
            isOwner: false,
          }}
          showPlaintext={true}
          showCiphertext={true}
          showStatus={true}
          onRemove={jest.fn()}
          onMint={jest.fn()}
        />,
      );
      expect(screen.getByTestId('desImagesCard__image')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__title')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__cta-remove')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__status-badge')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__ciphertext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__plaintext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__cta-mint')).toBeInTheDocument();
    });

    it('lets the user mint', function () {
      const handleOnMint = jest.fn();
      const portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', 'modal');
      document.body.appendChild(portalRoot);
      render(
        <DesImageCard
          tokenData={{
            ...baseTokenData,
            status: 0,
            isOwner: false,
          }}
          showPlaintext={true}
          showCiphertext={true}
          showStatus={true}
          onRemove={jest.fn()}
          onMint={handleOnMint}
        />,
      );
      fireEvent.click(screen.getByTestId('desImagesCard__cta-mint'));
      fireEvent.click(screen.getByTestId('ConfirmModal__cta'));
      expect(handleOnMint).toHaveBeenCalledTimes(1);
    });
  });

  describe('Burnable card', function () {
    it('renders image, title, ciphertext, plaintext, remove cta, status badge, and burn cta', async function () {
      const handleOnBurn = jest.fn();
      render(
        <DesImageCard
          tokenData={{
            ...baseTokenData,
            status: 1,
            isOwner: true,
            tokenId: '0x0000000',
          }}
          showPlaintext={true}
          showCiphertext={true}
          showStatus={true}
          onRemove={jest.fn()}
          onBurn={handleOnBurn}
        />,
      );
      expect(screen.getByTestId('desImagesCard__image')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__title')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__cta-remove')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__status-badge')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__ciphertext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__plaintext')).toBeInTheDocument();
      expect(screen.getByTestId('desImagesCard__cta-burn')).toBeInTheDocument();
    });

    it('lets the user burn', function () {
      const handleOnBurn = jest.fn();
      render(
        <DesImageCard
          tokenData={{
            ...baseTokenData,
            status: 1,
            isOwner: true,
            tokenId: '0x0000000',
          }}
          showPlaintext={true}
          showCiphertext={true}
          showStatus={true}
          onRemove={jest.fn()}
          onBurn={handleOnBurn}
        />,
      );
      fireEvent.click(screen.getByTestId('desImagesCard__cta-burn'));
      expect(handleOnBurn).toHaveBeenCalledTimes(1);
    });
  });
});
