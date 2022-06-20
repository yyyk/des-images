import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
  isUserTokensLoading: boolean;
  add: (data: TokenData) => Promise<boolean>;
  remove: (data: TokenData) => void;
  minted: (data: TokenData) => void;
  burned: (data: TokenData) => void;
  processStarted: (data: TokenData) => void;
  processEnded: (data: TokenData) => void;
}

const CatalogContext = createContext({} as ContextState);

const CatalogContextProvider = ({ children }: { children: ReactNode }) => {
  const { walletAddress, walletProvider, logout } = useWalletContext();
  const { contract, ownedTokenIds } = useContractContext();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [ownedTokenData, setOwnedTokenData] = useState<TokenData[]>([]);
  const [isUserTokensLoading, setIsUserTokensLoading] = useState(false);
  const ownedTokenIdsRef = useRef<TokenData[]>([]);

  const _updateTokenData = (data: TokenData[]) => {
    setTokenData(data);
    writeTokenDataToLocalStorage(data);
  };

  const _updateTokenDataStatus = async (contract: Contract | null, data: TokenData[], walletAddress: string) => {
    _updateTokenData(await updateTokenDataStatus(contract, data, walletAddress));
  };

  const _fetchOwnedTokenData = async (contract: Contract | null, ownedTokenIds: string[]) => {
    if (!contract || !ownedTokenIds || ownedTokenIds.length === 0) {
      ownedTokenIdsRef.current = [];
      setOwnedTokenData([]);
      return;
    }
    setIsUserTokensLoading(true);
    const _ownedTokenData = (await getTokenDataFromTokenIds(contract, ownedTokenIds)).map((data) => {
      const index = ownedTokenIdsRef.current.findIndex((_data) => isSameTokenData(_data, data));
      return { ...data, isInProcess: index >= 0 && ownedTokenIdsRef.current[index].isInProcess };
    });
    ownedTokenIdsRef.current = [..._ownedTokenData];
    setOwnedTokenData(_ownedTokenData);
    setIsUserTokensLoading(false);
  };

  useEffectOnce(() => {
    setTokenData(getTokenDataFromLocalStorage());
  });

  useEffect(() => {
    tokenData && tokenData?.length && _updateTokenDataStatus(contract, tokenData, walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    _fetchOwnedTokenData(contract, ownedTokenIds);
  }, [contract, ownedTokenIds]);

  useEffect(() => {
    if (!walletProvider || !tokenData?.length) {
      return;
    }
    async function beforeunloadListener() {
      if (walletProvider && tokenData.some((data) => data.isInProcess)) {
        await logout(walletProvider);
      }
    }
    window.addEventListener('beforeunload', beforeunloadListener);
    return () => {
      window.removeEventListener('beforeunload', beforeunloadListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletProvider, tokenData]);

  const add = async (data: TokenData) => {
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, data));
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

  const _process = (data: TokenData, isInProcess: boolean) => {
    const newData: TokenData = {
      ...data,
      isInProcess,
    };
    let index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    index = ownedTokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      ownedTokenIdsRef.current = [
        ...ownedTokenData.slice(0, index),
        { ...newData },
        ...ownedTokenData.slice(index + 1),
      ];
      setOwnedTokenData([...ownedTokenIdsRef.current]);
    }
  };

  const minted = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: true,
      status: TOKEN_STATUS.MINTED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    ownedTokenIdsRef.current = [{ ...newData }, ...ownedTokenData.filter((_data) => !isSameTokenData(_data, newData))];
    setOwnedTokenData([...ownedTokenIdsRef.current]);
  };

  const burned = (data: TokenData) => {
    const newData: TokenData = {
      ...data,
      isOwner: false,
      status: TOKEN_STATUS.BURNED,
      tokenId: data.tokenId || getTokenId(data.dateHex, data.ciphertext),
      isInProcess: false,
    };
    const index = tokenData.findIndex((_data) => isSameTokenData(_data, newData));
    if (index >= 0) {
      _updateTokenData([...tokenData.slice(0, index), { ...newData }, ...tokenData.slice(index + 1)]);
    }
    ownedTokenIdsRef.current = ownedTokenData.filter((_data) => !isSameTokenData(_data, newData));
    setOwnedTokenData([...ownedTokenIdsRef.current]);
  };

  return (
    <CatalogContext.Provider
      value={{
        tokenData,
        ownedTokenData,
        isUserTokensLoading,
        add,
        remove,
        minted,
        burned,
        processStarted: (data: TokenData) => _process(data, true),
        processEnded: (data: TokenData) => _process(data, false),
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalogContext = () => useContext(CatalogContext);

export default CatalogContextProvider;
