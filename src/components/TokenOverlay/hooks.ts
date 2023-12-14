import { DEFAULT_TOKEN } from 'packages/constants/constants-ca/wallet';
import { NetworkType } from 'packages/types';
import useEffectOnce from 'hooks/useEffectOnce';
import { Token, getCachedNetworkConfig } from 'model/chain';
import { getCurrentNetworkType } from 'model/hooks/network';
import { getTempWalletConfig } from 'model/verify/core';
import { NetworkController } from 'network/controller';
import { useState } from 'react';

export function useSymbolImages() {
  const [symbolImages, setSymbolImages] = useState<Record<string, string>>({});
  useEffectOnce(() => {
    NetworkController.getSymbolImage().then(result => {
      setSymbolImages(result.result?.symbolImages || {});
    });
  });
  return symbolImages;
}

export function useCommonNetworkInfo() {
  const symbolImages = useSymbolImages();
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('MAIN');
  const [defaultToken, setDefaultToken] = useState<Token>(DEFAULT_TOKEN);
  const [currentCaAddress, setCurrentCaAddress] = useState<string>();
  useEffectOnce(async () => {
    const n = await getCurrentNetworkType();
    setCurrentNetwork(n);
    const { defaultToken: cachedDefaultToken } = await getCachedNetworkConfig();
    setDefaultToken(cachedDefaultToken);
    const wallet = await getTempWalletConfig();
    setCurrentCaAddress(wallet.caInfo?.caAddress ?? '');
  });
  return {
    symbolImages,
    currentNetwork,
    defaultToken,
    currentCaAddress,
  };
}
export interface CommonInfo {
  symbolImages: Record<string, string>;
  currentNetwork: NetworkType;
  defaultToken: Token;
}
