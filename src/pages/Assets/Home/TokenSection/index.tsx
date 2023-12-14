import React, { useCallback, useState, useEffect, useRef, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { View, FlatList } from 'react-native';
import { TokenItemShowType } from 'packages/types/types-ca/token';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import TokenListItem from 'components/TokenListItem';
import { REFRESH_TIME } from 'packages/constants/constants-ca/assets';
import { useCommonNetworkInfo } from 'components/TokenOverlay/hooks';
import AssetsContext, { AssetsContextType } from 'global/context/assets/AssetsContext';

export interface TokenSectionProps {
  getAccountBalance?: () => void;
}

const frontEndTokenSymbol = 'ELF';

export default function TokenSection() {
  const commonInfo = useCommonNetworkInfo();
  const [isFetching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { balanceList, updateBalanceList, allOfTokensList, updateTokensList, tokenPrices, updateTokenPrices } =
    useContext<AssetsContextType>(AssetsContext);

  const itemData: Array<TokenItemShowType> = useMemo(() => {
    return allOfTokensList
      .map<TokenItemShowType>(item => {
        const { symbol, decimals, chainId, address } = item.token;
        const balanceItem = balanceList.find(it => it.symbol === symbol && it.chainId === item.token.chainId);
        const price = tokenPrices.find(it => it.symbol === symbol);
        return {
          balance: balanceItem?.balance ?? '0',
          decimals,
          chainId,
          address,
          symbol,
          priceInUsd: price?.priceInUsd ?? 0,
          name: item.token.symbol,
          isDisplay: item.isDisplay,
          isDefault: item.isDefault,
          sortWeight: item.sortWeight,
        };
      })
      .filter(melted => melted.balance !== '0' || melted.isDefault)
      .sort((a, b) => {
        const { symbol: symbolA } = a;
        const { symbol: symbolB } = b;
        if (symbolA === symbolB) {
          return getWeightForTokenItems(b) - getWeightForTokenItems(a);
        } else {
          if (symbolA === frontEndTokenSymbol) return -1;
          if (symbolB === frontEndTokenSymbol) return 1;
          return symbolA.localeCompare(symbolB);
        }
      });
  }, [allOfTokensList, balanceList, tokenPrices]);

  // const onNavigate = useCallback((_: TokenItemShowType) => {
  //   // item's onclick function is not used by now
  // }, []);

  const renderItem = useCallback(
    ({ item }: { item: TokenItemShowType }) => {
      return <TokenListItem key={item.symbol} item={item} onPress={undefined} commonInfo={commonInfo} />;
    },
    [commonInfo],
  );

  const onRefresh = useCallback(async () => {
    try {
      await updateTokensList();
      await updateBalanceList();
      await updateTokenPrices();
    } catch (e) {
      console.warn('updateBalanceList or updateTokensList failed! ', e);
    }
  }, [updateBalanceList, updateTokenPrices, updateTokensList]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      onRefresh();
    }, REFRESH_TIME);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onRefresh, updateBalanceList, updateTokensList]);

  return (
    <View style={styles.tokenListPageWrap}>
      <FlatList
        refreshing={isFetching}
        data={itemData || []}
        renderItem={renderItem}
        keyExtractor={(item: TokenItemShowType) => item.symbol + item.chainId}
        onRefresh={onRefresh}
        // addToken not available by now
        // ListFooterComponent={
        //   <TouchableOpacity
        //     style={styles.addWrap}
        //     onPress={() => {
        //       navigationService.navigate('ManageTokenList');
        //     }}>
        //     <Svg icon="add-token" size={20} />
        //     <TextM style={styles.addTokenText}>{t('Add Tokens')}</TextM>
        //   </TouchableOpacity>
        // }
      />
    </View>
  );
}

// AELF > tDVW > tDVV > others
const getWeightForTokenItems = (item: TokenItemShowType): number => {
  if (item.chainId === 'AELF') {
    return 2;
  } else if (item.chainId === 'tDVW') {
    return 1;
  } else {
    return 0;
  }
};

const styles = StyleSheet.create({
  tokenListPageWrap: {
    flex: 1,
    backgroundColor: defaultColors.bg1,
  },
  addWrap: {
    shadowColor: 'red',
    marginTop: pTd(24),
    marginBottom: pTd(24),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTokenText: {
    marginLeft: pTd(8),
    color: defaultColors.font4,
  },
});
