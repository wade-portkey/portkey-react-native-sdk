import { ChainType, NetworkType } from 'packages/types';
import useEffectOnce from 'hooks/useEffectOnce';
import { getCurrentNetworkType } from 'model/hooks/network';
import { useState } from 'react';

export function useDefaultChainType() {
  return 'aelf' as ChainType;
}
export function useCurrentNetworkInfo() {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('MAIN');
  useEffectOnce(async () => {
    setCurrentNetwork(await getCurrentNetworkType());
  });
  return currentNetwork;
}
