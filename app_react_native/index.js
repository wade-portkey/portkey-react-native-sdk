import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-sdk-beta';

AppRegistry.registerComponent(appName, () => App);
const res = AppRegistry.getRegistry();
