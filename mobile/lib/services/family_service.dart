import '../models/family.dart';
import 'api_client.dart';

/// Family group operations backed by the JCred API.
class FamilyService {
  final ApiClient _api;
  FamilyService(this._api);

  Future<List<Family>> listFamilies() async {
    final data = await _api.get('/families') as Map<String, dynamic>;
    return (data['families'] as List<dynamic>)
        .map((e) => Family.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Family> createFamily(String name) async {
    final data =
        await _api.post('/families', body: {'name': name}) as Map<String, dynamic>;
    return Family.fromJson(data['family'] as Map<String, dynamic>);
  }

  Future<List<FamilyMember>> listMembers(String familyId) async {
    final data =
        await _api.get('/families/$familyId/members') as Map<String, dynamic>;
    return (data['members'] as List<dynamic>)
        .map((e) => FamilyMember.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> invite(String familyId, String email) =>
      _api.post('/families/$familyId/invite', body: {'email': email});

  /// Admin generates a 6-digit join code (optionally emailed). Returns the code.
  Future<Map<String, dynamic>> createInviteCode(String familyId, {String? email}) async {
    final data = await _api.post(
      '/families/$familyId/invite-code',
      body: {if (email != null && email.isNotEmpty) 'email': email},
    ) as Map<String, dynamic>;
    return data;
  }

  /// Member joins a family by entering a 6-digit code.
  Future<void> joinByCode(String code) =>
      _api.post('/families/join', body: {'code': code});

  Future<void> approve(String familyId, String userId) =>
      _api.post('/families/$familyId/members/$userId/approve');

  Future<void> remove(String familyId, String userId) =>
      _api.delete('/families/$familyId/members/$userId');
}
