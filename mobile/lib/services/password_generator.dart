import 'dart:math';

/// Generates strong random passwords. Pure client-side utility.
class PasswordGenerator {
  static const _lower = 'abcdefghijkmnopqrstuvwxyz';
  static const _upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  static const _digits = '23456789';
  static const _symbols = '!@#\$%^&*()-_=+';

  static String generate({
    int length = 16,
    bool symbols = true,
    bool digits = true,
  }) {
    final rng = Random.secure();
    var pool = _lower + _upper;
    if (digits) pool += _digits;
    if (symbols) pool += _symbols;
    return List.generate(length, (_) => pool[rng.nextInt(pool.length)]).join();
  }
}
