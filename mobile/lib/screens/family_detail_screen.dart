import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/family.dart';
import '../services/family_service.dart';

class FamilyDetailScreen extends StatefulWidget {
  final Family family;
  const FamilyDetailScreen({super.key, required this.family});

  @override
  State<FamilyDetailScreen> createState() => _FamilyDetailScreenState();
}

class _FamilyDetailScreenState extends State<FamilyDetailScreen> {
  late Future<List<FamilyMember>> _members;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _members = context.read<FamilyService>().listMembers(widget.family.id);
  }

  Future<void> _inviteDialog() async {
    final controller = TextEditingController();
    final email = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Invite member'),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.emailAddress,
          decoration: const InputDecoration(labelText: 'Member email'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Invite'),
          ),
        ],
      ),
    );
    if (email == null || email.isEmpty) return;
    await _run(() => context.read<FamilyService>().invite(widget.family.id, email),
        success: 'Invitation sent');
  }

  Future<void> _run(Future<void> Function() action, {required String success}) async {
    try {
      await action();
      if (!mounted) return;
      setState(_reload);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(success)));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = widget.family.isAdmin;
    return Scaffold(
      appBar: AppBar(title: Text(widget.family.name)),
      body: FutureBuilder<List<FamilyMember>>(
        future: _members,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snap.hasError) {
            return Center(child: Text('Failed to load: ${snap.error}'));
          }
          final members = snap.data ?? const [];
          return ListView(
            padding: const EdgeInsets.all(12),
            children: [
              for (final m in members)
                Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text((m.displayName ?? m.email ?? '?')
                          .characters
                          .first
                          .toUpperCase()),
                    ),
                    title: Text(m.displayName ?? m.email ?? 'Member'),
                    subtitle: Text('${m.role.replaceAll('_', ' ')} · ${m.status}'),
                    trailing: isAdmin && m.status != 'removed'
                        ? PopupMenuButton<String>(
                            onSelected: (v) {
                              if (v == 'approve') {
                                _run(
                                  () => context
                                      .read<FamilyService>()
                                      .approve(widget.family.id, m.userId),
                                  success: 'Member approved',
                                );
                              } else if (v == 'remove') {
                                _run(
                                  () => context
                                      .read<FamilyService>()
                                      .remove(widget.family.id, m.userId),
                                  success: 'Member removed',
                                );
                              }
                            },
                            itemBuilder: (_) => [
                              if (m.status == 'invited')
                                const PopupMenuItem(
                                    value: 'approve', child: Text('Approve')),
                              const PopupMenuItem(
                                  value: 'remove', child: Text('Remove')),
                            ],
                          )
                        : null,
                  ),
                ),
            ],
          );
        },
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: _inviteDialog,
              icon: const Icon(Icons.person_add),
              label: const Text('Invite'),
            )
          : null,
    );
  }
}
