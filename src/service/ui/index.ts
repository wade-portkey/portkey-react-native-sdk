import { injectable, inject } from 'inversify';
import { PortkeyEntries } from 'config/entries';
import { LaunchMode, LaunchModeSet } from 'global/init/entries';
import { LoginResult } from 'model/verify/entry';
import { UnlockedWallet } from 'model/wallet';
import { CheckPinResult } from 'pages/Pin/CheckPin';
import { IPortkeyAccountService, IPortkeyUIManagerService } from 'service/core/base';
import { EntryResult, PortkeyModulesEntity } from 'service/native-modules';
import { TYPES, WalletState } from 'service/core/type';
import { AccountError } from 'service/error';
import { wrapEntry } from 'utils/commonUtil';

@injectable()
export class UIManagerService implements IPortkeyUIManagerService {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @inject(TYPES.AccountModule) private _accountService: IPortkeyAccountService;
  login(): Promise<UnlockedWallet | null> {
    return new Promise((resolve, reject) => {
      this.openResultFromExternal<LoginResult>(PortkeyEntries.SIGN_IN_ENTRY, res => {
        if (res) {
          resolve(res?.data?.walletInfo ?? null);
        } else {
          reject(new AccountError(1004));
        }
      });
    });
  }
  async openAssetsDashboard() {
    if (!(await this.checkIsUnlocked())) {
      throw new AccountError(1001);
    }
    this.openFromExternal(PortkeyEntries.ASSETS_HOME_ENTRY);
  }
  async guardiansManager() {
    if (!(await this.checkIsUnlocked())) {
      throw new AccountError(1001);
    }
    this.openFromExternal(PortkeyEntries.GUARDIAN_HOME_ENTRY);
  }
  async settingsManager() {
    if (!(await this.checkIsUnlocked())) {
      throw new AccountError(1001);
    }
    this.openFromExternal(PortkeyEntries.ACCOUNT_SETTING_ENTRY);
  }
  async paymentSecurityManager() {
    if (!(await this.checkIsUnlocked())) {
      throw new AccountError(1001);
    }
    this.openFromExternal(PortkeyEntries.PAYMENT_SECURITY_HOME_ENTRY);
  }
  unlockWallet(): Promise<UnlockedWallet | null> {
    return new Promise((resolve, reject) => {
      this.openResultFromExternal<CheckPinResult>(PortkeyEntries.CHECK_PIN, res => {
        if (res) {
          resolve(res.data?.walletInfo ?? null);
        } else {
          reject(new AccountError(1003));
        }
      });
    });
  }

  private async checkIsUnlocked() {
    const wallState = await this._accountService.getWalletState();
    return wallState === WalletState.UNLOCKED;
  }
  private openFromExternal(target: PortkeyEntries) {
    PortkeyModulesEntity.RouterModule.navigateTo(
      wrapEntry(target),
      LaunchModeSet.get(target) || LaunchMode.STANDARD,
      'external',
      'none',
      false,
      {} as any,
    );
  }
  private openResultFromExternal<R>(target: PortkeyEntries, callback: (res: EntryResult<R>) => void) {
    PortkeyModulesEntity.RouterModule.navigateToWithOptions(
      wrapEntry(target),
      LaunchModeSet.get(target) || LaunchMode.STANDARD,
      'external',
      {} as any,
      callback,
    );
  }
}
