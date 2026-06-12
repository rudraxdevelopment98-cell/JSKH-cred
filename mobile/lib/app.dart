import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'state/auth_controller.dart';
import 'theme.dart';
import 'screens/splash_screen.dart';
import 'screens/login_screen.dart';
import 'screens/home_shell.dart';

class JCredApp extends StatelessWidget {
  const JCredApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JCred',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      home: Consumer<AuthController>(
        builder: (context, auth, _) {
          switch (auth.status) {
            case AuthStatus.unknown:
              return const SplashScreen();
            case AuthStatus.authenticated:
              return const HomeShell();
            case AuthStatus.unauthenticated:
              return const LoginScreen();
          }
        },
      ),
    );
  }
}
