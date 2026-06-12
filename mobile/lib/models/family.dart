class Family {
  final String id;
  final String name;
  final String? myRole;
  final String? myStatus;

  const Family({required this.id, required this.name, this.myRole, this.myStatus});

  factory Family.fromJson(Map<String, dynamic> json) => Family(
        id: json['id'] as String,
        name: json['name'] as String,
        myRole: json['my_role'] as String?,
        myStatus: json['my_status'] as String?,
      );

  bool get isAdmin => myRole == 'family_admin' || myRole == 'super_admin';
}

class FamilyMember {
  final String userId;
  final String? email;
  final String? displayName;
  final String role;
  final String status;

  const FamilyMember({
    required this.userId,
    required this.role,
    required this.status,
    this.email,
    this.displayName,
  });

  factory FamilyMember.fromJson(Map<String, dynamic> json) => FamilyMember(
        userId: json['user_id'] as String,
        email: json['email'] as String?,
        displayName: json['display_name'] as String?,
        role: json['role'] as String? ?? 'member',
        status: json['status'] as String? ?? 'invited',
      );
}
