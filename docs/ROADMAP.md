# Roadmap

A phased delivery plan for JCred. Phases are indicative and may overlap.

## Phase 0 — Foundation (current)
- [x] Product specification & technical overview
- [ ] Repository scaffolding (backend, mobile, admin)
- [ ] CI/CD pipeline and Docker setup

## Phase 1 — Core Vault (MVP)
- [ ] Authentication (email/password, phone OTP)
- [ ] Secure vault: credentials & secure notes (AES-256)
- [ ] Document upload to encrypted S3 storage
- [ ] Basic family management (invite, approve, remove)
- [ ] Mobile app shell (Flutter): Splash, Onboarding, Login, Dashboard, Vault
- [ ] Activity logging

## Phase 2 — Access Control & Sharing
- [ ] Granular permissions (Private → Emergency Access)
- [ ] Sharing & "Shared With Me"
- [ ] Access requests and approvals
- [ ] Notifications via FCM
- [ ] Biometric lock, automatic logout, session management

## Phase 3 — Documents & Productivity
- [ ] Image scanning + OCR text extraction
- [ ] Document tagging, version history
- [ ] Expiry reminders
- [ ] Password generator, masked credential display

## Phase 4 — Admin & Scale
- [ ] Web admin panel (React + Material UI)
- [ ] User & family management, security logs
- [ ] Analytics dashboard
- [ ] Subscription management
- [ ] Rate limiting, device verification, 2FA hardening

## Phase 5 — Advanced (Future)
- [ ] AI document categorization
- [ ] Digital inheritance planning
- [ ] Emergency family mode
- [ ] Secure family chat
- [ ] Multi-family support
- [ ] Offline encrypted vault
