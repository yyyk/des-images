import { CONTRACT_ADDRESS, ETH_NETWORK } from 'src/shared/constants';
import { CHAIN_NAME } from 'src/shared/interfaces';
import ExternalLink from 'src/shared/components/externalLink';

const Footer = () => {
  const etherscanUrl =
    !ETH_NETWORK || ETH_NETWORK === CHAIN_NAME.LOCALHOST
      ? '#'
      : `https://${
          ETH_NETWORK === CHAIN_NAME.RINKEBY ? `${CHAIN_NAME.RINKEBY}.` : ''
        }etherscan.io/address/${CONTRACT_ADDRESS}`;

  return (
    <footer className="w-full mx-auto mt-0 mb-4 p-0">
      <ul className="list-none p-0 m-0 flex justify-center">
        <li className="my-0 mx-3 p-0">
          <ExternalLink href="https://opensea.io/collection/desimages">opensea</ExternalLink>
        </li>
        <li className="my-0 mx-3 p-0">
          <ExternalLink href={etherscanUrl}>etherscan</ExternalLink>
        </li>
        <li className="my-0 mx-3 p-0">
          <ExternalLink href="https://github.com/yyyk/des-images">github</ExternalLink>
        </li>
        <li className="my-0 mx-3 p-0">
          <ExternalLink href="https://twitter.com/_y_y_y_k_">twitter</ExternalLink>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
