/// Application configuration.
///
/// Override the API base at build time:
///   flutter run --dart-define=API_BASE=https://api.jcred.app/api/v1
class Config {
  static const String apiBase = String.fromEnvironment(
    'API_BASE',
    // Android emulator maps the host machine to 10.0.2.2.
    defaultValue: 'http://10.0.2.2:4000/api/v1',
  );
}
