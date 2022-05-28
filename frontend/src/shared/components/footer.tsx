import { CONTRACT_ADDRESS, ETH_NETWORK } from 'src/shared/constants';
import { ChainName } from 'src/shared/interfaces';

const Footer = () => {
  const etherscanUrl =
    ETH_NETWORK === ChainName.LOCALHOST
      ? '#'
      : `https://${
          ETH_NETWORK === ChainName.RINKEBY ? `${ChainName.RINKEBY}.` : ''
        }etherscan.io/address/${CONTRACT_ADDRESS}`;

  return (
    <footer className="prose w-full mx-auto pb-0">
      <ul className="list-none p-0 m-0 flex justify-center">
        <li className="my-0 p-0 tooltip tooltip-top" data-tip="coming soon!">
          discord
        </li>
        <li className="my-0 mx-6 p-0">
          <a href="https://twitter.com/_y_y_y_k_" target="_blank" rel="noopener noreferrer">
            twitter
          </a>
        </li>
        <li className="my-0 p-0">
          <a href="https://github.com/yyyk/des-images" target="_blank" rel="noopener noreferrer">
            github
          </a>
        </li>
      </ul>
      <p className="mx-auto my-2 text-center">
        <a href={etherscanUrl} target="_blank" rel="noopener noreferrer">
          @{CONTRACT_ADDRESS}
        </a>
      </p>
    </footer>
  );
};

export default Footer;
