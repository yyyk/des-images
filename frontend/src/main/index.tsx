import { useRef, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { PreviewFormData, TokenData } from 'src/shared/interfaces';
import { defaultTokenData } from 'src/shared/constants';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import Description from 'src/main/components/description';
import Supplement from 'src/main/components/supplement';
import DesImageCard from 'src/shared/components/desImageCard';
import Subtitle from 'src/shared/components/subtitle';
import PreviewForm from 'src/shared/components/previewForm';

const Main = () => {
  const { setTheme } = useThemeContext();
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
      <div className="w-2/3 mt-0 mx-auto">
        <DesImageCard
          tokenData={{
            year: '2020',
            month: '1',
            day: '1',
            dateHex: '0x7e4101',
            ciphertext: '0x79030f7920aaa3cfbbd92afbb93e70ba',
          }}
        />
      </div>
      <div className="mt-6 sm:mt-10 mx-0 mb-0 px-3 sm:px-0 text-center">
        <Subtitle />
      </div>
      <div className="mt-6 sm:mt-10">
        <Description />
      </div>
      <div className="w-full sm:w-2/3 mt-5 sm:mt-7 mx-auto px-3 sm:px-0">
        <PreviewForm onSubmit={handleOnPreview} />
      </div>
      <div ref={scrollRef} className="w-2/3 mt-12 mx-auto">
        <DesImageCard tokenData={tokenData} />
      </div>
      <div className="mt-12 sm:mt-12 mb-0 sm:mb-5">
        <Supplement />
      </div>
    </>
  );
};

export default Main;
