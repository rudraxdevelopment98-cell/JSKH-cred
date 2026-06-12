# Data Model

Core entities and relationships for JCred (PostgreSQL). This is a design reference.

## Entity Overview

```
User ──< FamilyMember >── Family
 │                          │
 │                          └──< FamilyGroup
 │
 ├──< VaultItem ──< ItemVersion
 │        │
 │        └──< Share (permission level) >── User
 │        └──< AccessRequest
 │
 ├──< Session
 ├──< Device
 ├──< Notification
 └──< ActivityLog
```

## Entities

### User
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| email | string | unique |
| phone | string | nullable, for OTP |
| password_hash | string | nullable (social logins) |
| role | enum | `super_admin` \| `family_admin` \| `member` |
| two_factor_enabled | bool | |
| status | enum | `active` \| `suspended` |
| created_at | timestamp | |

### Family
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| name | string | |
| created_by | UUID | FK → User |
| created_at | timestamp | |

### FamilyMember (join)
| Field | Type | Notes |
| --- | --- | --- |
| family_id | UUID | FK → Family |
| user_id | UUID | FK → User |
| role | enum | role within the family |
| status | enum | `invited` \| `active` \| `removed` |

### FamilyGroup
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| family_id | UUID | FK → Family |
| name | string | |

### VaultItem
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| owner_id | UUID | FK → User |
| type | enum | password, secure_note, passport, license, insurance, medical, property, certificate, bank, tax |
| title | string | |
| category | string | nullable |
| tags | string[] | |
| s3_key | string | nullable (documents) |
| encrypted_payload | bytea | nullable (credentials/notes) |
| expires_at | timestamp | nullable (expiry reminders) |
| created_at | timestamp | |

### ItemVersion
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| item_id | UUID | FK → VaultItem |
| version | int | |
| s3_key | string | |
| created_at | timestamp | |

### Share
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| item_id | UUID | FK → VaultItem |
| grantee_id | UUID | FK → User |
| permission | enum | private, view_only, view_download, edit, temporary, emergency |
| expires_at | timestamp | nullable (temporary access) |

### AccessRequest
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| item_id | UUID | FK → VaultItem |
| requester_id | UUID | FK → User |
| status | enum | `pending` \| `approved` \| `denied` |
| is_emergency | bool | |

### Session
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK → User |
| device_id | UUID | FK → Device |
| issued_at | timestamp | |
| expires_at | timestamp | |

### Device
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK → User |
| fcm_token | string | for push notifications |
| verified | bool | device verification |

### Notification
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK → User |
| type | enum | access_request, document_shared, expiry_alert, security_alert, family_invitation |
| payload | jsonb | |
| read | bool | |
| created_at | timestamp | |

### ActivityLog
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK → User |
| action | enum | login, document_view, download, upload, permission_change, credential_access |
| target_id | UUID | nullable |
| metadata | jsonb | |
| created_at | timestamp | append-only |
