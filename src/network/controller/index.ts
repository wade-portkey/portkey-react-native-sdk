import { PortkeyConfig } from 'global/constants';
import { AccountIdentifierStatusDTO, RegisterStatusDTO } from 'network/dto/signIn';
import { NetworkOptions, ResultWrapper, TypedUrlParams, nativeFetch } from 'service/native-modules';
import { APIPaths } from 'network/path';
import { ChainId } from 'packages/types';
import {
  CheckVerifyCodeParams,
  CheckVerifyCodeResultDTO,
  GetGuardianInfoResultDTO,
  GetRecommendedGuardianResultDTO,
  RecaptchaPlatformType,
  SendVerifyCodeHeader,
  SendVerifyCodeParams,
  SendVerifyCodeResultDTO,
  VerifyAppleGuardianParams,
  VerifyGoogleGuardianParams,
} from 'network/dto/guardian';
import { OperationTypeEnum } from 'packages/types/verifier';
import { CountryCodeDataDTO } from 'types/wallet';
import {
  AElfChainStatusDTO,
  CheckRegisterOrRecoveryProcessParams,
  RecoveryProgressDTO,
  RegisterProgressDTO,
  RequestRegisterOrSocialRecoveryResultDTO,
  RequestRegisterParams,
  RequestSocialRecoveryParams,
} from 'network/dto/wallet';
import { sleep } from 'packages/utils';
import { getCachedNetworkToken } from 'network/token';
import { isWalletUnlocked } from 'model/verify/core';
import { SymbolImages } from 'model/symbolImage';
import {
  FetchTokenPriceResult,
  SearchTokenListParams,
  GetUserTokenListResult,
  FetchBalanceConfig,
  FetchBalanceResult,
  FetchAccountNftCollectionListParams,
  FetchAccountNftCollectionListResult,
  FetchAccountNftCollectionItemListParams,
  FetchAccountNftCollectionItemListResult,
} from 'network/dto/query';
import { selectCurrentBackendConfig } from 'utils/commonUtil';
import { CheckPaymentSecurityRuleParams, CheckPaymentSecurityRuleResult } from 'network/dto/security';

const DEFAULT_MAX_POLLING_TIMES = 50;

const {
  CHECK_REGISTER_STATUS,
  CHECK_SOCIAL_RECOVERY_STATUS,
  GET_GUARDIAN_INFO,
  GET_REGISTER_INFO,
  GET_RECOMMEND_GUARDIAN,
  REFRESH_NETWORK_TOKEN,
  GET_SYMBOL_IMAGE,
} = APIPaths;

const NETWORK_TOKEN_BLACKLIST = [
  CHECK_REGISTER_STATUS,
  CHECK_SOCIAL_RECOVERY_STATUS,
  GET_GUARDIAN_INFO,
  GET_REGISTER_INFO,
  GET_RECOMMEND_GUARDIAN,
  REFRESH_NETWORK_TOKEN,
  GET_SYMBOL_IMAGE,
];

export class NetworkControllerEntity {
  private realExecute = async <T>(
    url: string,
    method: 'GET' | 'POST',
    params?: any,
    headers?: any,
    extraOptions?: NetworkOptions,
  ): Promise<ResultWrapper<T>> => {
    if (method === 'GET' && params) {
      url += '?';
      Object.entries(params).forEach(([key, value]) => {
        url = url + `&${key}=${encodeURIComponent((value ?? 'null') as string)}`;
      });
    }
    headers = Object.assign({}, headers ?? {}, { Version: 'v1.4.8' });
    if ((await isWalletUnlocked()) && !this.isUrlInBlackList(url)) {
      const access_token = await getCachedNetworkToken();
      headers = Object.assign({}, headers, { Authorization: `Bearer ${access_token}` });
    }

    const result = nativeFetch<T>(url, method, params, headers, extraOptions);
    return result;
  };

  private isUrlInBlackList = (url: string): boolean => {
    return NETWORK_TOKEN_BLACKLIST.some(path => url.includes(path));
  };

  getRegisterResult = async (accountIdentifier: string): Promise<ResultWrapper<RegisterStatusDTO>> => {
    return await this.realExecute<RegisterStatusDTO>(await this.parseUrl(APIPaths.GET_REGISTER_INFO), 'GET', {
      loginGuardianIdentifier: accountIdentifier,
    });
  };
  getSymbolImage = async (): Promise<ResultWrapper<SymbolImages>> => {
    return await this.realExecute<SymbolImages>(await this.parseUrl(APIPaths.GET_SYMBOL_IMAGE), 'GET', {});
  };

  getAccountIdentifierResult = async (
    chainId: ChainId | string,
    accountIdentifier: string,
  ): Promise<AccountIdentifierStatusDTO> => {
    const res = await this.realExecute<AccountIdentifierStatusDTO>(
      await this.parseUrl(APIPaths.GET_GUARDIAN_INFO),
      'GET',
      {
        chainId,
        guardianIdentifier: accountIdentifier,
        loginGuardianIdentifier: accountIdentifier,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  isGoogleRecaptchaOpen = async (operationType: OperationTypeEnum): Promise<boolean> => {
    const res = await this.realExecute<boolean>(await this.parseUrl(APIPaths.CHECK_GOOGLE_RECAPTCHA), 'POST', {
      operationType,
    });
    return res?.result ?? false;
  };

  getRecommendedGuardian = async (chainId?: string): Promise<GetRecommendedGuardianResultDTO> => {
    const res = await this.realExecute<GetRecommendedGuardianResultDTO>(
      await this.parseUrl(APIPaths.GET_RECOMMEND_GUARDIAN),
      'POST',
      { chainId: chainId ?? (await PortkeyConfig.currChainId()) },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  getGuardianInfo = async (
    loginGuardianIdentifier?: string,
    caHash?: string,
    chainId?: string,
  ): Promise<GetGuardianInfoResultDTO> => {
    const cachedChainId = chainId ?? (await PortkeyConfig.currChainId());
    let params = {
      chainId: cachedChainId,
    };
    caHash && (params = Object.assign(params, { caHash }));
    loginGuardianIdentifier &&
      (params = Object.assign(params, { loginGuardianIdentifier, guardianIdentifier: loginGuardianIdentifier }));
    const res = await this.realExecute<GetGuardianInfoResultDTO>(
      await this.parseUrl(APIPaths.GET_GUARDIAN_INFO),
      'GET',
      params,
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  getNetworkInfo = async (): Promise<AElfChainStatusDTO> => {
    const res = await this.realExecute<AElfChainStatusDTO>(await this.parseUrl(APIPaths.CHECK_CHAIN_STATUS), 'GET');
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  checkQrCodeStatus = async (id: string): Promise<boolean> => {
    const res = await this.realExecute<boolean>(await this.parseUrl(APIPaths.CHECK_QR_CODE_STATUS), 'POST', {
      id,
    });
    return res?.result ?? false;
  };

  sendVerifyCode = async (
    params: SendVerifyCodeParams,
    headers?: SendVerifyCodeHeader | TypedUrlParams,
  ): Promise<SendVerifyCodeResultDTO> => {
    const res = await this.realExecute<SendVerifyCodeResultDTO>(
      await this.parseUrl(APIPaths.SEND_VERIFICATION_CODE),
      'POST',
      Object.assign(params, { platformType: getPlatformType() }),
      headers,
      {
        maxWaitingTime: 10000,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  checkVerifyCode = async (params: CheckVerifyCodeParams): Promise<CheckVerifyCodeResultDTO> => {
    const res = await this.realExecute<CheckVerifyCodeResultDTO>(
      await this.parseUrl(APIPaths.CHECK_VERIFICATION_CODE),
      'POST',
      params,
    );
    if (!res) throw new Error('network failure');
    const { result, errMessage } = res;
    return Object.assign(
      {},
      result ?? {
        verificationDoc: '',
        signature: '',
      },
      {
        failedBecauseOfTooManyRequests: errMessage?.includes('Too Many Retries'),
      } as Partial<CheckVerifyCodeResultDTO>,
    );
  };

  verifyGoogleGuardianInfo = async (params: VerifyGoogleGuardianParams): Promise<CheckVerifyCodeResultDTO> => {
    const res = await this.realExecute<CheckVerifyCodeResultDTO>(
      await this.parseUrl(APIPaths.VERIFY_GOOGLE_TOKEN),
      'POST',
      params,
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  verifyAppleGuardianInfo = async (params: VerifyAppleGuardianParams): Promise<CheckVerifyCodeResultDTO> => {
    const res = await this.realExecute<CheckVerifyCodeResultDTO>(
      await this.parseUrl(APIPaths.VERIFY_APPLE_TOKEN),
      'POST',
      params,
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  requestRegister = async (params: RequestRegisterParams): Promise<RequestRegisterOrSocialRecoveryResultDTO> => {
    const res = await this.realExecute<RequestRegisterOrSocialRecoveryResultDTO>(
      await this.parseUrl(APIPaths.REQUEST_REGISTER),
      'POST',
      params,
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  requestSocialRecovery = async (
    params: RequestSocialRecoveryParams,
  ): Promise<RequestRegisterOrSocialRecoveryResultDTO> => {
    const res = await this.realExecute<RequestRegisterOrSocialRecoveryResultDTO>(
      await this.parseUrl(APIPaths.REQUEST_RECOVERY),
      'POST',
      params,
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  checkRegisterProcess = async (
    sessionId: string,
    options?: NetworkOptions,
  ): Promise<RegisterProgressDTO | null | undefined> => {
    const res = await this.realExecute<RegisterProgressDTO>(
      await this.parseUrl(APIPaths.CHECK_REGISTER_STATUS),
      'GET',
      { filter: `_id:${sessionId}` } as CheckRegisterOrRecoveryProcessParams,
      {},
      options,
    );
    return res.result;
  };

  checkSocialRecoveryProcess = async (
    sessionId: string,
    options?: NetworkOptions,
  ): Promise<RecoveryProgressDTO | null | undefined> => {
    const res = await this.realExecute<RecoveryProgressDTO>(
      await this.parseUrl(APIPaths.CHECK_SOCIAL_RECOVERY_STATUS),
      'GET',
      { filter: `_id:${sessionId}` } as CheckRegisterOrRecoveryProcessParams,
      {},
      options,
    );
    return res.result;
  };

  searchTokenList = async (config?: SearchTokenListParams): Promise<GetUserTokenListResult> => {
    const { chainIdArray = ['AELF', 'tDVV', 'tDVW'], keyword = '' } = config || {};
    const chainIdSearchLanguage = chainIdArray.map(chainId => `token.chainId:${chainId}`).join(' OR ');

    const filterKeywords =
      keyword.length < 10 ? `token.symbol: *${keyword.toUpperCase().trim()}*` : `token.address:${keyword}`;

    const res = await this.realExecute<GetUserTokenListResult>(await this.parseUrl(APIPaths.GET_TOKEN_INFO), 'GET', {
      filter: `${filterKeywords} AND (${chainIdSearchLanguage})`,
      sort: 'sortWeight desc,isDisplay  desc,token.symbol  acs,token.chainId acs',
      skipCount: 0,
      maxResultCount: 1000,
    });
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  fetchUserTokenBalance = async (config: FetchBalanceConfig): Promise<FetchBalanceResult> => {
    const { caAddressInfos, skipCount = 0, maxResultCount = 100 } = config;
    const res = await this.realExecute<FetchBalanceResult>(
      await this.parseUrl(APIPaths.GET_USER_TOKEN_STATUS),
      'POST',
      {
        caAddresses: caAddressInfos.map(({ caAddress }) => caAddress),
        skipCount,
        maxResultCount,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  // at current version, only ELF tokens have price
  checkELFTokenPrice = async (): Promise<FetchTokenPriceResult | null | undefined> => {
    const res = await this.realExecute<FetchTokenPriceResult>(await this.parseUrl(APIPaths.GET_TOKEN_PRICES), 'GET', {
      symbols: ['ELF'],
    });
    return res.result;
  };

  refreshNetworkToken = async (
    params: CustomNetworkTokenConfig,
  ): Promise<{ access_token: string; expires_in: number }> => {
    const endPointUrl = await PortkeyConfig.endPointUrl();
    const getAuthUrl = () => {
      const url = selectCurrentBackendConfig(endPointUrl).connectUrl;
      return `${url}${APIPaths.REFRESH_NETWORK_TOKEN}`;
    };
    const res = await this.realExecute<{ access_token: string; expires_in: number }>(
      getAuthUrl(),
      'POST',
      Object.assign({}, params, {
        grant_type: 'signature',
        client_id: 'CAServer_App',
        scope: 'CAServer',
      }),
      { 'Content-Type': 'application/x-www-form-urlencoded' },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  getCountryCodeInfo = async (): Promise<CountryCodeDataDTO> => {
    const res = await this.realExecute<CountryCodeDataDTO>(await this.parseUrl(APIPaths.GET_PHONE_COUNTRY_CODE), 'GET');
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  fetchNetCollections = async (config: FetchAccountNftCollectionListParams) => {
    const { caAddressInfos, skipCount = 0, maxResultCount = 100 } = config;
    const res = await this.realExecute<FetchAccountNftCollectionListResult>(
      await this.parseUrl(APIPaths.FETCH_NFT_COLLECTIONS),
      'POST',
      {
        caAddressInfos,
        skipCount,
        maxResultCount,
        width: 16,
        height: 16,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  fetchParticularNftItemList = async (config: FetchAccountNftCollectionItemListParams) => {
    const { caAddressInfos, skipCount = 0, maxResultCount = 100, symbol } = config;
    const res = await this.realExecute<FetchAccountNftCollectionItemListResult>(
      await this.parseUrl(APIPaths.FETCH_NFT_COLLECTIONS_ITEM),
      'POST',
      {
        caAddressInfos,
        skipCount,
        symbol,
        maxResultCount,
        width: 16,
        height: 16,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  fetchTransferLimitRule = async (config: CheckPaymentSecurityRuleParams) => {
    const { caHash, skipCount = 0, maxResultCount = 100 } = config;
    const res = await this.realExecute<CheckPaymentSecurityRuleResult>(
      await this.parseUrl(APIPaths.CHECK_TRANSFER_LIMIT),
      'GET',
      {
        caHash,
        skipCount,
        maxResultCount,
      },
    );
    if (!res?.result) throw new Error('network failure');
    return res.result;
  };

  parseUrl = async (url: string) => {
    return `${await PortkeyConfig.endPointUrl()}${url}`;
  };
}

const getPlatformType = (): RecaptchaPlatformType => {
  return RecaptchaPlatformType.JS;
  //   const platformName = portkeyModulesEntity.NativeWrapperModule.platformName;
  //   switch (platformName) {
  //     case 'android':
  //       return RecaptchaPlatformType.ANDROID;
  //     case 'ios':
  //       return RecaptchaPlatformType.IOS;
  //     default:
  //       return RecaptchaPlatformType.JS;
  //   }
};

export const NetworkController = new NetworkControllerEntity();

export const handleRequestPolling = async <T>(config: RequestPollingConfig<T>): Promise<T> => {
  const {
    sendRequest,
    maxPollingTimes = DEFAULT_MAX_POLLING_TIMES,
    timeGap = 1000,
    verifyResult = () => true,
    declareFatalFail = () => false,
  } = config;
  let pollingTimes = 0;
  let result: T | null | undefined = null;
  while (pollingTimes < maxPollingTimes) {
    try {
      result = await sendRequest();
    } catch (ignored) {
      console.error(ignored);
    }
    if (result && verifyResult(result)) {
      break;
    } else if (result && declareFatalFail(result)) {
      throw new Error('fatal error in handleRequestPolling()');
    }
    pollingTimes++;
    await sleep(timeGap);
  }
  if (!result) throw new Error('network failure');
  return result;
};

export type RequestPollingConfig<T> = {
  sendRequest: () => Promise<T | null | undefined>;
  maxPollingTimes?: number;
  timeGap?: number;
  verifyResult?: (result: T) => boolean;
  declareFatalFail?: (result: T) => boolean;
};

export type CustomNetworkTokenConfig = {
  signature: string;
  pubkey: string;
  timestamp: number | string;
  ca_hash: string;
  chain_id: ChainId;
};
