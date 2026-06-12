import 'package:flutter/material.dart';

import '../models/vault_item.dart';

/// A single vault item row with a type-appropriate icon.
class VaultItemTile extends StatelessWidget {
  final VaultItem item;
  final VoidCallback? onTap;
  const VaultItemTile({super.key, required this.item, this.onTap});

  IconData get _icon {
    switch (item.type) {
      case 'password':
        return Icons.password;
      case 'secure_note':
        return Icons.sticky_note_2_outlined;
      case 'passport':
        return Icons.book_outlined;
      case 'license':
        return Icons.badge_outlined;
      case 'insurance':
        return Icons.health_and_safety_outlined;
      case 'medical':
        return Icons.medical_information_outlined;
      case 'property':
        return Icons.home_outlined;
      case 'certificate':
        return Icons.school_outlined;
      case 'bank':
        return Icons.account_balance_outlined;
      case 'tax':
        return Icons.receipt_long_outlined;
      default:
        return Icons.lock_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: scheme.primaryContainer,
          child: Icon(_icon, color: scheme.onPrimaryContainer),
        ),
        title: Text(item.title),
        subtitle: Text(item.typeLabel),
        trailing: item.permission != 'owner'
            ? Chip(
                label: Text(item.permission.replaceAll('_', ' ')),
                visualDensity: VisualDensity.compact,
              )
            : const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
