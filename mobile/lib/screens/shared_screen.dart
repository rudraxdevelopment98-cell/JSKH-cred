import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/vault_item.dart';
import '../services/vault_service.dart';
import '../widgets/vault_item_tile.dart';
import 'item_detail_screen.dart';

class SharedScreen extends StatefulWidget {
  const SharedScreen({super.key});

  @override
  State<SharedScreen> createState() => _SharedScreenState();
}

class _SharedScreenState extends State<SharedScreen> {
  late Future<List<VaultItem>> _items;

  @override
  void initState() {
    super.initState();
    _items = context.read<VaultService>().sharedWithMe();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Shared With Me')),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() => _items = context.read<VaultService>().sharedWithMe());
          await _items;
        },
        child: FutureBuilder<List<VaultItem>>(
          future: _items,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            }
            final items = snap.data ?? const [];
            if (items.isEmpty) {
              return ListView(
                children: const [
                  SizedBox(height: 120),
                  Center(child: Text('Nothing has been shared with you yet.')),
                ],
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
    );
  }
}
