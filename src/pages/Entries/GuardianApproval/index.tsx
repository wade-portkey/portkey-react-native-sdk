import { GuardianVerifyConfig, GuardianVerifyType } from 'model/verify/social-recovery';
import { PortkeyEntries } from '../../../config/entries';
import BaseContainer, { BaseContainerProps } from '../../../model/container/BaseContainer';
import GuardianApproval from 'pages/Guardian/GuardianApproval';
import React from 'react';
import { AfterVerifiedConfig } from 'model/verify/core';
import { SetPinPageProps, SetPinPageResult } from 'pages/Pin/SetPin';
import CommonToast from 'components/CommonToast';

export default class GuardianApprovalEntryPage extends BaseContainer<
  GuardianApprovalPageProps,
  GuardianApprovalPageState,
  GuardianApprovalPageResult
> {
  constructor(props: GuardianApprovalPageProps) {
    super(props);
    const { deliveredGuardianListInfo } = props;
    if (!deliveredGuardianListInfo) throw new Error('guardianConfig is null!');
    console.log('GuardianApprovalEntryPage', deliveredGuardianListInfo);
    const verifiedTime = new Date().getTime();
    this.state = {
      verifiedTime,
      config: JSON.parse(deliveredGuardianListInfo),
    };
  }

  getEntryName = (): string => PortkeyEntries.GUARDIAN_APPROVAL_ENTRY;

  onPageFinish = (result: GuardianApprovalPageResult) => {
    const { guardianVerifyType } = this.state.config;
    const { deliveredVerifiedData, isVerified } = result || {};
    if (guardianVerifyType === GuardianVerifyType.CREATE_WALLET) {
      if (!deliveredVerifiedData || !isVerified) {
        CommonToast.fail('verification failed, please try again.');
        return;
      } else {
        this.dealWithSetPin(deliveredVerifiedData);
      }
    } else {
      this.onFinish({
        status: isVerified ? 'success' : 'fail',
        data: result,
      });
    }
  };
  dealWithSetPin = (afterVerifiedData: AfterVerifiedConfig | string) => {
    this.navigateForResult<SetPinPageResult, SetPinPageProps>(
      PortkeyEntries.SET_PIN,
      {
        params: {
          deliveredSetPinInfo:
            typeof afterVerifiedData === 'string' ? afterVerifiedData : JSON.stringify(afterVerifiedData),
        },
      },
      res => {
        const { data } = res;
        if (data?.finished) {
          this.onFinish({
            status: 'success',
            data: {
              isVerified: true,
            },
          });
        }
      },
    );
  };
  render() {
    const { config: socialRecoveryConfig, verifiedTime } = this.state;
    return (
      <>
        <GuardianApproval
          guardianVerifyConfig={socialRecoveryConfig}
          verifiedTime={verifiedTime}
          onPageFinish={this.onPageFinish}
        />
      </>
    );
  }
}

export interface GuardianApprovalPageProps extends BaseContainerProps {
  deliveredGuardianListInfo: string; // GuardianVerifyConfig
}

export interface GuardianApprovalPageState {
  verifiedTime: number;
  config: GuardianVerifyConfig;
}

export interface GuardianApprovalPageResult {
  isVerified: boolean;
  deliveredVerifiedData?: string;
  errorMessage?: string;
}
