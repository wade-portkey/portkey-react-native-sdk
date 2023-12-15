# build index.android.bundle
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR/../"
if [ ! -d "android/src/main/assets/js" ]; then
  mkdir -p android/src/main/assets/js
fi
if [ ! -f "android/src/main/assets/js/index.android.bundle" ]; then
  touch android/src/main/assets/js/index.android.bundle
fi
react-native bundle --platform android --entry-file src/index.ts --bundle-output android/src/main/assets/js/index.android.bundle --assets-dest android/src/main/assets/js/res  --dev true
