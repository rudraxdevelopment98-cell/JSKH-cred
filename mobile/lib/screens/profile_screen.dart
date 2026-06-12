import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_controller.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final user = auth.user;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 8),
          Center(
            child: CircleAvatar(
              radius: 40,
              backgroundColor: scheme.primaryContainer,
              child: Text(
                (user?.displayName ?? user?.email ?? '?')
                    .characters
                    .first
                    .toUpperCase(),
                style: TextStyle(fontSize: 32, color: scheme.onPrimaryContainer),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(
              user?.displayName ?? 'Member',
              style: Theme.of(context).textTheme.titleLarge,
            ),
          ),
          Center(child: Text(user?.email ?? '')),
          const SizedBox(height: 8),
          Center(
            child: Chip(label: Text((user?.role ?? 'member').replaceAll('_', ' '))),
          ),
          const Divider(height: 40),
          const ListTile(
            leading: Icon(Icons.fingerprint),
            title: Text('Biometric Lock'),
            subtitle: Text('Coming soon'),
            enabled: false,
          ),
          const ListTile(
            leading: Icon(Icons.notifications_outlined),
            title: Text('Notifications'),
            subtitle: Text('Coming soon'),
            enabled: false,
          ),
          const SizedBox(height: 16),
          FilledButton.tonalIcon(
            onPressed: () => context.read<AuthController>().logout(),
            icon: const Icon(Icons.logout),
            label: const Text('Log out'),
          ),
        ],
      ),
    );
  }
}
