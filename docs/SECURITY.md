# Security

Security is the foundation of JCred. This document summarizes the security model.

## Encryption

- **At rest:** AES-256 encryption for all stored documents and credentials.
- **In transit:** TLS for all client ↔ server communication.
- **File storage:** Files are encrypted before/while being stored in AWS S3; the database
  holds only metadata and object references.
- **Backups:** Encrypted backups.

## Authentication

**Supported methods**

- Email and Password
- Phone OTP
- Google Sign-In
- Apple Sign-In
- Biometric Authentication

**Hardening**

- Two-Factor Authentication (2FA)
- Device Verification — recognize and verify new devices.
- Session Management — view and revoke active sessions.

## Access Control

Authorization is enforced on two axes:

1. **Role** — Super Admin, Family Admin, Member (see [README](../README.md#roles--permissions)).
2. **Resource permission** — Private, View Only, View and Download, Edit, Temporary
   Access, Emergency Access.

Every API request validates both the caller's role and the requested resource's
permission level before proceeding.

## Additional Protection

| Control | Purpose |
| --- | --- |
| Biometric Lock | Local app lock using device biometrics |
| Automatic Logout | Sessions expire after inactivity |
| Audit Trails | All sensitive actions are logged |
| Rate Limiting | Protects against brute-force / abuse |
| Encrypted Backups | Recoverable data without exposing plaintext |

## Emergency & Temporary Access

- **Temporary Access** grants time-bound permissions that automatically expire.
- **Emergency Access** is a break-glass mechanism. Requests are approved by a Family Admin
  and are fully audited.

## Auditing

The activity log captures logins, document views, downloads, uploads, permission changes,
and credential access. Logs are append-only and surfaced to admins via the **Security Logs**
page in the admin panel.
