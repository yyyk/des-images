import { useRef, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { useCatalogContext } from 'src/shared/contexts/catalog';
import { PreviewFormData } from 'src/shared/interfaces';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { getTokenData } from 'src/shared/utils/tokenDataHelpers';
import DesImageCard from 'src/shared/components/desImageCard';
import ModPreviewForm from 'src/shared/components/modPreviewForm';

const Catalog = () => {
  const { setTheme } = useThemeContext();
  const { tokenData, ownedTokenData, add, remove, minted, burned } = useCatalogContext();
  const { walletAddress } = useWalletContext();
  const [tabIndex, setTabIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const timeoutRef = useRef<any>(null);
  const scrollRef = useRef<HTMLLIElement>(null);

  useEffectOnce(() => {
    setTheme('lofi');
  });

  const handleOnPreview = async ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => {
    const tokenData = getTokenData({ year, month, day, plaintext, ciphertext });
    const result = await add(tokenData);
    if (!result) {
      setShowAlert(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      return;
    }
    setTimeout(() => {
      scrollRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    });
  };

  return (
    <>
      <div>
        <div className="tabs mb-6">
          <button className={`tab tab-bordered ${tabIndex === 0 ? 'tab-active' : ''}`} onClick={() => setTabIndex(0)}>
            Catalog
          </button>
          {!walletAddress ? (
            <div className="tooltip tooltip-top" data-tip="Please connect wallet">
              <button
                className={`tab tab-bordered ${tabIndex === 1 ? 'tab-active' : ''} disabled:pointer-events-none`}
                onClick={() => setTabIndex(1)}
                disabled={!walletAddress}
              >
                Collection
              </button>
            </div>
          ) : (
            <button className={`tab tab-bordered ${tabIndex === 1 ? 'tab-active' : ''}`} onClick={() => setTabIndex(1)}>
              Collection
            </button>
          )}
        </div>
        <div className="flex nowrap overflow-x-clip px-6 -mx-6">
          <div
            className={`grow shrink-0 basis-full w-full transition-transform duration-300 ${
              tabIndex === 0 ? '' : '-translate-x-full -ml-12'
            }`}
          >
            <div
              className={`transition-[height] delay-150 duration-100 ${
                tabIndex === 0 ? 'h-full' : 'h-0 overflow-hidden'
              }`}
            >
              <div className="pt-4 pb-11">
                <ModPreviewForm onSubmit={handleOnPreview} defaultPlaintext="i am still alive" showHint={true} />
              </div>
              <ul
                className={`list-none p-0 grid gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
                  tokenData.length
                } sm:grid-rows-${Math.ceil(tokenData.length / 2)} mt-0`}
              >
                {tokenData.map((data, index) => (
                  <li
                    ref={index === 0 ? scrollRef : undefined}
                    key={data.dateHex + (data.plaintext ?? '') + data.ciphertext}
                    className="w-full m-0 p-0"
                  >
                    <DesImageCard
                      tokenData={data}
                      showPlaintext={true}
                      showCiphertext={true}
                      onMint={(res) => res && minted(data)}
                      onBurn={(res) => res && burned(data)}
                      onRemove={() => remove(data)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className={`ml-12 grow shrink-0 basis-full w-full transition-transform duration-300 ${
              tabIndex === 1 ? '-translate-x-full' : ''
            }`}
          >
            <div
              className={`transition-[height] delay-150 duration-100 ${
                tabIndex === 1 ? 'h-full' : 'h-0 overflow-hidden'
              }`}
            >
              {ownedTokenData.length > 0 ? (
                <ul
                  className={`list-none px-0 pb-0 pt-4 grid gap-8 grid-cols-1 sm:grid-cols-2 grid-rows-${
                    tokenData.length
                  } sm:grid-rows-${Math.ceil(tokenData.length / 2)} mt-0`}
                >
                  {ownedTokenData.map((data) => (
                    <li key={data.dateHex + (data.plaintext ?? '') + data.ciphertext} className="w-full m-0 p-0">
                      <DesImageCard
                        tokenData={data}
                        showPlaintext={true}
                        onMint={(res) => res && minted(data)}
                        onBurn={(res) => res && burned(data)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4">You don't own any tokens.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className={`fixed bottom-0 right-1/2 translate-x-2/4 ${
          showAlert ? 'translate-y-0 mb-4' : 'translate-y-full mt-4'
        } w-1/2 z-10 transition-transform alert alert-warning shadow-lg`}
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Preview already exists.</span>
        </div>
      </div>
    </>
  );
};

export default Catalog;
