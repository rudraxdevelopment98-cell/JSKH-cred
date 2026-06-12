import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persists JWT access and refresh tokens in the platform secure storage
/// (Keychain on iOS, EncryptedSharedPreferences on Android).
class TokenStorage {
  static const _accessKey = 'jcred_access';
  static const _refreshKey = 'jcred_refresh';

  final FlutterSecureStorage _storage;

  TokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ?? const FlutterSecureStorage();

  Future<String?> get accessToken => _storage.read(key: _accessKey);
  Future<String?> get refreshToken => _storage.read(key: _refreshKey);

  Future<void> save({required String access, required String refresh}) async {
    await _storage.write(key: _accessKey, value: access);
    await _storage.write(key: _refreshKey, value: refresh);
  }

  Future<void> updateAccess(String access) =>
      _storage.write(key: _accessKey, value: access);

  Future<void> clear() async {
    await _storage.delete(key: _accessKey);
    await _storage.delete(key: _refreshKey);
  }
}
