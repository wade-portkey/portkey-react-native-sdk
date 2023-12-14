export interface CallCaMethodProps {
  contractMethodName: string;
  isViewMethod: boolean;
  params?: { [key: string | symbol]: any };
  eventId: string;
}
export interface BaseMethodResult {
  status: 'success' | 'fail';
  transactionId?: string;
  data?: any;
  error?: any;
}
export type UnlockedWallet = {
  caInfo: {
    caHash: string;
    caAddress: string;
  };
  multiCaAddresses: {
    [key: string]: string;
  };
  name: string;
  originChainId: string;
} & {
  privateKey: string;
  publicKey: string;
  address: string;
};

declare const TYPES: {
  AccountModule: symbol;
  UIManagerModule: symbol;
};

export { TYPES };

export enum WalletState {
  NONE,
  LOCKED,
  UNLOCKED,
}
