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

  Future<void> approve(String familyId, String userId) =>
      _api.post('/families/$familyId/members/$userId/approve');

  Future<void> remove(String familyId, String userId) =>
      _api.delete('/families/$familyId/members/$userId');
}
