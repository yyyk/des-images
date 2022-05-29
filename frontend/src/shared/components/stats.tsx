import { useContractContext } from 'src/shared/contexts/contract';
import HeartIcon from 'src/shared/components/icons/heartIcon';
import UpIcon from 'src/shared/components/icons/upIcon';
import LightningIcon from 'src/shared/components/icons/lightningIcon';

const Stats = () => {
  const { totalEverMinted, totalSupply, mintPrice } = useContractContext();

  if (!totalEverMinted || !totalSupply || !mintPrice) {
    return null;
  }

  return (
    <div className="stats stats-vertical md:stats-horizontal shadow w-full">
      <div className="stat">
        <div className="stat-figure text-primary">
          <HeartIcon />
        </div>
        <div className="stat-title">Current Minted</div>
        <div className="stat-value">{totalEverMinted}</div>
      </div>
      <div className="stat">
        <div className="stat-figure text-primary">
          <UpIcon />
        </div>
        <div className="stat-title">Current Supply</div>
        <div className="stat-value">{totalSupply}</div>
      </div>
      <div className="stat">
        <div className="stat-figure text-secondary">
          <LightningIcon />
        </div>
        <div className="stat-title">Current Mint Price</div>
        <div className="stat-value">Ξ {mintPrice}</div>
      </div>
    </div>
  );
};

export default Stats;
