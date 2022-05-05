import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { PreviewFormData, TokenData } from 'src/shared/interfaces';
import { defaultTokenData } from 'src/shared/constants';
import Stats from 'src/shared/components/stats';
import Description from 'src/main/components/description';
import Supplement from 'src/main/components/supplement';
import DesImageCard from 'src/shared/components/desImageCard';
import Subtitle from 'src/shared/components/subtitle';
import PreviewForm from 'src/main/components/previewForm';
import { getTokenData } from 'src/shared/utils/getTokenData';

const Main = () => {
  const { setTheme } = useThemeContext();
  const { isWalletInstalled, walletAddress, connectWallet } = useWalletContext();
  const [tokenData, setTokenData] = useState<TokenData>(defaultTokenData);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme('lofi');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectWallet = async () => {
    connectWallet();
  };

  const handleOnPreview = ({ year, month, day }: PreviewFormData) => {
    setTokenData(getTokenData({ year, month, day }));
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <header className="flex justify-between items-center flex-wrap">
        <div className="flex justify-start items-end">
          <h1 className="m-0">desImages</h1>
          <div className="tooltip tooltip-bottom ml-1" data-tip="try mod?">
            <Link className="badge badge-ghost font-normal no-underline" to="/mod">
              official
            </Link>
          </div>
        </div>
        {/* {isWalletInstalled && (
          <div>
            {walletAddress.length > 0 ? (
              <span>{`Connected: ${String(walletAddress).substring(0, 6)}...${String(walletAddress).substring(
                38,
              )}`}</span>
            ) : (
              <button className="btn" onClick={handleConnectWallet}>
                Connect Wallet
              </button>
            )}
          </div>
        )} */}
      </header>
      <div className="w-2/3 mx-auto mt-10">
        <DesImageCard
          tokenData={{
            day: '1',
            month: '1',
            year: '2020',
            dateHex: '0x7e4101',
            ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
          }}
        />
      </div>
      <div className="mx-0 mb-0 mt-10 text-center">
        <Subtitle />
      </div>
      {walletAddress && (
        <div className="mt-6 grow flex flex-col flex-nowrap justify-end">
          <Stats />
        </div>
      )}
      <div className="mt-10">
        <Description />
      </div>
      <div className="mt-7">
        <PreviewForm onSubmit={handleOnPreview} />
      </div>
      <div ref={scrollRef} className="w-2/3 mx-auto mt-12">
        <DesImageCard tokenData={tokenData} />
      </div>
      <div className="mt-12 mb-5">
        <Supplement />
      </div>
    </>
  );
};

export default Main;
