import { getContractBasic } from 'packages/contracts/utils';
import { ContractBasic } from 'packages/contracts/utils/ContractBasic';
import { timesDecimals } from 'packages/utils/converter';
import { handleVerificationDoc } from 'packages/utils/guardian';
import { PortkeyConfig } from 'global/constants';
import { getCachedNetworkConfig } from 'model/chain';
import { guardianTypeStrToEnum } from 'model/global';
import { getCurrentNetworkType } from 'model/hooks/network';
import { ITransferLimitItem } from 'model/security';
import { isWalletUnlocked } from 'model/verify/core';
import { GuardianConfig } from 'model/verify/guardian';
import { getUnlockedWallet } from 'model/wallet';
import { NetworkController } from 'network/controller';
import { AElfChainStatusItemDTO, AElfWeb3SDK, ApprovedGuardianInfo } from 'network/dto/wallet';
import { selectCurrentBackendConfig } from 'utils/commonUtil';
import { addManager } from 'utils/wallet';
import { handleCachedValue } from 'service/storage/cache';

export interface Verifier {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * get a basic contract instance, which can be used to call contract method.
 * @param allowTemplateWallet if true, a fake wallet will be used to create the contract instance, which can only be used on VIEW method.
 * @returns Contract Basic
 */
export const getContractInstance = async (allowTemplateWallet = false): Promise<ContractBasic> => {
  try {
    let privateKey = '';
    if (allowTemplateWallet && !(await isWalletUnlocked())) {
      privateKey = '6167c717e781099c8ee77cbf0c3f6e7c8315fc581eb7daa891c872c026359c84';
    } else {
      const { privateKey: pk } = (await getUnlockedWallet()) || {};
      privateKey = pk;
    }
    const { caContractAddress, peerUrl } = (await getCachedNetworkConfig()) || {};
    return await getContractBasic({
      contractAddress: caContractAddress,
      rpcUrl: peerUrl,
      account: AElfWeb3SDK.getWalletByPrivateKey(privateKey),
    });
  } catch (e: any) {
    console.error(e);
    throw e;
  }
};

/**
 * ```Manager``` is a wallet instance that you can create with ```AElfWeb3SDK.createNewWallet()```.
 *
 * there're three basic ways to add a ```Manager``` wallet to the CA holder info:
 * 1. the ```AddManager``` CA method
 * 2. the ```SocialRecovery``` CA method, known as ```Sign In```
 * 3. the ```Register``` CA method, known as ```Sign Up```
 *
 * after being added, the ```Manager``` info can be used to call any CA method below and control the ca holder info's tokens.
 */
export const callAddManagerMethod = async (extraData: string, managerAddress: string) => {
  if (!(await isWalletUnlocked())) throw new Error('wallet is not unlocked');
  const contractInstance = await getContractInstance();
  const { address } = (await getUnlockedWallet()) || {};
  const {
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await addManager({
    contract: contractInstance,
    address,
    caHash,
    managerAddress,
    extraData,
  });
};

/**
 * get the verifier data on the chain, which can be used to display ```Guardian```'s icon and name.
 */
export const getVerifierData = async (): Promise<{
  data?: {
    verifierServers: {
      [key: string | number]: Verifier;
    };
  };
}> => {
  return handleCachedValue({
    target: 'TEMP',
    getIdentifier: async () => {
      const chainId = await PortkeyConfig.currChainId();
      const endPoint = await PortkeyConfig.endPointUrl();
      return `GetVerifierServers_${chainId}_${endPoint}`;
    },
    getValueIfNonExist: async () => {
      const contractInstance = await getContractInstance(true);
      const result = await contractInstance.callViewMethod('GetVerifierServers', '');
      if (!result?.data) throw new Error('getOrReadCachedVerifierData: result is invalid');
      return result;
    },
  });
};

/**
 * add a ```Guardian``` to the CA holder info on target chain.
 * @param particularGuardian the ```Guardian``` info that is about to be added.
 * @param guardianList the ```Guardian``` list that has been approved.
 */
export const callAddGuardianMethod = async (
  particularGuardian: GuardianConfig,
  guardianList: Array<ApprovedGuardianInfo>,
) => {
  const contractInstance = await getContractInstance();
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callSendMethod('AddGuardian', address, {
    caHash,
    guardianToAdd: parseGuardianConfigInfoToCaType(particularGuardian),
    guardiansApproved: guardianList.map(item => parseVerifiedGuardianInfoToCaType(item)),
  });
};

/**
 * get the CA holder info on target chain.
 * @param caHash the CA holder info's identifier hash
 * @param caContractAddress the CA contract address on the target chain
 * @param peerUrl the target chain's peer url
 */
export const callGetHolderInfoMethod = async (caHash: string, caContractAddress: string, peerUrl: string) => {
  const { privateKey } = (await getUnlockedWallet()) || {};
  const contractInstance = await getContractBasic({
    contractAddress: caContractAddress,
    rpcUrl: peerUrl,
    account: AElfWeb3SDK.getWalletByPrivateKey(privateKey),
  });
  return await contractInstance.callViewMethod('GetHolderInfo', {
    caHash,
  });
};

/**
 * remove a ```Guardian``` from the CA holder info on target chain.
 * @param particularGuardian the ```Guardian``` info that is about to be removed.
 * @param guardianList the ```Guardian``` list that has been approved.
 */
export const callRemoveGuardianMethod = async (
  particularGuardian: GuardianConfig,
  guardianList: Array<ApprovedGuardianInfo>,
) => {
  const contractInstance = await getContractInstance();
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callSendMethod('RemoveGuardian', address, {
    caHash,
    guardianToRemove: parseGuardianConfigInfoToCaType(particularGuardian, true),
    guardiansApproved: guardianList.map(item => parseVerifiedGuardianInfoToCaType(item)),
  });
};

/**
 * update a ```Guardian``` from the CA holder info on target chain.
 * @param thisGuardian the ```Guardian``` info that is about to be updated.
 * @param pastGuardian the ```Guardian``` info that has been approved.
 * @param guardianList the ```Guardian``` list that has been approved. Warning: the ```pastGuardian``` should not be included in this list, while the ```thisGuardian``` should be included.
 */
export const callEditGuardianMethod = async (
  thisGuardian: GuardianConfig,
  pastGuardian: GuardianConfig,
  guardianList: Array<ApprovedGuardianInfo>,
) => {
  const contractInstance = await getContractInstance();
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callSendMethod('UpdateGuardian', address, {
    caHash,
    guardianToUpdatePre: parseGuardianConfigInfoToCaType(pastGuardian, true),
    guardianToUpdateNew: parseGuardianConfigInfoToCaType(thisGuardian, true),
    guardiansApproved: guardianList.map(item => parseVerifiedGuardianInfoToCaType(item)),
  });
};

/**
 * make a login ``` Guardian``` to be a normal ```Guardian```.
 * login ```Guardian``` is a special ```Guardian``` that can provide a trace to the target CA holder info
 * @see {@link attemptAccountCheck} for more details.
 */
export const callCancelLoginGuardianMethod = async (particularGuardian: GuardianConfig) => {
  const contractInstance = await getContractInstance();
  const { guardianIdentifier } = handleVerificationDoc(particularGuardian.verifiedDoc?.verificationDoc ?? '');
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return contractInstance.callSendMethod('UnsetGuardianForLogin', address, {
    caHash,
    guardian: {
      type: guardianTypeStrToEnum(particularGuardian.sendVerifyCodeParams.type),
      verifierId: particularGuardian.sendVerifyCodeParams.verifierId,
      identifierHash: guardianIdentifier,
    },
  });
};

/**
 * transfer limit is a security feature that can be used to limit the token transfer amount in a certain period.
 * @param chainId the target chain's chain id, like ```AELF```
 * @param symbol the token symbol, like ```ELF```
 */
export const callGetTransferLimitMethod = async (chainId: string, symbol: string) => {
  const contractInstance = await getContractInstanceOnParticularChain(chainId);
  const {
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callViewMethod('GetTransferLimit', {
    caHash,
    symbol,
  });
};

/**
 * update the transfer limit on target chain.
 * @param guardianList the ```Guardian``` list that has been approved.
 * @param transferLimitDetail the transfer limit detail that is about to be updated.
 */
export const callEditPaymentSecurityMethod = async (
  guardianList: Array<ApprovedGuardianInfo>,
  transferLimitDetail: ITransferLimitItem,
) => {
  const { chainId } = transferLimitDetail;
  const contractInstance = await getContractInstanceOnParticularChain(chainId);
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callSendMethod('SetTransferLimit', address, {
    caHash,
    symbol: transferLimitDetail.symbol,
    singleLimit: transferLimitDetail.singleLimit,
    dailyLimit: transferLimitDetail.dailyLimit,
    guardiansApproved: guardianList.map(item => parseVerifiedGuardianInfoToCaType(item)),
  });
};

/**
 * get the contract instance on target chain.
 * @param chainId the target chain's chain id, like ```AELF```
 */
const getContractInstanceOnParticularChain = async (chainId: string) => {
  const { privateKey } = (await getUnlockedWallet()) || {};
  const { caContractAddress, endPoint } = await findParticularNetworkByChainId(chainId);
  if (!caContractAddress || !endPoint)
    throw new Error('callGetTransferLimitMethod: caContractAddress or endPoint is invalid');
  return await getContractBasic({
    contractAddress: caContractAddress,
    rpcUrl: endPoint,
    account: AElfWeb3SDK.getWalletByPrivateKey(privateKey),
  });
};

const findParticularNetworkByChainId = async (chainId: string): Promise<AElfChainStatusItemDTO> => {
  const { items } = await NetworkController.getNetworkInfo();
  const item = items.find(it => it.chainId === chainId);
  if (!item) throw new Error('chainId is invalid');
  return item;
};

/**
 * Faucet contract can provide several tokens for test, it is only available on any test environment, not mainnet.
 * @param amount the token amount you want to get, default is 100
 */
export const callFaucetMethod = async (amount = 100) => {
  const contractInstance = await getContractInstance();
  if ((await getCurrentNetworkType()) === 'MAIN') {
    throw new Error('faucet is not supported on mainnet');
  }
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  const endPointUrl = await PortkeyConfig.endPointUrl();
  return await contractInstance.callSendMethod('ManagerForwardCall', address, {
    caHash: caHash,
    contractAddress: selectCurrentBackendConfig(endPointUrl).tokenClaimContractAddress,
    methodName: 'ClaimToken',
    args: {
      symbol: 'ELF',
      amount: timesDecimals(amount, 8).toString(),
    },
  });
};

/**
 * calling this method will destroy the current wallet info and remove the manager created before.
 *
 * hope you know what you are doing.
 */
export const callRemoveManagerMethod = async () => {
  const contractInstance = await getContractInstance();
  const {
    address,
    caInfo: { caHash },
  } = (await getUnlockedWallet()) || {};
  return await contractInstance.callSendMethod('RemoveManagerInfo', address, {
    caHash,
  });
};

const parseGuardianConfigInfoToCaType = (guardianConfig: GuardianConfig, withoutVerifyData = false) => {
  const { signature, verificationDoc } = guardianConfig.verifiedDoc || {};
  if (!withoutVerifyData && (!signature || !verificationDoc))
    throw new Error('parseGuardianConfigInfoToCaType:verify data is invalid! ' + JSON.stringify(guardianConfig));
  const identifierHash = withoutVerifyData
    ? guardianConfig.identifierHash
    : handleVerificationDoc(guardianConfig.verifiedDoc?.verificationDoc ?? '')?.guardianIdentifier;
  return {
    identifierHash,
    type: guardianTypeStrToEnum(guardianConfig.sendVerifyCodeParams.type),
    verificationInfo: withoutVerifyData
      ? {
          id: guardianConfig.sendVerifyCodeParams?.verifierId,
        }
      : {
          id: guardianConfig.sendVerifyCodeParams.verifierId,
          signature: Object.values(Buffer.from(signature as any, 'hex')),
          verificationDoc,
        },
  };
};

const parseVerifiedGuardianInfoToCaType = (guardianConfig: ApprovedGuardianInfo) => {
  const { guardianIdentifier } = handleVerificationDoc(guardianConfig?.verificationDoc ?? '');
  const { signature, verificationDoc } = guardianConfig || {};
  if (!signature || !verificationDoc)
    throw new Error('parseVerifiedGuardianInfoToCaType:verify data is invalid! ' + JSON.stringify(guardianConfig));
  return {
    identifierHash: guardianIdentifier,
    type: guardianConfig.type,
    verificationInfo: {
      id: guardianConfig.verifierId,
      signature: Object.values(Buffer.from(signature as any, 'hex')),
      verificationDoc,
    },
  };
};
