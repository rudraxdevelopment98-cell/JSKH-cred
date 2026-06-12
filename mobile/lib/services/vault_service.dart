import '../models/vault_item.dart';
import 'api_client.dart';

/// Vault item operations backed by the JCred API.
class VaultService {
  final ApiClient _api;
  VaultService(this._api);

  Future<List<VaultItem>> listItems({String? type}) async {
    final query = type != null ? '?type=$type' : '';
    final data = await _api.get('/items$query') as Map<String, dynamic>;
    return (data['items'] as List<dynamic>)
        .map((e) => VaultItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<VaultItem>> sharedWithMe() async {
    final data = await _api.get('/items/shared-with-me') as Map<String, dynamic>;
    return (data['items'] as List<dynamic>)
        .map((e) => VaultItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Reveals an item's decrypted secret (logs a credential_access event).
  Future<Map<String, dynamic>> reveal(String id) async {
    final data = await _api.get('/items/$id/reveal') as Map<String, dynamic>;
    final item = data['item'] as Map<String, dynamic>;
    return (item['secret'] as Map<String, dynamic>?) ?? const {};
  }

  Future<VaultItem> create({
    required String type,
    required String title,
    String? category,
    List<String> tags = const [],
    Map<String, dynamic>? secret,
  }) async {
    final data = await _api.post('/items', body: {
      'type': type,
      'title': title,
      if (category != null) 'category': category,
      'tags': tags,
      if (secret != null) 'secret': secret,
    }) as Map<String, dynamic>;
    return VaultItem.fromJson(data['item'] as Map<String, dynamic>);
  }

  Future<void> delete(String id) => _api.delete('/items/$id');
}
