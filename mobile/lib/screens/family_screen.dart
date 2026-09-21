import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/family.dart';
import '../services/family_service.dart';
import 'family_detail_screen.dart';

class FamilyScreen extends StatefulWidget {
  const FamilyScreen({super.key});

  @override
  State<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends State<FamilyScreen> {
  late Future<List<Family>> _families;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _families = context.read<FamilyService>().listFamilies();
  }

  Future<void> _createDialog() async {
    final service = context.read<FamilyService>();
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New family group'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Family name'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Create'),
          ),
        ],
      ),
    );
    if (name == null || name.isEmpty) return;
    try {
      await service.createFamily(name);
      if (mounted) setState(() => _families = service.listFamilies());
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  Future<void> _joinDialog() async {
    final service = context.read<FamilyService>();
    final controller = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Join with code'),
        content: TextField(
          controller: controller,
          autofocus: true,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: const InputDecoration(
            labelText: '6-digit code',
            counterText: '',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, controller.text.trim()),
            child: const Text('Join'),
          ),
        ],
      ),
    );
    if (code == null || code.isEmpty) return;
    try {
      await service.joinByCode(code);
      if (!mounted) return;
      setState(() => _families = service.listFamilies());
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Joined family')));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Family'),
        actions: [
          TextButton.icon(
            onPressed: _joinDialog,
            icon: const Icon(Icons.login),
            label: const Text('Join'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(_reload);
          await _families;
        },
        child: FutureBuilder<List<Family>>(
          future: _families,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return _centered('Failed to load: ${snap.error}');
            }
            final families = snap.data ?? const [];
            if (families.isEmpty) {
              return _centered('No family groups yet.\nTap + to create one.');
            }
            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: families.length,
              itemBuilder: (context, i) {
                final f = families[i];
                return Card(
                  child: ListTile(
                    leading: const CircleAvatar(child: Icon(Icons.groups)),
                    title: Text(f.name),
                    subtitle: Text(f.isAdmin ? 'Admin' : 'Member'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => FamilyDetailScreen(family: f),
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _createDialog,
        icon: const Icon(Icons.add),
        label: const Text('New family'),
      ),
    );
  }

  Widget _centered(String text) => ListView(
        children: [
          const SizedBox(height: 120),
          Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Text(text, textAlign: TextAlign.center),
            ),
          ),
        ],
      );
}
