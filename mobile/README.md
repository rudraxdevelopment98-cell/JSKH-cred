# JCred Mobile App

Flutter app for **JCred — Your Family's Secure Digital Vault** (Android & iOS).
Consumes the [JCred backend API](../backend).

> **Status:** scaffolded foundation. The Dart sources, state management, API
> layer, and core screens are in place. Native platform folders
> (`android/`, `ios/`, …) are **not** committed — generate them with
> `flutter create .` before running (see below).

## Features in this scaffold

- **Splash → Login/Register → Home** flow driven by auth state
- **Secure token storage** (Keychain / EncryptedSharedPreferences) with
  automatic JWT refresh
- **Bottom navigation**: Dashboard, Vault, Shared With Me, Profile
- **Vault**: list items, add a password, view details, and reveal the
  decrypted secret on demand (copy to clipboard)
- Light & dark themes from a single seed color

## Requirements

- Flutter SDK ≥ 3.19 (Dart ≥ 3.3)
- A running [JCred backend](../backend)

## Getting started

```bash
cd mobile

# Generate the native platform projects (android/, ios/, etc.)
flutter create .

flutter pub get
flutter run --dart-define=API_BASE=http://10.0.2.2:4000/api/v1
```

- `10.0.2.2` is how the Android emulator reaches `localhost` on the host.
  For the iOS simulator use `http://localhost:4000/api/v1`.
- Override the API base for any environment via `--dart-define=API_BASE=...`.

Run the tests / static analysis:

```bash
flutter analyze
flutter test
```

## Project layout

```
lib/
  config.dart            API base (compile-time --dart-define)
  main.dart              provider wiring + bootstrap
  app.dart               root MaterialApp; routes by auth status
  theme.dart             light/dark themes
  models/                User, VaultItem
  services/              ApiClient (auth + refresh), TokenStorage, VaultService
  state/                 AuthController (ChangeNotifier)
  screens/               splash, login, home shell, dashboard, vault,
                         item detail, shared, profile
  widgets/               VaultItemTile
test/                    widget test
```

## Roadmap (not yet implemented)

Phone OTP / social / biometric sign-in, document upload + OCR, family
management screens, notifications (FCM), and the offline encrypted vault.
See [`../docs/ROADMAP.md`](../docs/ROADMAP.md).
