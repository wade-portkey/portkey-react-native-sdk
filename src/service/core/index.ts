import { myContainer } from './inversify.config';
import { IPortkeyAccountService, IPortkeyUIManagerService } from './base';
import { TYPES } from './type';
import { CallCaMethodProps } from 'service/JsModules/SubModules/WalletModule';
export * from './type';

class Portkey implements IPortkeyAccountService, IPortkeyUIManagerService {
  private _portkeyAccountService: IPortkeyAccountService;
  private _portkeyUIManagerService: IPortkeyUIManagerService;
  constructor() {
    this._portkeyAccountService = myContainer.get<IPortkeyAccountService>(TYPES.AccountModule);
    this._portkeyUIManagerService = myContainer.get<IPortkeyUIManagerService>(TYPES.UIManagerModule);
  }
  async login() {
    return this._portkeyUIManagerService.login();
  }
  async openAssetsDashboard() {
    this._portkeyUIManagerService.openAssetsDashboard();
  }
  async guardiansManager() {
    this._portkeyUIManagerService.guardiansManager();
  }
  async settingsManager() {
    this._portkeyUIManagerService.settingsManager();
  }
  async paymentSecurityManager() {
    this._portkeyUIManagerService.paymentSecurityManager();
  }
  async unlockWallet() {
    return this._portkeyUIManagerService.unlockWallet();
  }
  async callCaContractMethod(props: CallCaMethodProps) {
    return this._portkeyAccountService.callCaContractMethod(props);
  }
  async getWalletInfo() {
    return this._portkeyAccountService.getWalletInfo();
  }
  async getWalletState() {
    return this._portkeyAccountService.getWalletState();
  }
  async lockWallet() {
    return this._portkeyAccountService.lockWallet();
  }
  async exitWallet() {
    return this._portkeyAccountService.exitWallet();
  }
}
const portkey = new Portkey();
export { portkey };
