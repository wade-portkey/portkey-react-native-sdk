/* eslint-disable @typescript-eslint/no-var-requires */
// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://facebook.github.io/metro/docs/configuration/
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Find the project and workspace directories
const projectRoot = __dirname;

const config = {
  // Watch all files within the monorepo
  watchFolders: [projectRoot],
  resolver: {
    // Let Metro know where to resolve packages and in what order
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules')],
    // Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
    disableHierarchicalLookup: true,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
