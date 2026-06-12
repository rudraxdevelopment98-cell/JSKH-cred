import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:jcred/screens/splash_screen.dart';
import 'package:jcred/theme.dart';

void main() {
  testWidgets('SplashScreen shows the brand and tagline', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: const SplashScreen(),
      ),
    );

    expect(find.text('JCred'), findsOneWidget);
    expect(find.text("Your Family's Secure Digital Vault"), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
