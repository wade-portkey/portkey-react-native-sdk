# build index.android.bundle
cd ../
if [ ! -d "android/src/main/assets" ]; then
  mkdir -p android/src/main/assets
fi
if [ ! -f "android/src/main/assets/index.android.bundle" ]; then
  touch android/src/main/assets/index.android.bundle
fi
react-native bundle --platform android --entry-file src/index.ts --bundle-output android/src/main/assets/index.android.bundle --assets-dest android/src/main/res/  --dev true
