import { useEffect, useState } from 'react';
// import CoinbaseWalletSDK from '@coinbase/wallet-sdk';
import { ethers } from 'ethers';

// async function getAccount(needRequest = false): Promise<string> {
//   const eth = window.ethereum;
//   if (!eth) {
//     return '';
//   }
//   const accounts = (await eth.request({ method: needRequest ? 'eth_requestAccounts' : 'eth_accounts' })) as string[];
//   // console.log(accounts);
//   if (!accounts || accounts.length === 0) {
//     return '';
//   }
//   // console.log(accounts[0]);
//   return accounts[0];
// }

function handleChainChanged(_chainId: string) {
  console.log('chainChanged:', parseInt(_chainId));
  window.location.reload();
}

export const useWallet = () => {
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner | null>(null);

  useEffect(() => {
    setIsWalletInstalled(!!window.ethereum);
  }, []);

  useEffect(() => {
    if (!isWalletInstalled) {
      return;
    }
    connectWallet(false);
  }, [isWalletInstalled]);

  useEffect(() => {
    if (provider?.on) {
      provider.on('accountsChanged', handleAccountChange);
      provider.on('chainChanged', handleChainChanged);
      // provider.on('disconnect',);
      return () => {
        if (provider?.removeListener) {
          provider.removeListener('accountsChanged', handleAccountChange);
          provider.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [provider]);

  const handleAccountChange = (accounts: string[]) => {
    if (accounts && accounts.length > 0) {
      setWalletAddress(accounts[0]);
    } else {
      setWalletAddress('');
    }
  };

  const connectWallet = async (needRequest = true) => {
    // isCoinbaseWallet, isMetaMask
    const walletProvider = window.ethereum?.providers?.filter((x: ethers.providers.ExternalProvider) => x?.isMetaMask);
    if (walletProvider && walletProvider.length > 0) {
      const web3Provider = new ethers.providers.Web3Provider(walletProvider[0]);
      const _signer = web3Provider.getSigner();
      const _address = await web3Provider.send(needRequest ? 'eth_requestAccounts' : 'eth_accounts', []);
      if (_address && _address.length > 0) {
        setProvider(walletProvider[0]);
        setSigner(_signer);
        setWalletAddress(_address[0]);
      }
    }
  };

  return {
    isWalletInstalled,
    walletAddress,
    connectWallet,
    provider,
    signer,
  };
};
