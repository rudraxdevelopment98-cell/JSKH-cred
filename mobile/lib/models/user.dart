class User {
  final String id;
  final String? email;
  final String? displayName;
  final String role;

  const User({
    required this.id,
    required this.role,
    this.email,
    this.displayName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      displayName: json['displayName'] as String?,
      role: json['role'] as String? ?? 'member',
    );
  }
}
