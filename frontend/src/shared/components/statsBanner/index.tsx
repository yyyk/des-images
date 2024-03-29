import { CSSProperties, useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { useContractContext } from 'src/shared/contexts/contract';

const Stats = ({
  totalEverMinted,
  totalSupply,
  mintPrice,
  burnPrice,
}: {
  totalEverMinted: string;
  totalSupply: string;
  mintPrice: string;
  burnPrice: string;
}) => {
  const today = new Date();
  return (
    <span className="flex flex-nowrap">
      <span className="px-4">{`${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today
        .getDate()
        .toString()
        .padStart(2, '0')}`}</span>
      <span className="px-4">Current Minted: {totalEverMinted}</span>
      <span className="px-4">Current Supply: {totalSupply}</span>
      <span className="px-4">Current Mint Price: Ξ {mintPrice}</span>
      {totalSupply !== '0' && <span className="px-4">Current Burn Reward: Ξ {burnPrice}</span>}
    </span>
  );
};

const StatsBanner = () => {
  const {
    contractState: { totalEverMinted, totalSupply, mintPrice, burnPrice },
  } = useContractContext();
  const [width, setWidth] = useState(0);
  const [amount, setAmount] = useState(1);
  const [duration, setDuration] = useState('1');
  const el = useRef<HTMLSpanElement>(null);
  const marqueeContainerClasses = 'flex flex-nowrap whitespace-nowrap';

  const setup = () => {
    const elWidth = el?.current?.getBoundingClientRect()?.width ?? 1;
    const n = window.innerWidth / elWidth;
    const nCeiled = Math.ceil(n);
    const newWidth = elWidth * nCeiled;
    setDuration((newWidth / 30).toFixed(2));
    setWidth(newWidth);
    setAmount(nCeiled);
  };

  useEffectOnce(() => {
    window.addEventListener('resize', setup);
    return () => {
      window.removeEventListener('resize', setup);
    };
  });

  useEffect(() => {
    setup();
  }, [totalEverMinted, totalSupply, mintPrice, burnPrice]);

  return (
    <div className="sticky top-0 z-50 w-full flex flex-nowrap overflow-hidden bg-primary text-primary-content py-0.5 px-0 rounded-bl-[56px]">
      {[0, 1].map((x) => (
        <div
          key={`container--${x}`}
          className={marqueeContainerClasses}
          style={
            {
              '--from-position': '0px',
              '--to-position': `-${width}px`,
              animation: `marquee ${duration}s linear infinite`,
            } as CSSProperties
          }
        >
          {Array.from({ length: amount }, (_, i) => i).map((y) => (
            <span ref={x === 0 && y === 0 ? el : undefined} key={`child--${x}-${y}`}>
              {!totalEverMinted || !totalSupply || !mintPrice || !burnPrice ? (
                <span className="px-4">Loading...</span>
              ) : (
                <Stats
                  totalEverMinted={totalEverMinted}
                  totalSupply={totalSupply}
                  mintPrice={mintPrice}
                  burnPrice={burnPrice}
                />
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default StatsBanner;
