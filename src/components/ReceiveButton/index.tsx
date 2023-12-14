import React from 'react';
import Svg from 'components/Svg';
import { TouchableOpacity, View } from 'react-native';
import { dashBoardBtnStyle, innerPageStyles } from '../SendButton/style';
import { TextM } from 'components/CommonText';
import { useLanguage } from 'i18n/hooks';
import TokenOverlay from 'components/TokenOverlay';
import { TokenItemShowType } from 'packages/types/types-ca/token';
import { pTd } from 'utils/unit';
import GStyles from 'assets/theme/GStyles';
import { PortkeyEntries } from 'config/entries';
import useBaseContainer from 'model/container/UseBaseContainer';

interface SendButtonType {
  currentTokenInfo?: TokenItemShowType;
  themeType?: 'dashBoard' | 'innerPage';
  receiveButton?: any;
}

export default function ReceiveButton(props: SendButtonType) {
  const { themeType = 'dashBoard' } = props;
  const { t } = useLanguage();
  const { navigateTo } = useBaseContainer({
    entryName: PortkeyEntries.ASSETS_HOME_ENTRY,
  });
  const styles = themeType === 'dashBoard' ? dashBoardBtnStyle : innerPageStyles;

  return (
    <View style={styles.buttonWrap}>
      <TouchableOpacity
        style={[styles.iconWrapStyle, GStyles.alignCenter]}
        onPress={() => {
          if (themeType === 'innerPage') throw new Error('ReceiveButton: not supported');

          TokenOverlay.showTokenList({
            onFinishSelectToken: (tokenInfo: TokenItemShowType) => {
              navigateTo(PortkeyEntries.RECEIVE_TOKEN_ENTRY, { params: tokenInfo });
            },
          });
        }}>
        <Svg icon={themeType === 'dashBoard' ? 'receive' : 'receive1'} size={pTd(46)} />
      </TouchableOpacity>
      <TextM style={styles.titleStyle}>{t('Receive')}</TextM>
    </View>
  );
}
