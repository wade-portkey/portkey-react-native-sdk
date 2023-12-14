# build index.android.bundle
cd ../
if [ ! -d "android/library/src/main/assets" ]; then
  mkdir -p android/library/src/main/assets
fi
if [ ! -f "android/library/src/main/assets/index.android.bundle" ]; then
  touch android/library/src/main/assets/index.android.bundle
fi
react-native bundle --platform android --entry-file index.js --bundle-output android/src/main/assets/index.android.bundle --assets-dest android/src/main/res/  --dev true
