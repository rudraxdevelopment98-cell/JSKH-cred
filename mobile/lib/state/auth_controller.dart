import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/token_storage.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

/// Holds authentication state and exposes login/register/logout.
class AuthController extends ChangeNotifier {
  final ApiClient _api;
  final TokenStorage _tokens;

  AuthStatus _status = AuthStatus.unknown;
  User? _user;
  String? _error;

  AuthController(this._api, this._tokens);

  AuthStatus get status => _status;
  User? get user => _user;
  String? get error => _error;

  /// Called on startup: if a token exists, try to load the current user.
  Future<void> bootstrap() async {
    final token = await _tokens.accessToken;
    final refresh = await _tokens.refreshToken;
    if (token == null && refresh == null) {
      _setStatus(AuthStatus.unauthenticated);
      return;
    }
    try {
      final data = await _api.get('/auth/me') as Map<String, dynamic>;
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      _setStatus(AuthStatus.authenticated);
    } catch (_) {
      await _tokens.clear();
      _setStatus(AuthStatus.unauthenticated);
    }
  }

  Future<bool> login(String email, String password) =>
      _authenticate('/auth/login', {'email': email, 'password': password});

  Future<bool> register(String email, String password, String displayName) =>
      _authenticate('/auth/register', {
        'email': email,
        'password': password,
        'displayName': displayName,
      });

  Future<bool> _authenticate(String path, Map<String, dynamic> body) async {
    _error = null;
    try {
      final data = await _api.post(path, body: body, auth: false)
          as Map<String, dynamic>;
      await _tokens.save(
        access: data['accessToken'] as String,
        refresh: data['refreshToken'] as String,
      );
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      _setStatus(AuthStatus.authenticated);
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    final refresh = await _tokens.refreshToken;
    if (refresh != null) {
      try {
        await _api.post('/auth/logout',
            body: {'refreshToken': refresh}, auth: false);
      } catch (_) {
        // best effort
      }
    }
    await _tokens.clear();
    _user = null;
    _setStatus(AuthStatus.unauthenticated);
  }

  void _setStatus(AuthStatus status) {
    _status = status;
    notifyListeners();
  }
}
