# Roadmap

A phased delivery plan for JCred. Phases are indicative and may overlap.

## Phase 0 — Foundation (current)
- [x] Product specification & technical overview
- [x] Backend repository scaffolding
- [x] Docker setup for the backend
- [ ] CI/CD pipeline

## Phase 1 — Core Vault (MVP)
- [x] Authentication (email/password) with rotating refresh tokens & sessions
- [ ] Authentication (phone OTP, social, biometric)
- [x] Secure vault: credentials & secure notes (AES-256-GCM)
- [ ] Document upload to encrypted S3 storage
- [x] Family management (create, invite, approve, remove, roles)
- [x] Sharing, access requests, and approvals
- [x] Notifications (in-app)
- [x] Activity logging
- [ ] Mobile app shell (Flutter): Splash, Onboarding, Login, Dashboard, Vault

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
