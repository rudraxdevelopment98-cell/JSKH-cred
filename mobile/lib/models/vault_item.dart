class VaultItem {
  final String id;
  final String type;
  final String title;
  final String? category;
  final List<String> tags;
  final bool hasSecret;
  final String permission;
  final DateTime? expiresAt;

  const VaultItem({
    required this.id,
    required this.type,
    required this.title,
    required this.tags,
    required this.hasSecret,
    required this.permission,
    this.category,
    this.expiresAt,
  });

  factory VaultItem.fromJson(Map<String, dynamic> json) {
    return VaultItem(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      category: json['category'] as String?,
      tags: (json['tags'] as List<dynamic>? ?? const [])
          .map((e) => e as String)
          .toList(),
      hasSecret: json['hasSecret'] as bool? ?? false,
      permission: json['permission'] as String? ?? 'owner',
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'] as String)
          : null,
    );
  }

  /// Human-friendly label for the item type.
  String get typeLabel {
    switch (type) {
      case 'password':
        return 'Password';
      case 'secure_note':
        return 'Secure Note';
      case 'passport':
        return 'Passport';
      case 'license':
        return 'Driving License';
      case 'insurance':
        return 'Insurance';
      case 'medical':
        return 'Medical Record';
      case 'property':
        return 'Property';
      case 'certificate':
        return 'Certificate';
      case 'bank':
        return 'Bank Info';
      case 'tax':
        return 'Tax Document';
      default:
        return type;
    }
  }
}
