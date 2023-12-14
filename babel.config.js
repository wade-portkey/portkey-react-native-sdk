const plugins = [
  [
    'module-resolver',
    {
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        '**/*': './src/**/*',
      },
    },
  ],
  ['@babel/plugin-proposal-decorators', { legacy: true }],
];
module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-typescript'],
  plugins: [...plugins],
  ignore: ['.babelignore'],
};
