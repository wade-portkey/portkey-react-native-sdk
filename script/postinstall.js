// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// native-dependencies.js path
const nativeDependenciesPath = path.resolve(__dirname, '../native-dependencies.js');
let projectRoot;
try {
  const reactNativePath = require.resolve('react');
  projectRoot = path.resolve(reactNativePath, '../../..');
} catch (e) {
  console.warn('no react!');
}
if (!projectRoot) {
  let currentDir = __dirname;
  while (currentDir !== '/') {
    if (fs.existsSync(path.join(currentDir, 'node_modules'))) {
      break;
    }
    currentDir = path.dirname(currentDir);
  }
  projectRoot = currentDir;
}

console.log(`Project root: ${projectRoot}`);

// react-native.config.js path
const configPath = path.resolve(projectRoot, 'react-native.config.js');
// require native-dependencies.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nativeDependencies = require(nativeDependenciesPath);
// check react-native.config.js exist
if (!fs.existsSync(configPath)) {
  console.log('react-native.config.js absent');
  // create react-native.config.js file，and load the dependencies value of native-dependencies.js  file  to the new file()
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(nativeDependencies, null, 2)};`);
} else {
  console.log('react-native.config.js exist');
  // merge the dependencies value of native-dependencies.js  file to the new file!
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(configPath);
  // no dependencies value, add firstly
  if (!Object.prototype.hasOwnProperty.call(config, 'dependencies')) {
    config.dependencies = {};
  }
  // append the dependencies value
  for (const [key, value] of Object.entries(nativeDependencies.dependencies)) {
    if (!Object.prototype.hasOwnProperty.call(config.dependencies, key)) {
      config.dependencies[key] = value;
    }
  }

  // save react-native.config.js
  fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)};`);
}
