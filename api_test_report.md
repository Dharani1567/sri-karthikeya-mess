# Phase 6 — API Audit & Endpoint Matrix

## Discovered API Endpoints & Verification Summary

| Endpoint | Method | Role Required | Expected Inputs | Status Code | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Public | None | `200 OK` | ✅ Passed |
| `/api/auth/login` | `POST` | Public | `{ username, password }` | `200 OK` / `401 Unauthorized` | ✅ Passed |
| `/api/auth/refresh` | `POST` | Public | `{ refreshToken }` | `200 OK` / `403 Forbidden` | ✅ Passed |
| `/api/auth/logout` | `POST` | Public | `{ refreshToken }` | `200 OK` | ✅ Passed |
| `/api/auth/me` | `GET` | Authenticated | Bearer Header | `200 OK` / `401 Unauthorized` | ✅ Passed |
| `/api/companies` | `GET` | Authenticated | None | `200 OK` | ✅ Passed |
| `/api/companies` | `POST` | ADMIN / OWNER | `{ name, gstin, billingCycle }` | `201 Created` / `400 Bad Request` | ✅ Passed |
| `/api/companies/:id` | `PUT` | ADMIN / OWNER | `{ name, gstin, rates }` | `200 OK` | ✅ Passed |
| `/api/companies/:id` | `DELETE` | ADMIN / OWNER | `:id` param | `200 OK` / `500 Error` | ✅ Passed |
| `/api/meal-types` | `GET` | Authenticated | None | `200 OK` | ✅ Passed |
| `/api/meal-types` | `POST` | ADMIN / OWNER | `{ name, defaultPrice }` | `201 Created` | ✅ Passed |
| `/api/supply-logs` | `GET` | Authenticated | `?search=&dateRange=&page=` | `200 OK` | ✅ Passed |
| `/api/supply-logs/today-standings` | `GET` | Authenticated | `?date=YYYY-MM-DD` | `200 OK` | ✅ Passed |
| `/api/supply-logs/single` | `POST` | Authenticated | `{ companyId, date, quantities }` | `201 Created` / `200 OK` | ✅ Passed |
| `/api/supply-logs/bulk` | `POST` | Authenticated | `{ companyId, entries }` | `200 OK` | ✅ Passed |
| `/api/invoices` | `GET` | Authenticated | `?monthPeriod=YYYY-MM` | `200 OK` | ✅ Passed |
| `/api/invoices/generate-all` | `POST` | ADMIN / OWNER | `{ monthPeriod, startDate, endDate }` | `200 OK` | ✅ Passed |
| `/api/invoices/:id/payment` | `POST` | ADMIN / OWNER | `{ amount, paymentMethod }` | `200 OK` | ✅ Passed |
| `/api/invoices/:id/pdf` | `GET` | Authenticated | `:id` param | `200 OK` (Application/PDF stream) | ✅ Passed |
| `/api/reports/analytics` | `GET` | Authenticated | `?companyId=all` | `200 OK` | ✅ Passed |
| `/api/reports/export` | `GET` | Authenticated | None | `200 OK` (Application/XLSX download) | ✅ Passed |
