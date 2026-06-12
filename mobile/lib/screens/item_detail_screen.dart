import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../models/vault_item.dart';
import '../services/vault_service.dart';

/// Shows an item's metadata and reveals its decrypted secret on demand.
class ItemDetailScreen extends StatefulWidget {
  final VaultItem item;
  const ItemDetailScreen({super.key, required this.item});

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  Map<String, dynamic>? _secret;
  bool _loading = false;
  bool _revealed = false;

  Future<void> _reveal() async {
    setState(() => _loading = true);
    try {
      final secret = await context.read<VaultService>().reveal(widget.item.id);
      setState(() {
        _secret = secret;
        _revealed = true;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('$e')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.item;
    return Scaffold(
      appBar: AppBar(title: Text(item.title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _MetaRow(label: 'Type', value: item.typeLabel),
          if (item.category != null) _MetaRow(label: 'Category', value: item.category!),
          _MetaRow(label: 'Access', value: item.permission.replaceAll('_', ' ')),
          if (item.tags.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Wrap(
                spacing: 8,
                children: item.tags.map((t) => Chip(label: Text(t))).toList(),
              ),
            ),
          const Divider(height: 32),
          if (!item.hasSecret)
            const Text('This item has no stored secret.')
          else if (!_revealed)
            FilledButton.icon(
              onPressed: _loading ? null : _reveal,
              icon: const Icon(Icons.visibility),
              label: Text(_loading ? 'Revealing…' : 'Reveal secret'),
            )
          else
            ..._secret!.entries.map(
              (e) => _SecretField(label: e.key, value: '${e.value}'),
            ),
        ],
      ),
    );
  }
}

class _MetaRow extends StatelessWidget {
  final String label;
  final String value;
  const _MetaRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          SizedBox(
            width: 110,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}

class _SecretField extends StatelessWidget {
  final String label;
  final String value;
  const _SecretField({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        subtitle: Text(value),
        trailing: IconButton(
          icon: const Icon(Icons.copy),
          onPressed: () {
            Clipboard.setData(ClipboardData(text: value));
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('$label copied')),
            );
          },
        ),
      ),
    );
  }
}
