// eslint-disable-next-line @typescript-eslint/no-var-requires
const { existsSync, writeFileSync } = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolve } = require('path');

// native-dependencies.js path
const nativeDependenciesPath = resolve(__dirname, '../native-dependencies.js');

// react-native.config.js path
const configPath = resolve(process.cwd(), 'react-native.config.js');

// require native-dependencies.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nativeDependencies = require(nativeDependenciesPath);
// check react-native.config.js exist
if (!existsSync(configPath)) {
  console.log('react-native.config.js absent');
  // create react-native.config.js file，and load the dependencies value of native-dependencies.js  file  to the new file()
  writeFileSync(configPath, `module.exports = ${JSON.stringify(nativeDependencies, null, 2)};`);
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
  writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 2)};`);
}
