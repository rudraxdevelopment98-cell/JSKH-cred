class AppNotification {
  final String id;
  final String type;
  final Map<String, dynamic> payload;
  final bool read;
  final DateTime createdAt;

  const AppNotification({
    required this.id,
    required this.type,
    required this.payload,
    required this.read,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) => AppNotification(
        id: json['id'] as String,
        type: json['type'] as String,
        payload: (json['payload'] as Map<String, dynamic>?) ?? const {},
        read: json['read'] as bool? ?? false,
        createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ??
            DateTime.now(),
      );

  String get title {
    switch (type) {
      case 'access_request':
        return 'Access request';
      case 'document_shared':
        return 'Item shared with you';
      case 'expiry_alert':
        return 'Expiry alert';
      case 'security_alert':
        return 'Security alert';
      case 'family_invitation':
        return 'Family invitation';
      default:
        return type;
    }
  }
}
