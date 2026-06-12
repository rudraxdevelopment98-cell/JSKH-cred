# JCred

> **Your Family's Secure Digital Vault**

JCred is a secure platform that lets families store important documents, credentials,
and sensitive information while keeping fine-grained control over **who** can access **what**.

---

## Table of Contents

- [Vision](#vision)
- [Platforms](#platforms)
- [Who It's For](#who-its-for)
- [Core Features](#core-features)
- [Roles & Permissions](#roles--permissions)
- [Authentication](#authentication)
- [Security Architecture](#security-architecture)
- [Mobile UI](#mobile-ui)
- [Admin Panel](#admin-panel)
- [Technology Stack](#technology-stack)
- [Future Roadmap](#future-roadmap)
- [Documentation](#documentation)
- [Project Status](#project-status)

---

## Vision

A secure platform that allows families to store important documents, credentials, and
sensitive information while controlling who can access what.

## Platforms

| Platform | Purpose |
| --- | --- |
| **Android** | Primary mobile vault (Flutter) |
| **iOS** | Primary mobile vault (Flutter) |
| **Web Admin Panel** | Administration & analytics (React + Material UI) |

## Who It's For

- 👨‍👩‍👧‍👦 Families
- 👪 Parents
- 💑 Spouses
- 🤝 Trusted Guardians

---

## Core Features

### 🔐 Secure Vault
Store important documents and credentials securely, including:

Passwords · Secure Notes · Passports · Driving Licenses · Insurance Documents ·
Medical Records · Property Documents · Educational Certificates · Bank Information ·
Tax Documents

### 👨‍👩‍👧 Family Management
Manage family members and their access:
- Invite family members
- Approve or remove members
- Assign roles
- Create family groups

### 🛡️ Access Control
A granular permission system with the following access levels:

`Private` · `View Only` · `View and Download` · `Edit` · `Temporary Access` · `Emergency Access`

### 🔑 Credential Manager
- Password storage
- Password generator
- Secure notes
- Credential categorization
- Masked credential display

### 📄 Document Management
- Document upload
- Image scanning
- OCR text extraction
- Document tagging
- Version history
- Expiry reminders

### 🔔 Notifications
Access requests · Document shared · Expiry alerts · Security alerts · Family invitations

### 📊 Activity Logs
Track: Logins · Document views · Downloads · Uploads · Permission changes · Credential access

---

## Roles & Permissions

| Role | Permissions |
| --- | --- |
| **Super Admin** | Manage all users · Manage subscriptions · View analytics · Suspend accounts |
| **Family Admin** | Invite members · Assign permissions · Manage family settings · Approve emergency access |
| **Member** | Upload documents · Store credentials · Request access · View shared items |

---

## Authentication

**Methods**

- Email and Password
- Phone OTP
- Google Sign-In
- Apple Sign-In
- Biometric Authentication

**Security**

- Two-Factor Authentication
- Device Verification
- Session Management

---

## Security Architecture

| Aspect | Approach |
| --- | --- |
| **Encryption** | AES-256 |
| **Storage** | Encrypted Cloud Storage |
| **Additional Protection** | Biometric Lock · Automatic Logout · Audit Trails · Rate Limiting · Encrypted Backups |

---

## Mobile UI

- **Themes:** Light Mode, Dark Mode
- **Navigation:** Bottom Navigation

**Screens**

Splash Screen · Onboarding · Login · Dashboard · Vault · Credentials · Family ·
Shared With Me · Notifications · Profile · Settings · Emergency Access

---

## Admin Panel

**Pages**

Overview Dashboard · Family Management · User Management · Security Logs ·
Analytics · Subscription Management · System Settings

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Mobile Frontend | Flutter |
| Admin Frontend | React + Material UI |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Cache | Redis |
| File Storage | AWS S3 |
| Authentication | JWT |
| Notifications | Firebase Cloud Messaging |
| Deployment | Docker + AWS |

---

## Future Roadmap

- [ ] AI document categorization
- [ ] Digital inheritance planning
- [ ] Emergency family mode
- [ ] Secure family chat
- [ ] Multi-family support
- [ ] Offline encrypted vault

---

## Getting Started

The backend API is implemented and runnable. See [`backend/`](./backend) for setup:

```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm start            # API on :4000
# or: docker compose up --build
```

## Documentation

Detailed documentation lives in the [`docs/`](./docs) directory:

- [Architecture](./docs/ARCHITECTURE.md) — system design, components, and data flow
- [Features](./docs/FEATURES.md) — detailed feature breakdown
- [Security](./docs/SECURITY.md) — encryption, access control, and threat model
- [API Overview](./docs/API.md) — REST endpoint surface
- [Data Model](./docs/DATA_MODEL.md) — core entities and relationships
- [Roadmap](./docs/ROADMAP.md) — phased delivery plan

---

## Project Status

🚧 **In progress.**

- ✅ Product specification & technical overview
- ✅ **Backend API** (Node.js + Express + PostgreSQL) — auth, encrypted vault,
  families, sharing, access requests, notifications, activity logs, with migrations,
  Docker, and a passing integration test suite. See [`backend/`](./backend).
- ⬜ Web admin panel (React + Material UI)
- ⬜ Mobile app (Flutter)

Work follows the phases outlined in the [Roadmap](./docs/ROADMAP.md).
