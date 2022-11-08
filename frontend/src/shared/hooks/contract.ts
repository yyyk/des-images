import { useEffect, useRef, useState } from 'react';
import { BigNumber, Contract, ethers } from 'ethers';
import DesImages from 'src/abi/DesImages.json';
import { CONTRACT_ADDRESS, DEFAULT_CONTRACT_STATE, NULL_ADDRESS } from 'src/shared/constants';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import {
  getTotalEverMinted,
  getTotalSupply,
  getCurrentPrice,
  getCurrentBurnReward,
  isPaused as _isPaused,
} from 'src/shared/services/contract';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import {
  getOwnerOf,
  getTokenDataFromLocalStorage,
  getTokenId,
  getTokenStatus,
  isSameTokenData,
  updateTokenDataStatus,
  writeTokenDataToLocalStorage,
} from 'src/shared/utils/tokenDataHelpers';
import { calcBurnReward, calcMintPrice, isSameAddress } from 'src/shared/utils/contractHelpers';

const useContract = (signer: ethers.providers.JsonRpcSigner | null) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [contractState, setContractState] = useState(DEFAULT_CONTRACT_STATE);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const tokenDataRef = useRef<TokenData[]>([]);

  const _updateTokenData = (data: TokenData[], writeToStorage = true) => {
    tokenDataRef.current = [...data];
    setTokenData([...tokenDataRef.current]);
    writeToStorage && writeTokenDataToLocalStorage(data);
  };

  // -------------------- Contract --------------------
  const _eventHandler = (type: string, startBlockNumber: number, walletAddress: string) => {
    switch (type) {
      case 'Transfer':
        return async (from: string, to: string, tokenId: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Transferred');
          const _tokenId = tokenId.toHexString();
          const index = tokenDataRef.current.findIndex(
            (_data) => _tokenId.toLowerCase() === getTokenId(_data.dateHex, _data.ciphertext).toLowerCase(),
          );
          if (index < 0) {
            return;
          }
          _updateTokenData([
            ...tokenDataRef.current.slice(0, index),
            {
              ...tokenDataRef.current[index],
              isOwner: isSameAddress(to, walletAddress),
              status: to === NULL_ADDRESS ? TOKEN_STATUS.BURNED : TOKEN_STATUS.MINTED,
              tokenId: _tokenId,
              isInProcess: false,
            },
            ...tokenDataRef.current.slice(index + 1),
          ]);
        };
      case 'Minted':
        return (
          _to: string,
          _tokenId: BigNumber,
          _mintPrice: BigNumber,
          totalSupply: BigNumber,
          totalEverMinted: BigNumber,
          event: any,
        ) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Minted');
          setContractState((prev) => ({
            ...prev,
            totalSupply: totalSupply.toString(),
            totalEverMinted: totalEverMinted.toString(),
            mintPrice: calcMintPrice(totalSupply),
            burnPrice: calcBurnReward(totalSupply),
          }));
        };
      case 'Burned':
        return (_from: string, _tokenId: BigNumber, _burnReward: BigNumber, totalSupply: BigNumber, event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Burned');
          setContractState((prev) => ({
            ...prev,
            totalSupply: totalSupply.toString(),
            mintPrice: calcMintPrice(totalSupply),
            burnPrice: calcBurnReward(totalSupply),
          }));
        };
      case 'Paused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('Paused');
          setContractState((prev) => ({
            ...prev,
            isPaused: true,
          }));
        };
      case 'UnPaused':
        return (event: any) => {
          if (event?.blockNumber <= startBlockNumber) {
            return;
          }
          console.log('UnPaused');
          setContractState((prev) => ({
            ...prev,
            isPaused: false,
          }));
        };
      default:
        return () => {};
    }
  };

  // Setup Contract Event Listeners
  const _setupContractListeners = (contract: Contract, walletAddress: string, currentBlockNumber: number) => {
    contract.on(contract.filters.Transfer(), _eventHandler('Transfer', currentBlockNumber, walletAddress));
    contract.on(contract.filters.Minted(), _eventHandler('Minted', currentBlockNumber, walletAddress));
    contract.on(contract.filters.Burned(), _eventHandler('Burned', currentBlockNumber, walletAddress));
  };

  // Setup Contract
  useEffect(() => {
    if (!signer) {
      setContractState({ ...DEFAULT_CONTRACT_STATE });
      setContract(null);
      setWalletAddress('');
      return;
    }
    const newContract = new ethers.Contract(CONTRACT_ADDRESS, DesImages.abi, signer);
    newContract && setupContract(newContract, signer);

    async function setupContract(contract: Contract, signer: ethers.providers.JsonRpcSigner) {
      try {
        setContractState({
          isPaused: await _isPaused(contract),
          totalSupply: await getTotalSupply(contract),
          totalEverMinted: await getTotalEverMinted(contract),
          mintPrice: await getCurrentPrice(contract),
          burnPrice: await getCurrentBurnReward(contract),
        });
        const signerAddress = await signer.getAddress();
        const currentBlockNumber = await contract.provider?.getBlockNumber();
        _setupContractListeners(contract, signerAddress, currentBlockNumber);
        setContract(contract);
        setWalletAddress(signerAddress);
      } catch (err) {
        // console.error(err);
      }
    }

    return () => {
      newContract.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  // -------------------- TokenData --------------------
  const _resetTokenData = () => {
    tokenDataRef.current = tokenDataRef.current.map((d) => ({
      year: d.year,
      month: d.month,
      day: d.day,
      dateHex: d.dateHex,
      ciphertext: d.ciphertext,
      plaintext: d.plaintext,
    }));
    setTokenData([...tokenDataRef.current]);
  };

  const _updateTokenDataStatus = async (
    contract: Contract | null,
    data: TokenData[],
    walletAddress: string,
    writeToStorage = true,
  ) => {
    const newData = await updateTokenDataStatus(contract, data, walletAddress);
    const res: TokenData[] = [];
    tokenDataRef.current.forEach((_data: TokenData) => {
      const index = newData.findIndex((d: TokenData) => isSameTokenData(d, _data));
      index >= 0 && res.push({ ...newData[index] });
    });
    _updateTokenData(res, writeToStorage);
  };

  // Read tokenData from local storage.
  useEffectOnce(() => {
    tokenDataRef.current = getTokenDataFromLocalStorage();
    setTokenData([...tokenDataRef.current]);
  });

  // When the contract or wallet address is changed, tokenData statuses are updated.
  // Also, when local storage is updated in another tab, it updates all the tabs.
  useEffect(() => {
    if (!walletAddress || !contract) {
      _resetTokenData();
    } else {
      tokenDataRef.current?.length && _updateTokenDataStatus(contract, [...tokenDataRef.current], walletAddress);
    }
    window.addEventListener('storage', storageListener);

    function storageListener() {
      const data = getTokenDataFromLocalStorage();
      contract && walletAddress
        ? _updateTokenDataStatus(contract, [...data], walletAddress, false)
        : _updateTokenData([...data], false);
    }

    return () => {
      window.removeEventListener('storage', storageListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, walletAddress]);

  const addTokenData = async (data: TokenData): Promise<boolean> => {
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      return false;
    }
    const status = !contract ? undefined : await getTokenStatus(contract, data);
    const ownerAddress = await getOwnerOf(contract, data);
    const isOwner = ownerAddress.length === 0 ? false : isSameAddress(ownerAddress, walletAddress);
    const tokenId = isOwner ? getTokenId(data.dateHex, data.ciphertext) : '';
    _updateTokenData([{ ...data, isOwner, status, tokenId }, ...tokenDataRef.current]);
    return true;
  };

  const removeTokenData = (data: TokenData) => {
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      _updateTokenData([...tokenDataRef.current.slice(0, index), ...tokenDataRef.current.slice(index + 1)]);
    }
  };

  const updateTokenData = (data: TokenData) => {
    const index = tokenDataRef.current.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      _updateTokenData([
        ...tokenDataRef.current.slice(0, index),
        { ...data },
        ...tokenDataRef.current.slice(index + 1),
      ]);
    }
  };

  return { contract, contractState, tokenData, addTokenData, removeTokenData, updateTokenData };
};

export default useContract;
