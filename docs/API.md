# API Overview

This document sketches the REST API surface for the JCred backend
(Node.js + Express, JWT auth). It is a design reference, not yet implemented.

> All endpoints are served over HTTPS and (unless noted) require a valid JWT in the
> `Authorization: Bearer <token>` header.

## Conventions

- Base path: `/api/v1`
- Content type: `application/json` (file uploads use `multipart/form-data`)
- Errors return a JSON body: `{ "error": { "code": "...", "message": "..." } }`

## Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register with email and password |
| POST | `/auth/login` | Login with email and password |
| POST | `/auth/otp/request` | Request a phone OTP |
| POST | `/auth/otp/verify` | Verify a phone OTP |
| POST | `/auth/google` | Google Sign-In |
| POST | `/auth/apple` | Apple Sign-In |
| POST | `/auth/2fa/enable` | Enable two-factor authentication |
| POST | `/auth/2fa/verify` | Verify a 2FA challenge |
| POST | `/auth/refresh` | Refresh an access token |
| POST | `/auth/logout` | Revoke the current session |
| GET | `/auth/sessions` | List active sessions |
| DELETE | `/auth/sessions/:id` | Revoke a specific session |

## Vault Items (Documents & Credentials)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/items` | List vault items (filterable by type/tag) |
| POST | `/items` | Create a credential / secure note |
| POST | `/items/upload` | Upload a document (multipart) |
| GET | `/items/:id` | Get an item's metadata |
| PUT | `/items/:id` | Update an item |
| DELETE | `/items/:id` | Delete an item |
| GET | `/items/:id/versions` | List version history |
| GET | `/items/:id/download` | Download a document |

## Sharing & Access Control

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/items/:id/share` | Share an item with a member at a permission level |
| GET | `/shared-with-me` | Items shared with the current user |
| POST | `/access-requests` | Request access to an item |
| POST | `/access-requests/:id/approve` | Approve an access request |
| POST | `/access-requests/:id/deny` | Deny an access request |
| POST | `/emergency-access` | Trigger an emergency access request |

## Family Management

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/families` | Create a family group |
| POST | `/families/:id/invite` | Invite a member |
| POST | `/families/:id/members/:userId/approve` | Approve a member |
| DELETE | `/families/:id/members/:userId` | Remove a member |
| PUT | `/families/:id/members/:userId/role` | Assign a role |

## Notifications

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/notifications` | List notifications |
| POST | `/notifications/:id/read` | Mark a notification read |
| POST | `/devices/register` | Register an FCM device token |

## Activity Logs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/activity` | List the current user's activity |
| GET | `/admin/activity` | (Admin) List system-wide activity |

## Admin

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/users` | List/manage users |
| POST | `/admin/users/:id/suspend` | Suspend an account |
| GET | `/admin/analytics` | View analytics |
| GET | `/admin/subscriptions` | Manage subscriptions |
| GET | `/admin/settings` | System settings |
