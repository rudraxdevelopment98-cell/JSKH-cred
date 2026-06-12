import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'services/api_client.dart';
import 'services/token_storage.dart';
import 'services/vault_service.dart';
import 'state/auth_controller.dart';
import 'app.dart';

void main() {
  final tokens = TokenStorage();
  final api = ApiClient(tokens);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: api),
        Provider<VaultService>(create: (_) => VaultService(api)),
        ChangeNotifierProvider<AuthController>(
          create: (_) => AuthController(api, tokens)..bootstrap(),
        ),
      ],
      child: const JCredApp(),
    ),
  );
}
