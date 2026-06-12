import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import 'token_storage.dart';

/// Thrown when the API responds with a non-2xx status.
class ApiException implements Exception {
  final int status;
  final String code;
  final String message;
  ApiException(this.status, this.code, this.message);

  @override
  String toString() => 'ApiException($status, $code): $message';
}

/// Thin HTTP client that attaches the bearer token and transparently
/// refreshes it once on a 401.
class ApiClient {
  final TokenStorage _tokens;
  final http.Client _http;

  ApiClient(this._tokens, [http.Client? client])
      : _http = client ?? http.Client();

  Uri _uri(String path) => Uri.parse('${Config.apiBase}$path');

  Future<dynamic> get(String path, {bool auth = true}) =>
      _send('GET', path, auth: auth);

  Future<dynamic> post(String path, {Object? body, bool auth = true}) =>
      _send('POST', path, body: body, auth: auth);

  Future<dynamic> put(String path, {Object? body, bool auth = true}) =>
      _send('PUT', path, body: body, auth: auth);

  Future<dynamic> delete(String path, {bool auth = true}) =>
      _send('DELETE', path, auth: auth);

  Future<dynamic> _send(
    String method,
    String path, {
    Object? body,
    bool auth = true,
    bool retry = false,
  }) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (auth) {
      final token = await _tokens.accessToken;
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }

    final request = http.Request(method, _uri(path))..headers.addAll(headers);
    if (body != null) request.body = jsonEncode(body);

    final streamed = await _http.send(request);
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode == 401 && auth && !retry) {
      if (await _refresh()) {
        return _send(method, path, body: body, auth: auth, retry: true);
      }
    }

    return _parse(response);
  }

  dynamic _parse(http.Response response) {
    final hasBody = response.body.isNotEmpty;
    final decoded = hasBody ? jsonDecode(response.body) : null;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return decoded;
    }
    final error = (decoded is Map ? decoded['error'] : null) as Map?;
    throw ApiException(
      response.statusCode,
      error?['code'] as String? ?? 'error',
      error?['message'] as String? ?? response.reasonPhrase ?? 'Request failed',
    );
  }

  Future<bool> _refresh() async {
    final refresh = await _tokens.refreshToken;
    if (refresh == null) return false;
    final res = await _http.post(
      _uri('/auth/refresh'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': refresh}),
    );
    if (res.statusCode != 200) {
      await _tokens.clear();
      return false;
    }
    final data = jsonDecode(res.body) as Map<String, dynamic>;
    await _tokens.save(
      access: data['accessToken'] as String,
      refresh: data['refreshToken'] as String,
    );
    return true;
  }
}
