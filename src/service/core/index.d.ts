import { IPortkeyAccountService, IPortkeyUIManagerService } from './base';
export * from './type';
import { UnlockedWallet, CallCaMethodProps, BaseMethodResult, WalletState } from './type';
declare class Portkey implements IPortkeyAccountService, IPortkeyUIManagerService {
  private _portkeyAccountService;
  private _portkeyUIManagerService;
  constructor();
  login(): Promise<UnlockedWallet | null>;
  openAssetsDashboard(): Promise<void>;
  guardiansManager(): Promise<void>;
  settingsManager(): Promise<void>;
  paymentSecurityManager(): Promise<void>;
  unlockWallet(): Promise<UnlockedWallet | null>;
  callCaContractMethod(props: CallCaMethodProps): Promise<BaseMethodResult>;
  getWalletInfo(): Promise<UnlockedWallet>;
  getWalletState(): Promise<WalletState>;
  lockWallet(): Promise<boolean>;
  exitWallet(): Promise<boolean>;
}
declare const portkey: Portkey;
export { portkey };
