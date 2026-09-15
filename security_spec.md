# Security Specification & Threat Model

## 1. System Invariants
- **Order Placement**: Any customer (guest or authenticated) can submit a new Order document if it adheres strictly to schema limits (pricing >= 0, string lengths <= 300, valid paymentMethod in ['cod', 'jazzcash'], initial paymentStatus == 'pending', initial orderStatus == 'pending').
- **Order Immutability & Status Locks**: Customers cannot change their paymentStatus to 'paid' or alter order totals/items after creation. Only administrators (e.g., `binteayesha466@gmail.com` or admins collection) can update orderStatus and paymentStatus.
- **Product & Category Integrity**: Public users have read-only access to active products and categories. Only verified administrators can create, update, or delete products or categories.
- **Coupon Protection**: Coupons are read-only for shoppers to validate discounts. Creation and modification are restricted to admins.
- **Customer Profiles**: Users can only read and write their own profile document (`/users/{userId}`) where `request.auth.uid == userId`.
- **Zero Update-Gap**: All updates must validate field constraints, preventing shadow field injections.

## 2. The Dirty Dozen Payloads (Blocked by Security Rules)
1. **Malicious Admin Escalation**: An unauthenticated user attempts to set `isAdmin: true` in `/users/{userId}`.
2. **Order Price Tampering**: An attacker tries to update an existing order's `total` from `5000` to `1`.
3. **Fake Payment Verification**: A customer attempts to update their own order `paymentStatus` to `"paid"` without admin credentials.
4. **Order Status Hijack**: A shopper tries to update `orderStatus` to `"delivered"`.
5. **PII Scraping via List**: An unauthorized user tries to list all documents in `/orders` without matching customerId or admin access.
6. **Product Defacement**: An unauthenticated client attempts `setDoc` on `/products/p1` with malicious pricing.
7. **Coupon Theft/Modification**: An attacker attempts to modify coupon percentage to 99% or create an infinite coupon.
8. **Path ID Poisoning**: A request with a 2KB junk document ID (`{orderId}` > 128 chars).
9. **Oversized Field Denial-of-Wallet**: A customer injects a 500KB string into `customerNotes`.
10. **Profile Impersonation**: Authenticated user A attempts to overwrite `/users/{userIdB}`.
11. **Shadow Field Injection**: Attempt to create an order with hidden fields like `bypassPayment: true`.
12. **Negative Total Order**: Placing an order with `total: -500`.

## 3. Test Runner Coverage
The security rules test suite ensures all 12 malicious payloads receive `PERMISSION_DENIED`.
