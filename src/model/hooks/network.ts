import { BackEndNetWorkMap } from 'packages/constants/constants-ca/backend-network';
import { NetworkType } from 'packages/types';
import { PortkeyConfig } from 'global/constants';
import useEffectOnce from 'hooks/useEffectOnce';
import { useState } from 'react';

export const getCurrentNetworkType = async (): Promise<NetworkType> => {
  const endPointUrl = await PortkeyConfig.endPointUrl();
  switch (endPointUrl) {
    case BackEndNetWorkMap['back-end-test1'].apiUrl: {
      return 'TEST1';
    }

    case BackEndNetWorkMap['back-end-mainnet'].apiUrl: {
      return 'MAIN';
    }

    case BackEndNetWorkMap['back-end-testnet'].apiUrl:
    default: {
      return 'TESTNET';
    }
  }
};

export const useCurrentNetworkType = () => {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkType>('MAIN');
  useEffectOnce(async () => {
    setCurrentNetwork(await getCurrentNetworkType());
  });
  return currentNetwork;
};
