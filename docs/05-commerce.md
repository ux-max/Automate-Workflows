# 05 — Commerce Nodes

> E-commerce and payment processing integrations.

---

## 🛍️ Shopify

| Property | Value |
|----------|-------|
| **App ID** | `shopify` |
| **Icon** | `ShoppingBag` |
| **Category** | Commerce |
| **Auth Type** | API Key / Admin Access Token (Actions) / None (Webhook Trigger) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Instant Webhook trigger URL. Admin API Access Token for store actions. |

### 🔗 How to Setup Webhook in Shopify (Automate Workflows-Style)
1. Add Shopify as Step 1 (Trigger) and select target event (e.g. `New Order Created`).
2. Copy the unique **Webhook Capture URL** from the setup drawer.
3. In Shopify Admin, go to **Settings > Notifications > Webhooks > Create webhook**.
4. Select the matching Event/Topic (e.g. `Order creation`), set Format to **JSON**, and paste the URL.
5. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Automatically flattens nested customer profiles and shipping addresses into clean tokens like `{{step_1.customer_first_name}}`, `{{step_1.total_price}}`, `{{step_1.shipping_address_city}}`.
   - **Advanced (`No`)**: Preserves raw nested line items array and complex JSON schema.
6. Click **Simulate Test Event** in Automate Workflows to test downstream variable mapping immediately!
7. **Actions Authentication**: For store management actions (Add Note, Adjust Stock, Create Product), provide an **Admin API Access Token** created under **Shopify Admin > Settings > Apps and sales channels > Develop apps**. No public Shopify app store listing is required.


### ⚡ Triggers (5)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `new_order` | New Order Created | Fires when customer completes order checkout | Instant |
| 2 | `order_fulfilled` | Order Fulfilled | Fires when order fulfillment status changes | Instant |
| 3 | `order_cancelled` | Order Cancelled / Refunded | Fires when order is cancelled or refunded | Instant |
| 4 | `new_customer` | New Customer Registered | Fires when customer account is created | Instant |
| 5 | `low_inventory` | Low Stock Inventory Level Alert | Fires when product inventory drops below safety threshold | Instant |

### ▶️ Actions (5)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `add_order_note` | Add Internal Order Note | Appends internal note to Shopify order |
| 2 | `update_order_tags` | Update Order Tags | Adds or removes tags on order |
| 3 | `create_discount_code` | Generate Custom Discount Coupon | Creates unique promo code |
| 4 | `update_inventory` | Adjust Product Stock Quantity | Updates available inventory count |
| 5 | `create_product` | Create New Product Catalog Item | Adds product title, price, and SKU |

### 📋 Action Schema: Update Order / Add Note

**Action ID:** `add_order_note`

| Field ID | Label | Type | Required | Supports Mapping |
|----------|-------|------|----------|:----------------:|
| `order_id` | Shopify Order ID | text | ✅ | ✅ |
| `order_note` | Internal Staff Note | textarea | ❌ | ✅ |
| `order_tags` | Order Tags to Add | text | ❌ | ✅ |

**Sample Output:**
```json
{
  "order_id": "5129481920",
  "note_added": true,
  "tags": ["VIP_CUSTOMER", "PROCESSED"],
  "status": "SUCCESS"
}
```

---

## 💳 Razorpay

| Property | Value |
|----------|-------|
| **App ID** | `razorpay` |
| **Icon** | `CreditCard` |
| **Category** | Commerce |
| **Auth Type** | API Key (Key ID + Key Secret) |
| **Sync Mode** | Webhook URL (Automate Workflows-Style) |
| **Notes** | Instant Webhook trigger URL. Key ID + Key Secret for actions. |

### 🔗 How to Setup Webhook in Razorpay (Automate Workflows-Style)
1. Copy the **Webhook Capture URL** from the trigger setup drawer.
2. In Razorpay Dashboard, navigate to **Settings > Webhooks > + Add New Webhook**.
3. Paste the URL into the **Webhook URL** field.
4. Check the event box matching your trigger (e.g. `payment.captured`).
5. **Simple Response (Auto-Flattening)**:
   - **Simple (`Yes` — Default)**: Automatically unpacks `payload.payment.entity` into direct tokens such as `{{step_1.amount}}`, `{{step_1.email}}`, `{{step_1.contact}}`, `{{step_1.status}}`.
   - **Advanced (`No`)**: Keeps the full nested Razorpay webhook envelope.
6. Click Save, then click **Simulate Test Event** in Automate Workflows.
7. **Actions Authentication**: For payment link generation and refunds, input your **Key ID** and **Key Secret** generated in **Settings > API Keys**.

### ⚡ Triggers (4)

| # | Trigger ID | Name | Description | Type |
|---|-----------|------|-------------|------|
| 1 | `payment_captured` | Payment Captured | Fires when payment is successfully charged | Instant |
| 2 | `payment_failed` | Payment Failed | Fires on transaction error/decline | Instant |
| 3 | `refund_created` | Refund Processed | Fires when refund is issued to customer | Instant |
| 4 | `subscription_charged` | Recurring Subscription Charged | Fires on automated subscription billing renewal | Instant |

### ▶️ Actions (4)

| # | Action ID | Name | Description |
|---|----------|------|-------------|
| 1 | `create_payment_link` | Create Sharable Payment Link | Generates sharable payment link URL |
| 2 | `issue_refund` | Issue Partial or Full Refund | Triggers refund for charge ID |
| 3 | `cancel_subscription` | Cancel Customer Subscription | Cancels auto-renewing subscription |
| 4 | `create_order` | Create Payment Order ID | Generates Razorpay order token for checkout integration |

### 📋 Action Schema: Create Payment Link

**Action ID:** `create_payment_link`

| Field ID | Label | Type | Required | Default | Supports Mapping |
|----------|-------|------|----------|---------|:----------------:|
| `amount` | Amount (in standard units) | number | ✅ | — | ✅ |
| `currency` | Currency | select | ✅ | `INR` | ✅ |
| `customer_name` | Customer Name | text | ✅ | — | ✅ |
| `customer_email` | Customer Email | text | ❌ | — | ✅ |
| `customer_phone` | Customer Phone (+ Country Code) | text | ❌ | — | ✅ |
| `receipt_id` | Internal Receipt / Reference ID | text | ❌ | — | ✅ |

**Currency Options:**
| Value | Label |
|-------|-------|
| `INR` | INR (Indian Rupee ₹) |
| `USD` | USD (US Dollar $) |
| `EUR` | EUR (Euro €) |

**Sample Output:**
```json
{
  "payment_link_id": "plink_H3892kf92",
  "short_url": "https://rzp.io/i/Xy78aZ",
  "amount": 99900,
  "currency": "INR",
  "status": "created"
}
```

### How It Works

1. **Instant Webhook Ingestion**: Receives payment callbacks directly from Razorpay's servers within milliseconds of capture or failure.
2. **Normalized Currencies & Decimals**: Converts minor currency units (paise/cents) into human-readable amounts for easy reporting.
3. **Automated Customer Communications**: Route captured payments into WhatsApp confirmation messages, customer invoice emails, and CRM deal upgrades.
4. **Action Integration**: Programmatically create payment links with custom expiry or issue full/partial customer refunds.

---

*← [Previous: Communication & Notifications](./04-communication-notifications.md) | [Back to Index](./README.md) | [Next: Scheduling & Productivity →](./06-scheduling-productivity.md)*
