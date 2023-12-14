import { AccountOriginalType } from '../core';
import { GuardianConfig } from '../guardian';
import { CheckVerifyCodeResultDTO } from 'network/dto/guardian';
import { ThirdPartyAccountInfo } from '../third-party-account';
import { ITransferLimitItem } from 'model/security';

export interface GuardianVerifyConfig {
  guardianVerifyType: GuardianVerifyType;
  accountIdentifier?: string;
  accountOriginalType?: AccountOriginalType;
  guardians: Array<GuardianConfig>;
  particularGuardian?: GuardianConfig;
  thirdPartyAccountInfo?: ThirdPartyAccountInfo;
  pastGuardian?: GuardianConfig;
  failHandler?: () => void;
  paymentSecurityConfig?: ITransferLimitItem;
}

export enum GuardianVerifyType {
  CREATE_WALLET = 'CREATE_WALLET',
  ADD_GUARDIAN = 'ADD_GUARDIAN',
  MODIFY_GUARDIAN = 'MODIFY_GUARDIAN',
  REMOVE_GUARDIAN = 'REMOVE_GUARDIAN',
  CHANGE_LOGIN_GUARDIAN = 'CHANGE_LOGIN_GUARDIAN',
  EDIT_PAYMENT_SECURITY = 'EDIT_PAYMENT_SECURITY',
}

export type VerifiedGuardianInfo = CheckVerifyCodeResultDTO;
