import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_notification.dart';
import '../services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  late Future<List<AppNotification>> _items;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _items = context.read<NotificationService>().list();
  }

  IconData _iconFor(String type) {
    switch (type) {
      case 'access_request':
        return Icons.vpn_key_outlined;
      case 'document_shared':
        return Icons.folder_shared_outlined;
      case 'expiry_alert':
        return Icons.event_busy_outlined;
      case 'security_alert':
        return Icons.security_outlined;
      case 'family_invitation':
        return Icons.group_add_outlined;
      default:
        return Icons.notifications_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            tooltip: 'Mark all read',
            icon: const Icon(Icons.done_all),
            onPressed: () async {
              await context.read<NotificationService>().markAllRead();
              if (mounted) setState(_reload);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(_reload);
          await _items;
        },
        child: FutureBuilder<List<AppNotification>>(
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
                  Center(child: Text("You're all caught up.")),
                ],
              );
            }
            return ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: items.length,
              itemBuilder: (context, i) {
                final n = items[i];
                return Card(
                  color: n.read ? null : Theme.of(context).colorScheme.surfaceContainerHighest,
                  child: ListTile(
                    leading: Icon(_iconFor(n.type)),
                    title: Text(n.title),
                    subtitle: Text(_relative(n.createdAt)),
                    trailing: n.read
                        ? null
                        : const Icon(Icons.circle, size: 10, color: Colors.blue),
                    onTap: n.read
                        ? null
                        : () async {
                            await context
                                .read<NotificationService>()
                                .markRead(n.id);
                            if (mounted) setState(_reload);
                          },
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }

  String _relative(DateTime t) {
    final d = DateTime.now().difference(t);
    if (d.inMinutes < 1) return 'just now';
    if (d.inHours < 1) return '${d.inMinutes}m ago';
    if (d.inDays < 1) return '${d.inHours}h ago';
    return '${d.inDays}d ago';
  }
}
