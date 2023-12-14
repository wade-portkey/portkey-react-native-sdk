import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import OverlayModal from 'components/OverlayModal';
import { FlatList, StyleSheet } from 'react-native';
import { ModalBody } from 'components/ModalBody';
import CommonInput from 'components/CommonInput';
import { TokenItemShowType } from 'packages/types/types-eoa/token';
import { AccountType } from 'packages/types/wallet';
import TokenListItem from 'components/TokenListItem';
import { defaultColors } from 'assets/theme';
import fonts from 'assets/theme/fonts';
import { pTd } from 'utils/unit';
import { useLanguage } from 'i18n/hooks';
import useDebounce from 'hooks/useDebounce';
import NoData from 'components/NoData';
import { useGStyles } from 'assets/theme/useGStyles';
import myEvents from '../../utils/deviceEvent';
import { getCachedAllChainInfo } from 'model/chain';
import { useCommonNetworkInfo } from './hooks';
import { NetworkController } from 'network/controller';
import { IUserTokenItem } from 'network/dto/query';
import Loading from 'components/Loading';
import { UnlockedWallet, getUnlockedWallet } from 'model/wallet';
import useEffectOnce from 'hooks/useEffectOnce';

type onFinishSelectTokenType = (tokenItem: TokenItemShowType) => void;
type TokenListProps = {
  account?: AccountType;
  onFinishSelectToken?: onFinishSelectTokenType;
};

const TokenList = ({ onFinishSelectToken }: TokenListProps) => {
  const { t } = useLanguage();
  const commonInfo = useCommonNetworkInfo();
  const chainIdList = useRef<string[] | undefined>(undefined);
  const [tokenDataShowInMarket, setTokenDataShowInMarket] = useState<IUserTokenItem[]>();
  const gStyles = useGStyles;
  const [wallet, setWallet] = useState<UnlockedWallet | null>(null);

  useEffectOnce(async () => {
    setWallet(await getUnlockedWallet({ getMultiCaAddresses: true }));
  });

  const [keyword, setKeyword] = useState('');

  const debounceKeyword = useDebounce(keyword, 800);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <TokenListItem
        noBalanceShow
        key={`${item.symbol}${item.chainId}`}
        item={item}
        onPress={async () => {
          if (!wallet) {
            throw new Error('wallet is not ready');
          }
          const { multiCaAddresses } = wallet;
          OverlayModal.hide();
          console.log('select token', item);
          const { chainId } = item.token;
          const caAddress = multiCaAddresses[chainId];
          item.currentNetwork = commonInfo.currentNetwork;
          item.currentCaAddress = caAddress;
          item.defaultToken = commonInfo.defaultToken;
          onFinishSelectToken?.(item);
        }}
        commonInfo={commonInfo}
      />
    ),
    [commonInfo, wallet, onFinishSelectToken],
  );

  useEffect(() => {
    Loading.show();
    async function fetchData() {
      if (chainIdList.current === undefined) {
        const chainInfo = await getCachedAllChainInfo();
        chainIdList.current = chainInfo.map(chainInfoItem => {
          return chainInfoItem.chainId;
        });
      }
      const tokenAssets = await NetworkController.searchTokenList({
        chainIdArray: chainIdList.current ?? 'AELF',
        keyword: debounceKeyword,
      });
      return tokenAssets?.items;
    }
    fetchData()
      .then(result => {
        result && setTokenDataShowInMarket(result);
      })
      .finally(() => {
        Loading.hide();
      });
  }, [debounceKeyword]);

  const noData = useMemo(() => {
    return debounceKeyword ? <NoData noPic message={t('There is no search result.')} /> : null;
  }, [debounceKeyword, t]);

  return (
    <ModalBody modalBodyType="bottom" title={t('Select Token')} style={gStyles.overlayStyle}>
      <CommonInput
        placeholder={t('Token Name')}
        containerStyle={styles.containerStyle}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={styles.inputStyle}
        value={keyword}
        onChangeText={v => {
          setKeyword(v.trim());
        }}
      />
      <FlatList
        onLayout={e => {
          myEvents.nestScrollViewLayout.emit(e.nativeEvent.layout);
        }}
        disableScrollViewPanResponder={true}
        style={styles.flatList}
        onScroll={({ nativeEvent }) => {
          const {
            contentOffset: { y: scrollY },
          } = nativeEvent;
          if (scrollY <= 0) {
            myEvents.nestScrollViewScrolledTop.emit();
          }
        }}
        data={tokenDataShowInMarket || []}
        renderItem={renderItem}
        ListEmptyComponent={noData}
        keyExtractor={(item: any) => item.id || ''}
      />
    </ModalBody>
  );
};

export const showTokenList = (props: TokenListProps) => {
  OverlayModal.show(<TokenList {...props} />, {
    position: 'bottom',
    enabledNestScrollView: true,
  });
};

export default {
  showTokenList,
};

export const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: defaultColors.font5,
    height: pTd(22),
    lineHeight: pTd(22),
    marginTop: pTd(17),
    marginBottom: pTd(16),
    ...fonts.mediumFont,
  },
  containerStyle: {
    marginLeft: pTd(16),
    width: pTd(343),
    marginBottom: pTd(8),
  },
  inputContainerStyle: {
    height: pTd(44),
  },
  inputStyle: {
    height: pTd(44),
  },
  flatList: {
    marginTop: pTd(8),
  },
});
