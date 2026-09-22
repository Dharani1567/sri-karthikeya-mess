# Phase 7 — Authentication & RBAC Audit Report

## Authentication Security & RBAC Evaluation

### Supported Roles
1. **`ADMIN`**: Full system access, configuration, partner management, financial invoice generation, and deletions.
2. **`OWNER`**: Business owner privilege matching ADMIN access.
3. **`MANAGER`**: Operations manager, daily meal log entry, bulk back-date entry, history view.
4. **`STAFF`**: Kitchen staff, daily meal quantity entry view.
5. **`CUSTOMER`**: Corporate account contact (read-only invoices).

---

## Role-Based Access Control (RBAC) Matrix

| Endpoint | Public | CUSTOMER | STAFF | MANAGER | OWNER / ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `POST /api/auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/auth/refresh` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/supply-logs` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/supply-logs/single` | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/supply-logs/bulk` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `POST /api/companies` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `DELETE /api/companies/:id` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `POST /api/invoices/generate-all` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `POST /api/invoices/:id/payment` | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Token Lifecycle & Rotation
- **Access Tokens**: Short-lived (1 day), stored in-memory / state, sent via `Authorization: Bearer <token>` header.
- **Refresh Tokens**: Saved in PostgreSQL `RefreshToken` table with 7-day expiration. Revoked upon explicit logout.
- **Privilege Escalation Defense**: Middleware extracts role from verified JWT signature; client cannot mutate role claims.
