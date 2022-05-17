import { useRef, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { PreviewFormData, TokenData } from 'src/shared/interfaces';
import { defaultTokenData } from 'src/shared/constants';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import Stats from 'src/shared/components/stats';
import Description from 'src/main/components/description';
import Supplement from 'src/main/components/supplement';
import DesImageCard from 'src/shared/components/desImageCard';
import Subtitle from 'src/shared/components/subtitle';
import PreviewForm from 'src/shared/components/previewForm';

const Main = () => {
  const { setTheme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const [tokenData, setTokenData] = useState<TokenData>(defaultTokenData);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffectOnce(() => {
    setTheme('lofi');
  });

  const handleOnPreview = ({ year, month, day }: PreviewFormData) => {
    setTokenData(getTokenData({ year, month, day }));
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <div className="w-2/3 mx-auto mt-0">
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
      <div className="w-2/3 mx-auto mt-7">
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
