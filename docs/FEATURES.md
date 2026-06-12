# Features

A detailed breakdown of JCred's feature set.

## 🔐 Secure Vault

Store important documents and credentials securely. Supported item types:

| Item | Notes |
| --- | --- |
| Passwords | Encrypted, masked display |
| Secure Notes | Free-form encrypted text |
| Passports | Document + image scan |
| Driving Licenses | Document + expiry reminder |
| Insurance Documents | Document + expiry reminder |
| Medical Records | Sensitive, restricted by default |
| Property Documents | Document + version history |
| Educational Certificates | Document + tagging |
| Bank Information | Credential + masked display |
| Tax Documents | Document + expiry reminder |

## 👨‍👩‍👧 Family Management

- **Invite family members** — send invitations by email/phone.
- **Approve or remove members** — Family Admins control membership.
- **Assign roles** — Super Admin / Family Admin / Member.
- **Create family groups** — organize members into groups.

## 🛡️ Access Control

Granular permission levels applied per item or group:

| Level | Description |
| --- | --- |
| Private | Only the owner can access |
| View Only | Recipient can view but not download |
| View and Download | Recipient can view and download |
| Edit | Recipient can modify |
| Temporary Access | Time-bound access that auto-expires |
| Emergency Access | Break-glass access, requires approval/trigger |

## 🔑 Credential Manager

- Password storage
- Password generator
- Secure notes
- Credential categorization
- Masked credential display

## 📄 Document Management

- Document upload
- Image scanning
- OCR text extraction
- Document tagging
- Version history
- Expiry reminders

## 🔔 Notifications

Delivered via Firebase Cloud Messaging:

- Access requests
- Document shared
- Expiry alerts
- Security alerts
- Family invitations

## 📊 Activity Logs

Every sensitive action is recorded for auditing:

- Logins
- Document views
- Downloads
- Uploads
- Permission changes
- Credential access
