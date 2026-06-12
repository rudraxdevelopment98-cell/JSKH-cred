import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/vault_item.dart';
import '../services/vault_service.dart';
import '../services/password_generator.dart';
import '../widgets/vault_item_tile.dart';
import 'item_detail_screen.dart';

class VaultScreen extends StatefulWidget {
  const VaultScreen({super.key});

  @override
  State<VaultScreen> createState() => _VaultScreenState();
}

class _VaultScreenState extends State<VaultScreen> {
  late Future<List<VaultItem>> _items;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _items = context.read<VaultService>().listItems();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vault')),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(_reload);
          await _items;
        },
        child: FutureBuilder<List<VaultItem>>(
          future: _items,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snap.hasError) {
              return _CenteredMessage(text: 'Failed to load: ${snap.error}');
            }
            final items = snap.data ?? const [];
            if (items.isEmpty) {
              return const _CenteredMessage(
                text: 'Your vault is empty.\nTap + to add your first item.',
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              itemBuilder: (context, i) => VaultItemTile(
                item: items[i],
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ItemDetailScreen(item: items[i]),
                  ),
                ),
              ),
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddSheet(context),
        icon: const Icon(Icons.add),
        label: const Text('Add'),
      ),
    );
  }

  Future<void> _showAddSheet(BuildContext context) async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _AddItemSheet(),
    );
    if (created == true && mounted) setState(_reload);
  }
}

/// Add-item form supporting passwords, secure notes, and document records.
class _AddItemSheet extends StatefulWidget {
  const _AddItemSheet();

  @override
  State<_AddItemSheet> createState() => _AddItemSheetState();
}

const _itemTypes = <String, String>{
  'password': 'Password',
  'secure_note': 'Secure Note',
  'passport': 'Passport',
  'license': 'Driving License',
  'insurance': 'Insurance',
  'medical': 'Medical Record',
  'property': 'Property',
  'certificate': 'Certificate',
  'bank': 'Bank Info',
  'tax': 'Tax Document',
};

class _AddItemSheetState extends State<_AddItemSheet> {
  String _type = 'password';
  final _title = TextEditingController();
  final _username = TextEditingController();
  final _password = TextEditingController();
  final _note = TextEditingController();
  final _reference = TextEditingController();
  bool _saving = false;
  bool _obscure = true;

  @override
  void dispose() {
    _title.dispose();
    _username.dispose();
    _password.dispose();
    _note.dispose();
    _reference.dispose();
    super.dispose();
  }

  Map<String, dynamic> _buildSecret() {
    switch (_type) {
      case 'password':
        return {'username': _username.text.trim(), 'password': _password.text};
      case 'secure_note':
        return {'note': _note.text};
      default:
        // Document-style items store a reference/number plus optional notes
        // until file upload lands.
        return {
          if (_reference.text.trim().isNotEmpty) 'reference': _reference.text.trim(),
          if (_note.text.trim().isNotEmpty) 'notes': _note.text.trim(),
        };
    }
  }

  Future<void> _save() async {
    if (_title.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      final secret = _buildSecret();
      await context.read<VaultService>().create(
            type: _type,
            title: _title.text.trim(),
            secret: secret.isEmpty ? null : secret,
          );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 16, 16, bottom + 16),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('New Item', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _type,
              decoration: const InputDecoration(labelText: 'Type'),
              items: [
                for (final e in _itemTypes.entries)
                  DropdownMenuItem(value: e.key, child: Text(e.value)),
              ],
              onChanged: (v) => setState(() => _type = v ?? 'password'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _title,
              decoration: const InputDecoration(labelText: 'Title'),
            ),
            const SizedBox(height: 12),
            ..._fieldsForType(),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      height: 20, width: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Save'),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _fieldsForType() {
    switch (_type) {
      case 'password':
      case 'bank':
        return [
          TextField(
            controller: _username,
            decoration: const InputDecoration(labelText: 'Username / Account'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _password,
            obscureText: _obscure,
            decoration: InputDecoration(
              labelText: 'Password',
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    tooltip: 'Generate',
                    icon: const Icon(Icons.casino_outlined),
                    onPressed: () => setState(
                        () => _password.text = PasswordGenerator.generate()),
                  ),
                  IconButton(
                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ],
              ),
            ),
          ),
        ];
      case 'secure_note':
        return [
          TextField(
            controller: _note,
            minLines: 3,
            maxLines: 6,
            decoration: const InputDecoration(labelText: 'Note'),
          ),
        ];
      default:
        return [
          TextField(
            controller: _reference,
            decoration:
                const InputDecoration(labelText: 'Reference / Document number'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _note,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Notes (optional)'),
          ),
        ];
    }
  }
}

class _CenteredMessage extends StatelessWidget {
  final String text;
  const _CenteredMessage({required this.text});

  @override
  Widget build(BuildContext context) {
    return ListView(
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
}
