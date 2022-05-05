import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import DesImageCard from 'src/shared/components/desImageCard';
import Stats from 'src/shared/components/stats';
import Subtitle from 'src/shared/components/subtitle';
import { PreviewFormData, TokenData } from 'src/shared/interfaces';
import Description from 'src/mod/components/description';
import PreviewForm from './components/previewForm';
import { getTokenData } from 'src/shared/utils/getTokenData';
import { DEFAULT_DATE, DEFAULT_PLAINTEXT } from './constants';

const Mod = () => {
  const { setTheme } = useThemeContext();
  const { isWalletInstalled, walletAddress, connectWallet } = useWalletContext();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme('black');
    const arr = DEFAULT_DATE.split('-');
    const year = arr[0];
    const month = arr[1].padStart(2, '0');
    const day = arr[2].padStart(2, '0');
    setTokenData(getTokenData({ year, month, day, plaintext: DEFAULT_PLAINTEXT }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectWallet = async () => {
    connectWallet();
  };

  const handleOnPreview = ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    setTokenData(getTokenData({ year, month, day, plaintext, ciphertext }));
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <header className="flex justify-between items-center flex-wrap">
        <div className="flex justify-start items-end">
          <h1 className="m-0">desImages</h1>
          <div className="tooltip tooltip-bottom ml-1" data-tip="go back to official!">
            <Link className="badge badge-outline font-normal no-underline" to="/">
              mod
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
            ciphertext: '0x00112233445566778899aabbccddeeff',
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
      {tokenData && (
        <div ref={scrollRef} className="w-2/3 mx-auto mt-4 mb-5">
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
