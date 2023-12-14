import { NetworkItem } from 'packages/types/types-ca/network';
import { BackEndNetWorkMap } from './backend-network';

export const NetworkList: NetworkItem[] = [
  BackEndNetWorkMap['back-end-testnet'],
  BackEndNetWorkMap['back-end-test1'],
  BackEndNetWorkMap['back-end-mainnet'],
];

export const DefaultChainId = 'AELF';

export const OfficialWebsite = 'https://portkey.finance';
export const BingoGame = 'http://192.168.66.240:3000';

export const ThirdParty = `https://openlogin-test.portkey.finance`;
