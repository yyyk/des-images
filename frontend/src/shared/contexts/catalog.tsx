import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useContractContext } from 'src/shared/contexts/contract';
import { TokenData, TOKEN_STATUS } from 'src/shared/interfaces';
import {
  getOwnerOf,
  getTokenDataFromLocalStorage,
  getTokenDataFromTokenIds,
  getTokenId,
  getTokenStatus,
  isSameTokenData,
  updateTokenDataStatus,
  writeTokenDataToLocalStorage,
} from 'src/shared/utils/tokenDataHelpers';
import { useEffectOnce } from 'src/shared/utils/hookHelpers';
import { Contract } from 'ethers';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { isSameAddress } from 'src/shared/utils/contractHelpers';

interface ContextState {
  tokenData: TokenData[];
  ownedTokenData: TokenData[];
  add: (data: TokenData) => Promise<boolean>;
  remove: (data: TokenData) => void;
  minted: (data: TokenData) => void;
  burned: (data: TokenData) => void;
}

const CatalogContext = createContext({} as ContextState);

const CatalogContextProvider = ({ children }: { children: ReactNode }) => {
  const { walletAddress } = useWalletContext();
  const { contract, ownedTokenIds } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);

  const _updateTokenData = (data: TokenData[]) => {
    setTokenData(data);
    writeTokenDataToLocalStorage(data);
  };

  const _updateTokenDataStatus = async (contract: Contract | null, data: TokenData[], walletAddress: string) => {
    _updateTokenData(await updateTokenDataStatus(contract, data, walletAddress));
  };

  const _fetchOwnedTokenData = async (contract: Contract | null, ownedTokenIds: string[]) => {
    if (!contract || !ownedTokenIds || ownedTokenIds.length === 0) {
      setOwnedTokenData([]);
      return;
    }
    const ids = ownedTokenIds?.reverse();
    setOwnedTokenData(await getTokenDataFromTokenIds(contract, ids));
  };

  useEffectOnce(() => {
    setTokenData(getTokenDataFromLocalStorage());
  });

  useEffect(() => {
    tokenData && tokenData.length > 0 && _updateTokenDataStatus(contract, tokenData, walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    _fetchOwnedTokenData(contract, ownedTokenIds);
  }, [contract, ownedTokenIds]);

  const add = async (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    console.log('add', index);
    if (index >= 0) {
      return false;
    }
    const status = !contract ? undefined : await getTokenStatus(contract, data);
    const ownerAddress = await getOwnerOf(contract, data);
    const isOwner = ownerAddress.length === 0 ? false : isSameAddress(ownerAddress, walletAddress);
    const tokenId = isOwner ? getTokenId(data.dateHex, data.ciphertext) : '';
    _updateTokenData([{ ...data, isOwner, status, tokenId }, ...tokenData]);
    return true;
  };

  const remove = (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
    if (index >= 0) {
      _updateTokenData([...tokenData.slice(0, index), ...tokenData.slice(index + 1)]);
    }
  };

  const minted = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    setOwnedTokenData([{ ...newData }, ...ownedTokenData.filter((_data) => !isSameTokenData(_data, newData))]);
  };

  const burned = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
    };
    _updateTokenData(tokenData.filter((_data) => !isSameTokenData(_data, newData)));
    setOwnedTokenData(ownedTokenData.filter((_data) => !isSameTokenData(_data, newData)));
  };

  return (
    <CatalogContext.Provider value={{ tokenData, ownedTokenData, add, remove, minted, burned }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContextProvider;
