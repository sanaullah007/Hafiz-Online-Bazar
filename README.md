# Hafiz Online Bazar — Android Only

Android-only Expo prototype with Hafiz branding. **This zip contains source code, not a compiled APK.**

## Build APK with Expo EAS

1. Install Node.js LTS and create/sign in to an Expo account.
2. From this folder run: `npm install`
3. `npx eas-cli login`
4. `npx eas-cli build:configure --platform android`
5. `npx eas-cli build --platform android --profile preview`
6. Download APK from the EAS build page after a successful build.

If prompted about creating an Android signing key, allow EAS to manage it. The `eas.json` preview profile uses `buildType: apk` to produce a sideloadable Android installation package.

## Scope and limitations
- Android-only configuration. Contains user-provided logo/icon and splash art.
- Multilingual demo shopping catalog, cart, checkout screen, seller preview, 5% commission illustration and admin support numbers.
- **No live marketplace backend, real payment processing, order delivery or seller accounts.**
- Expo account, network connection and successful cloud build are required to obtain a real APK.


## Browser-based Android APK build

GitHub Actions workflow: `.github/workflows/build-android-apk.yml`. See `APK-څنګه-جوړیږي.md` for usage. This is source code, NOT a prebuilt APK.
