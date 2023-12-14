import { UnlockedWallet, CallCaMethodProps, BaseMethodResult, WalletState } from './type';

export interface IPortkeyAccountService {
  callCaContractMethod(props: CallCaMethodProps): Promise<BaseMethodResult>;
  getWalletInfo(): Promise<UnlockedWallet>;
  getWalletState(): Promise<WalletState>;
  lockWallet(): Promise<boolean>;
  exitWallet(): Promise<boolean>;
}

export interface IPortkeyUIManagerService {
  login(): Promise<UnlockedWallet | null>;
  openAssetsDashboard(): Promise<void>;
  guardiansManager(): Promise<void>;
  settingsManager(): Promise<void>;
  paymentSecurityManager(): Promise<void>;
  unlockWallet(): Promise<UnlockedWallet | null>;
}
