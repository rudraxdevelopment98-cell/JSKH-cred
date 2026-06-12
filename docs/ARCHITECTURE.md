# Architecture

This document describes the high-level architecture of **JCred — Your Family's Secure Digital Vault**.

## Overview

JCred is a multi-client system backed by a single API. Two client surfaces (mobile apps
and the web admin panel) talk to a Node.js/Express backend, which persists data in
PostgreSQL, caches hot data in Redis, and stores encrypted files in AWS S3.

```
                 ┌─────────────────────────┐      ┌──────────────────────┐
                 │   Mobile App (Flutter)   │      │  Admin Panel (React) │
                 │   Android · iOS          │      │  + Material UI       │
                 └────────────┬─────────────┘      └──────────┬───────────┘
                              │                                │
                              │            HTTPS / JWT         │
                              └───────────────┬────────────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │  API Gateway       │
                                    │  Node.js + Express │
                                    └─────────┬──────────┘
            ┌───────────────┬──────────────── ┼ ───────────────┬─────────────────┐
            │               │                 │                 │                 │
    ┌───────▼──────┐ ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
    │ PostgreSQL   │ │   Redis     │  │   AWS S3     │  │   FCM        │  │ Auth / OTP   │
    │ (relational) │ │  (cache)    │  │ (encrypted   │  │ (push        │  │ providers    │
    │              │ │             │  │  files)      │  │  notif.)     │  │              │
    └──────────────┘ └─────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

## Components

### Mobile App (Flutter)
A single Flutter codebase targeting Android and iOS. Responsible for the vault UX,
credential management, biometric lock, and offline considerations (see roadmap). All
sensitive payloads are encrypted in transit and stored server-side encrypted.

### Admin Panel (React + Material UI)
A web application for Super Admins to manage users, families, subscriptions, view
analytics, and inspect security logs.

### Backend (Node.js + Express)
Stateless REST API. Handles authentication, authorization (role + permission checks),
business logic, file upload orchestration to S3, and notification dispatch via FCM.
Designed to scale horizontally behind a load balancer.

### Data Stores
- **PostgreSQL** — source of truth for users, families, documents metadata, credentials
  metadata, permissions, and audit logs.
- **Redis** — session/token caching, rate-limiting counters, and OTP storage.
- **AWS S3** — encrypted document/file blobs. Database stores only metadata + object keys.

### External Services
- **Firebase Cloud Messaging (FCM)** — push notifications.
- **OAuth / OTP providers** — Google Sign-In, Apple Sign-In, SMS OTP.

## Cross-Cutting Concerns

- **AuthN/AuthZ:** JWT-based authentication; every request is checked against the user's
  role and the resource's access-control level.
- **Encryption:** AES-256 at rest; TLS in transit.
- **Auditing:** every sensitive action writes to the activity log.
- **Rate limiting:** enforced at the API gateway using Redis counters.

## Deployment

All services are containerized with **Docker** and deployed on **AWS**. The recommended
topology runs the API behind a load balancer with auto-scaling, managed PostgreSQL (RDS),
managed Redis (ElastiCache), and S3 for object storage.
