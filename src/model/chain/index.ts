import { PortkeyConfig } from 'global/constants';
import { NetworkController } from 'network/controller';
import { AElfChainStatusItemDTO } from 'network/dto/wallet';
import { handleCachedValue } from 'service/storage/cache';

const NETWORK_CONFIG_KEY = 'network_config_key';
export interface Token {
  address: string;
  decimals: string;
  imageUrl: string;
  name: string;
  symbol: string;
}
export const getCachedNetworkConfig = async (
  targetChainId?: string,
): Promise<{ peerUrl: string; caContractAddress: string; defaultToken: Token }> => {
  const chain = targetChainId || (await PortkeyConfig.currChainId());
  return await handleCachedValue({
    target: 'TEMP',
    getIdentifier: async () => {
      const portkeyEndPointUrl = await PortkeyConfig.endPointUrl();
      return `${NETWORK_CONFIG_KEY}#${portkeyEndPointUrl}#${chain}`;
    },
    getValueIfNonExist: async () => {
      const networkInfo = await NetworkController.getNetworkInfo();
      const chainInfo = networkInfo.items.find(it => it.chainId === chain);
      if (!chainInfo) throw new Error('network failure');
      const config = {
        peerUrl: chainInfo.endPoint,
        caContractAddress: chainInfo.caContractAddress,
        defaultToken: chainInfo.defaultToken,
      };
      return config;
    },
  });
};

export const getCachedAllChainInfo = async (): Promise<Array<AElfChainStatusItemDTO>> => {
  return await handleCachedValue({
    target: 'TEMP',
    getIdentifier: async () => {
      const portkeyEndPointUrl = await PortkeyConfig.endPointUrl();
      return `${NETWORK_CONFIG_KEY}#${portkeyEndPointUrl}`;
    },
    getValueIfNonExist: async () => {
      const networkInfo = await NetworkController.getNetworkInfo();
      const chainInfo = networkInfo.items;
      if (!chainInfo) throw new Error('network failure');
      return chainInfo;
    },
  });
};
