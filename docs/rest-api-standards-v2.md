# REST API Design Standards & Best Practices

Dokumen ini berisi panduan lengkap untuk mendesain REST API yang konsisten, scalable, aman, dan mudah dipahami.

---

## 1. URL & Endpoint Convention

### Aturan Dasar
- Gunakan **lowercase** untuk semua URL
- Gunakan **kebab-case** (tanda hubung) untuk multi-word resources
- Gunakan **noun (kata benda)** untuk resource, bukan verb
- Gunakan **plural** untuk collection resources

### Contoh

| ✅ Benar | ❌ Salah |
|----------|----------|
| `/users` | `/getUsers` |
| `/order-items` | `/orderItems` |
| `/products/f47ac10b-58cc-4372-a567-0e02b2c3d479` | `/product/123` |
| `/users/a82bc91c/orders` | `/getUserOrders` |

### Struktur Hierarki
```
GET    /users                    # List semua users
GET    /users/{id}               # Get single user
GET    /users/{id}/orders        # Get orders milik user
GET    /users/{id}/orders/{id}   # Get specific order milik user
```

### Versioning
Gunakan prefix version di URL:
```
/api/v1/users
/api/v2/users
```

---

## 2. HTTP Methods

| Method | Fungsi | Idempotent | Safe |
|--------|--------|------------|------|
| `GET` | Mengambil resource | ✅ | ✅ |
| `POST` | Membuat resource baru | ❌ | ❌ |
| `PUT` | Update seluruh resource | ✅ | ❌ |
| `PATCH` | Update sebagian resource | ❌ | ❌ |
| `DELETE` | Menghapus resource | ✅ | ❌ |

---

## 3. HTTP Status Codes

### Success (2xx)
| Code | Nama | Penggunaan |
|------|------|------------|
| `200` | OK | Request berhasil (GET, PUT, PATCH) |
| `201` | Created | Resource berhasil dibuat (POST) |
| `204` | No Content | Berhasil tanpa response body (DELETE) |

### Client Error (4xx)
| Code | Nama | Penggunaan |
|------|------|------------|
| `400` | Bad Request | Request tidak valid / malformed |
| `401` | Unauthorized | Authentication diperlukan |
| `403` | Forbidden | Tidak punya akses |
| `404` | Not Found | Resource tidak ditemukan |
| `409` | Conflict | Konflik data (duplicate, dll) |
| `422` | Unprocessable Entity | Validasi gagal |
| `429` | Too Many Requests | Rate limit exceeded |

### Server Error (5xx)
| Code | Nama | Penggunaan |
|------|------|------------|
| `500` | Internal Server Error | Error tidak terduga di server |
| `502` | Bad Gateway | Upstream server error |
| `503` | Service Unavailable | Server sedang maintenance |

---

## 4. Request Format

### Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
X-Request-ID: <uuid>
Idempotency-Key: <uuid>  # Diwajibkan untuk method POST pada transaksi krusial
```

### Query Parameters
Gunakan untuk filtering, sorting, dan pagination:
```
GET /users?status=active&sort=-created_at&page=1&limit=20
```

| Parameter | Fungsi | Contoh |
|-----------|--------|--------|
| `filter` | Filter data | `?status=active` |
| `sort` | Sorting (- untuk desc) | `?sort=-created_at` |
| `page` | Halaman | `?page=2` |
| `limit` | Jumlah per halaman | `?limit=20` |
| `fields` | Select fields | `?fields=id,name,email` |
| `search` | Full-text search | `?search=john` |

### Request Body (POST/PUT/PATCH)
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

---

## 5. Response Format

### Struktur Standar - Single Resource
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-12-08T10:30:00Z",
    "updated_at": "2025-12-08T10:30:00Z"
  }
}
```

### Struktur Standar - Collection
```json
{
  "data": [
    { "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "name": "John" },
    { "id": "a82bc91c-3b22-421d-8e4a-938b812b3223", "name": "Jane" }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_count": 100
  }
}
```

### Struktur Error
Setiap respons error **harus** menyertakan `trace_id` (diambil dari header `X-Request-ID`) untuk mempermudah pelacakan log di sisi server.
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "trace_id": "req-9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "details": [
      {
        "field": "email",
        "message": "Email format is invalid"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

---

## 6. Naming Convention

### Field Names
- Gunakan **snake_case** untuk JSON fields
- Konsisten di seluruh API

### Date & Time
- Gunakan format **ISO 8601** dengan timezone UTC
- Format: `YYYY-MM-DDTHH:mm:ssZ`

### Boolean Fields
Gunakan prefix yang jelas: `is_active`, `has_verified_email`, `can_edit`.

### ID Fields
- **Wajib menggunakan UUID v4** untuk setiap ID publik yang diekspos di URL maupun respons JSON untuk mencegah IDOR (*Insecure Direct Object Reference*) dan *data scraping*.
- Jangan mengekspos *auto-increment integer* dari database ke publik.

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "user_id": "a82bc91c-3b22-421d-8e4a-938b812b3223",
  "order_id": "c19fe34b-8d11-4567-8e4a-938b812b3224"
}
```

---

## 7. Pagination

*(Format Offset-based dan Cursor-based tetap sama, namun pastikan nilai cursor mengacu pada UUID).*

---

## 8. HATEOAS (Hypermedia)

Sertakan links untuk navigasi:
```json
{
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "name": "John Doe"
  },
  "links": {
    "self": "/users/f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "orders": "/users/f47ac10b-58cc-4372-a567-0e02b2c3d479/orders"
  }
}
```

---

## 9. Security & Reliability Best Practices

1. **Selalu gunakan HTTPS**
2. **Validasi semua input** di server-side
3. **Sanitize output** untuk mencegah XSS
4. **Gunakan UUID** untuk semua ID resource publik untuk menghindari kebocoran data terstruktur.
5. **Implementasi Idempotency-Key**: Wajibkan header `Idempotency-Key` untuk operasi `POST` (seperti pembayaran atau pembuatan order). Jika request terputus dan diulang dengan key yang sama, server mengembalikan sukses tanpa membuat duplikasi data.
6. **Sertakan Trace ID**: Selalu kembalikan `trace_id` pada respons error.
7. **Implementasi rate limiting**
8. **Gunakan parameterized queries** untuk mencegah SQL injection
9. **Jangan expose sensitive data** di response (password, internal IDs)
10. **Gunakan security headers**:
    ```http
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    X-XSS-Protection: 1; mode=block
    ```

---

## 10. API Documentation

Setiap endpoint harus didokumentasikan menggunakan tools seperti OpenAPI/Swagger, meliputi:
- URL dan HTTP method
- Deskripsi singkat
- Request parameters (query, path, body, wajib tidaknya header tertentu)
- Request/response examples (dengan UUID)
- Possible error codes beserta trace id
- Authentication requirements

---

## Quick Reference

```
URL:        lowercase, kebab-case, plural nouns
Fields:     snake_case
Dates:      ISO 8601 (2025-12-08T10:30:00Z)
IDs:        UUID v4
Success:    200, 201, 204
Errors:     400, 401, 403, 404, 422, 500 (wajib menyertakan trace_id)
Auth:       Bearer token / API key
Pagination: page, limit, cursor
Sorting:    sort=-field (- for DESC)
Safety:     Gunakan Idempotency-Key untuk POST krusial
```
