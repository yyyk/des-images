import { useEffect, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import CatalogTab from 'src/catalog/components/catalog';
import CollectionTab from 'src/catalog/components/collection';

const Catalog = () => {
  const { setTheme } = useThemeContext();
  const { walletAddress } = useWalletContext();
  const [tabIndex, setTabIndex] = useState(0);

  useEffectOnce(() => {
    setTheme('lofi');
  });

  useEffect(() => {
    if (!walletAddress) {
      setTabIndex(0);
    }
  }, [walletAddress]);

  return (
    <div>
      <div className="tabs m-0">
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
      <div className="flex nowrap overflow-x-hidden -mb-16 -mx-6 pt-4 sm:pt-6 pb-16 px-6">
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
            <CatalogTab />
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
            <CollectionTab />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
