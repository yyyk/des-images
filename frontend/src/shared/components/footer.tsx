import { CONTRACT_ADDRESS, ETH_NETWORK } from 'src/shared/constants';
import { CHAIN_NAME } from 'src/shared/interfaces';

const Footer = () => {
  const etherscanUrl =
    !ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST
      ? '#'
      : `https://${
          ETH_NETWORK === CHAIN_NAME.RINKEBY ? `${CHAIN_NAME.RINKEBY}.` : ''
        }etherscan.io/address/${CONTRACT_ADDRESS}`;

  return (
    <footer className="prose w-full mx-auto mt-0 mb-4 pb-0">
      <ul className="list-none p-0 m-0 flex justify-center">
        <li className="my-0 mx-3 p-0 tooltip tooltip-top" data-tip="coming soon!">
          discord
        </li>
        <li className="my-0 mx-3 p-0">
          <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">
            etherscan
          </a>
        </li>
        <li className="my-0 mx-3 p-0">
          <a href="https://github.com/yyyk/des-images" target="_blank" rel="noopener noreferrer">
            github
          </a>
        </li>
        <li className="my-0 mx-3 p-0">
          <a href="https://twitter.com/_y_y_y_k_" target="_blank" rel="noopener noreferrer">
            twitter
          </a>
        </li>
      </ul>
      {/* <p className="mx-auto my-2 text-center">
        <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">
          @{CONTRACT_ADDRESS}
        </a>
      </p> */}
    </footer>
  );
};

export default Footer;
