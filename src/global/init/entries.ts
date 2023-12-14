import TestPage from 'components/TestPage';
import GuardianApprovalEntryPage from 'pages/Entries/GuardianApproval';
import SignInEntryPage from 'pages/Entries/SignIn';
import SelectCountryPage from 'pages/Entries/SelectCountry';
import SignUpEntryPage from 'pages/Entries/SignUp';
import VerifierDetailsEntryPage from 'pages/Entries/VerifierDetails';
import { PortkeyEntries } from 'config/entries';
import ViewOnWebView from 'pages/Activity/ViewOnWebView';
import AccountSettings from 'pages/My/AccountSettings';
import ScanLogin from 'pages/Login/ScanLogin';
import CheckPin from 'pages/Pin/CheckPin';
import ConfirmPin from 'pages/Pin/ConfirmPin';
import SetBiometrics from 'pages/Pin/SetBiometrics';
import SetPin from 'pages/Pin/SetPin';
import QrScanner from 'pages/QrScanner';
import GuardianHome from 'pages/GuardianManage/GuardianHome';
import { AppRegistry, ComponentProvider } from 'react-native';
import Biometric from 'pages/My/Biometric';
import AddGuardian from 'pages/Guardian/GuardianManage/AddGuardian';
import ModifyGuardian from 'pages/Guardian/GuardianManage/ModifyGuardian';
import GuardianDetail from 'pages/Guardian/GuardianDetail';
import ReceiveTokenPage from 'pages/Assets/ReceiveToken';
import AssetsHome from 'pages/Assets/Home/AssetsHome';
import PaymentSecurityList from 'pages/My/WalletSecurity/PaymentSecurity/PaymentSecurityHome';
import PaymentSecurityDetail from 'pages/My/WalletSecurity/PaymentSecurity/PaymentSecurityDetail';
import PaymentSecurityEdit from 'pages/My/WalletSecurity/PaymentSecurity/PaymentSecurityEdit';
import { wrapEntry } from 'utils/commonUtil';

type AcceptableComponentType = ComponentProvider;

const initEntries = () => {
  const entryConfig = new Map<string, AcceptableComponentType>();
  entryConfig.set(PortkeyEntries.TEST, () => TestPage);

  // entry stage
  entryConfig.set(PortkeyEntries.SIGN_IN_ENTRY, () => SignInEntryPage);
  entryConfig.set(PortkeyEntries.SELECT_COUNTRY_ENTRY, () => SelectCountryPage);
  entryConfig.set(PortkeyEntries.SIGN_UP_ENTRY, () => SignUpEntryPage);

  // verify stage
  entryConfig.set(PortkeyEntries.VERIFIER_DETAIL_ENTRY, () => VerifierDetailsEntryPage);
  entryConfig.set(PortkeyEntries.GUARDIAN_APPROVAL_ENTRY, () => GuardianApprovalEntryPage);

  // config stage
  entryConfig.set(PortkeyEntries.CHECK_PIN, () => CheckPin);
  entryConfig.set(PortkeyEntries.SET_PIN, () => SetPin);
  entryConfig.set(PortkeyEntries.CONFIRM_PIN, () => ConfirmPin);
  entryConfig.set(PortkeyEntries.SET_BIO, () => SetBiometrics);

  // scan QR code
  entryConfig.set(PortkeyEntries.SCAN_QR_CODE, () => QrScanner);
  entryConfig.set(PortkeyEntries.SCAN_LOG_IN, () => ScanLogin);

  // guardian manage
  entryConfig.set(PortkeyEntries.GUARDIAN_HOME_ENTRY, () => GuardianHome);
  entryConfig.set(PortkeyEntries.GUARDIAN_DETAIL_ENTRY, () => GuardianDetail);
  entryConfig.set(PortkeyEntries.ADD_GUARDIAN_ENTRY, () => AddGuardian);
  entryConfig.set(PortkeyEntries.MODIFY_GUARDIAN_ENTRY, () => ModifyGuardian);

  // webview
  entryConfig.set(PortkeyEntries.VIEW_ON_WEBVIEW, () => ViewOnWebView);

  // account setting
  entryConfig.set(PortkeyEntries.ACCOUNT_SETTING_ENTRY, () => AccountSettings);
  entryConfig.set(PortkeyEntries.BIOMETRIC_SWITCH_ENTRY, () => Biometric);

  // assets module
  entryConfig.set(PortkeyEntries.ASSETS_HOME_ENTRY, () => AssetsHome);
  entryConfig.set(PortkeyEntries.RECEIVE_TOKEN_ENTRY, () => ReceiveTokenPage);

  entryConfig.set(PortkeyEntries.PAYMENT_SECURITY_HOME_ENTRY, () => PaymentSecurityList);
  entryConfig.set(PortkeyEntries.PAYMENT_SECURITY_DETAIL_ENTRY, () => PaymentSecurityDetail);
  entryConfig.set(PortkeyEntries.PAYMENT_SECURITY_EDIT_ENTRY, () => PaymentSecurityEdit);

  for (const [key, value] of entryConfig) {
    AppRegistry.registerComponent(wrapEntry(key), value);
  }
  registerLaunchMode();
};
export enum LaunchMode {
  STANDARD = 'standard',
  SINGLE_TASK = 'single_task',
  SINGLE_TOP = 'single_top',
}
export const LaunchModeSet = new Map<string, string>();
const registerLaunchMode = () => {
  LaunchModeSet.set(PortkeyEntries.ACCOUNT_SETTING_ENTRY, LaunchMode.SINGLE_TASK);
  LaunchModeSet.set(PortkeyEntries.PAYMENT_SECURITY_HOME_ENTRY, LaunchMode.SINGLE_TASK);
};
export { initEntries };
