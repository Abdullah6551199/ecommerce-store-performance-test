# Stage 17: Customer Accounts & In-App Notifications

## Overview
Stage 17 introduced a secure, lightweight customer authentication and account management system along with an in-app customer notification service on the test environment `ecommerce-store-perf-test` (https://ecommerce-store-perf-test.zia291930.workers.dev). This functionality empowers customers to manage personal profiles, view order history, save multiple delivery addresses, and receive real-time updates regarding order statuses and promotions directly within the storefront.

---

## 1. Key Features & Architecture

### 1.1 Customer Authentication & Session Management
- **Passwordless / Secure Password Credentials**:
  - Secure bcrypt-hashed passwords with salt rounds for account integrity.
  - Session tokens issued upon authentication, stored via HTTP-only secure cookies (`customer_session`) and verified on edge requests.
- **Customer Database Tables (Cloudflare D1)**:
  - `customers`: Stores `id`, `email`, `password_hash`, `first_name`, `last_name`, `phone`, `avatar_url`, `created_at`, `updated_at`.
  - `customer_sessions`: Session token, customer ID link, IP hash, user agent, expiration timestamp.
  - `customer_addresses`: Multi-address support with `type` (`shipping`, `billing`), `is_default`, `recipient_name`, `street`, `city`, `state`, `postal_code`, `country`.

### 1.2 Customer Account Dashboard (`/account`)
- **Profile Overview**:
  - Customer personal details, contact info, member tier badge, and quick account metrics (total orders, saved addresses).
- **Order History & Tracking**:
  - Displays real-time order history fetched directly from Cloudflare D1 with order ID, total items, pricing, date, and status badges (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
  - Direct link to order tracking detail pages.
- **Address Book Management**:
  - Add, edit, remove, and designate default shipping and billing addresses with automatic form pre-fill at checkout.

### 1.3 In-App Notification Center
- **Notification Model (`customer_notifications`)**:
  - Notification items storing `id`, `customer_id`, `title`, `message`, `type` (`order_update`, `promotion`, `account_alert`, `system`), `link_url`, `is_read`, `created_at`.
- **Customer Notification Bell**:
  - Header bell icon with real-time unread badge counter.
  - Interactive dropdown drawer displaying latest notifications with quick "Mark all as read" and direct deep-linking to relevant orders or promotions.

---

## 2. API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/customer/register` | Register new customer account | No |
| `POST` | `/api/customer/login` | Authenticate customer credentials & set cookie | No |
| `POST` | `/api/customer/logout` | Invalidate customer session & clear cookie | Yes (Customer) |
| `GET` | `/api/customer/me` | Fetch authenticated customer profile & addresses | Yes (Customer) |
| `PUT` | `/api/customer/me` | Update customer personal information | Yes (Customer) |
| `GET` | `/api/customer/orders` | Fetch customer-specific order history | Yes (Customer) |
| `GET` | `/api/customer/notifications` | List notifications for authenticated customer | Yes (Customer) |
| `PUT` | `/api/customer/notifications/[id]`| Mark single notification as read | Yes (Customer) |
| `PUT` | `/api/customer/notifications/read-all`| Mark all notifications as read | Yes (Customer) |

---

## 3. Security & Data Integrity

1. **Edge-Safe Password Verification**: Password verification uses Web Crypto / edge-compatible hashing routines compatible with Cloudflare Workers.
2. **Strict Session Isolation**: Customers can only view and mutate their own profiles, addresses, and order histories; foreign customer ID requests are rejected with `403 Forbidden`.
3. **Graceful Fallbacks**: Guest checkout remains fully operational without forcing account registration, preserving zero-friction purchasing for prospective buyers.

---

## 4. Verification & Testing

| Test Scenario | Description | Status |
| :--- | :--- | :--- |
| **Account Creation** | Register customer with valid email and password | **PASSED** |
| **Login / Session** | Login with credentials, inspect `customer_session` cookie | **PASSED** |
| **Profile Update** | Update phone number and name in dashboard | **PASSED** |
| **Address Management**| Add new shipping address and set as default | **PASSED** |
| **Order Linking** | Place order while logged in, verify order appears in `/account` | **PASSED** |
| **Notifications Dropdown**| Receive order confirmation notification and mark read | **PASSED** |
| **Guest Checkout Regression**| Complete purchase as guest without logging in | **PASSED** |
