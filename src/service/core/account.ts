import { CallCaMethodProps } from 'service/JsModules/SubModules/WalletModule';
import { IPortkeyAccountService } from './base';
import {
  isWalletExists,
  isWalletUnlocked,
  lockWallet as lockInternalWallet,
  exitWallet as exitInternalWallet,
} from 'model/verify/core';
import { injectable } from 'inversify';
import { callRemoveManagerMethod, getContractInstance } from 'model/contract/handler';
import { getUnlockedWallet } from 'model/wallet';
import { SendResult, ViewResult } from 'packages/contracts/types';
import { BaseMethodResult } from 'service/JsModules/types';
import { AccountError, errorMap } from 'service/error';
import { WalletState } from './type';

@injectable()
export class PortkeyAccountService implements IPortkeyAccountService {
  async callCaContractMethod(props: CallCaMethodProps) {
    const { contractMethodName: methodName, params, isViewMethod } = props;
    if (!(await isWalletUnlocked())) {
      throw new AccountError(1001);
    }
    const contract = await getContractInstance();
    const { address } = await getUnlockedWallet();
    const isParamsEmpty = Object.values(params ?? {}).length === 0;
    try {
      const result: ViewResult | SendResult = isViewMethod
        ? await contract.callSendMethod(methodName, address, isParamsEmpty ? null : params)
        : await contract.callViewMethod(methodName, isParamsEmpty ? null : params);
      if (!result) throw new AccountError(1002);
      const { data, error } = result;
      let jsData: BaseMethodResult = {
        status: !error ? 'success' : 'fail',
        data,
        error,
      };
      if ((result as any).transactionId) {
        jsData = {
          ...jsData,
          transactionId: (result as any).transactionId,
        };
      }
      return jsData;
    } catch (e: any) {
      throw new AccountError(9999, e?.message || e);
    }
  }

  async getWalletInfo() {
    if (!(await isWalletUnlocked())) {
      throw new AccountError(1001);
    }
    const wallet = await getUnlockedWallet();
    return wallet;
  }

  async getWalletState() {
    const exist = await isWalletExists();
    const unlocked = await isWalletUnlocked();
    return exist ? (unlocked ? WalletState.UNLOCKED : WalletState.LOCKED) : WalletState.NONE;
  }

  async lockWallet() {
    if (!(await isWalletUnlocked())) {
      console.warn(errorMap.get(1001));
      return false;
    }
    await lockInternalWallet();
    return true;
  }

  async exitWallet() {
    if (!(await isWalletUnlocked())) {
      console.warn(errorMap.get(1001));
      return false;
    }
    try {
      const res = await callRemoveManagerMethod();
      if (!res.error) {
        exitInternalWallet();
      } else {
        console.warn(res.error);
        return false;
      }
      return true;
    } catch (e: any) {
      throw new AccountError(9999, e?.message || e);
    }
  }
}
