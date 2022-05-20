import { useRef, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { DEFAULT_DATE } from 'src/shared/constants';
import { DEFAULT_PLAINTEXT } from 'src/mod/constants';
import { PreviewFormData, TokenData } from 'src/shared/interfaces';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import { destructDateInputValue } from 'src/shared/utils/destructDateInputValue';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import DesImageCard from 'src/shared/components/desImageCard';
import Stats from 'src/shared/components/stats';
import Subtitle from 'src/shared/components/subtitle';
import Description from 'src/mod/components/description';
import ModPreviewForm from 'src/shared/components/modPreviewForm';

const Mod = () => {
  const { setTheme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffectOnce(() => {
    setTheme('black');
    setTokenData(getTokenData({ ...destructDateInputValue(DEFAULT_DATE), plaintext: DEFAULT_PLAINTEXT }));
  });

  const handleOnPreview = ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    setTokenData(getTokenData({ year, month, day, plaintext, ciphertext }));
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <div className="w-2/3 mt-0 mx-auto">
        <DesImageCard
          tokenData={{
            day: '1',
            month: '1',
            year: '2020',
            dateHex: '0x7e4101',
            ciphertext: '0x00112233445566778899aabbccddeeff',
          }}
        />
      </div>
      <div className="mt-6 sm:mt-10 mb-0 mx-0 px-3 sm:px-0 text-center">
        <Subtitle />
      </div>
      {walletAddress && (
        <div className="mt-6 grow flex flex-col flex-nowrap justify-end px-3 sm:px-0">
          <Stats />
        </div>
      )}
      <div className="mt-6 sm:mt-10">
        <Description />
      </div>
      <div className="w-full mt-6 sm:mt-7 mx-auto px-3 sm:px-0">
        <ModPreviewForm onSubmit={handleOnPreview} defaultPlaintext="i slept a lot..." />
      </div>
      {tokenData && (
        <div ref={scrollRef} className="w-2/3 mt-11 sm:mt-4 sm:mb-5 mx-auto">
          <DesImageCard tokenData={tokenData} />
        </div>
      )}
      {/* prettier-ignore */}
      {/* <div className="mockup-code">
        <pre data-prefix="$" className="m-0 py-0 overflow-x-visible"><code>node</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>const crypto = require('crypto')</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>const algorithm = 'des-ecb'</code></pre> 
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>const key = Buffer.from('20200101', 'latin1')</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>const ciphertext = '79030f7920aaa3cfbbd92afbb93e70ba'</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>const decipher = crypto.createDecipheriv(algorithm, key, null)</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>decipher.setAutoPadding(false)</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>let plaintext = decipher.update(ciphertext, 'hex', 'latin1')</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>plaintext += decipher.final('latin1')</code></pre>
        <pre data-prefix=">" className="m-0 py-0 overflow-x-visible"><code>plaintext</code></pre>
        <pre data-prefix="" className="m-0 py-0 overflow-x-visible text-success"><code>'i am still alive'</code></pre>
      </div> */}
      {/* prettier */}
    </>
  );
};

export default Mod;
