import '../models/app_notification.dart';
import 'api_client.dart';

class NotificationService {
  final ApiClient _api;
  NotificationService(this._api);

  Future<List<AppNotification>> list() async {
    final data = await _api.get('/notifications') as Map<String, dynamic>;
    return (data['notifications'] as List<dynamic>)
        .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markRead(String id) => _api.post('/notifications/$id/read');

  Future<void> markAllRead() => _api.post('/notifications/read-all');
}
