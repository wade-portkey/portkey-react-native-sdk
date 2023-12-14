import { StyleSheet } from 'react-native';
import { defaultColors } from 'assets/theme';
import { pTd } from 'utils/unit';
import { screenWidth } from 'packages/utils/mobile/device';
import fonts from 'assets/theme/fonts';
import { getStatusBarHeight } from 'utils/screen';

const { bg5, font2 } = defaultColors;

export const styles = StyleSheet.create({
  cardWrap: {
    backgroundColor: bg5,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshWrap: {
    marginTop: pTd(8),
    width: screenWidth,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  block: {
    flex: 1,
  },
  svgWrap: {
    marginTop: -pTd(32),
    padding: pTd(16),
    paddingTop: pTd(40),
  },
  usdtBalance: {
    ...fonts.mediumFont,
    fontSize: pTd(30),
    lineHeight: pTd(34),
    color: font2,
  },
  accountName: {
    color: font2,
    opacity: 0.8,
    lineHeight: pTd(20),
  },
  buttonGroupWrap: {
    marginTop: pTd(24),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacerStyle: {
    width: pTd(32),
  },
  pagePaddingTop: {
    paddingTop: getStatusBarHeight(true),
  },
  header: {
    backgroundColor: bg5,
  },
});
