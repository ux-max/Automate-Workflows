# 03 — Triggers: Webhooks Aur Polling Engine (Hinglish)

Workflow tabhi shuru hota hai jab koi **Trigger** execute hota hai. Jaise hi aapki app me koi event hota hai (jaise: koi naya form submit hua, customer ne payment ki, ya naya task add hua), Trigger turant activate ho jata hai aur workflow ke baaki actions ko data pass karta hai.

---

## 1. 3 Tarah Ke Triggers

| Trigger Ka Type | Speed | Kiske Liye Best Hai? |
| :--- | :--- | :--- |
| **Webhooks Setup by Instructions** | Instant (Palk jhapkte hi) | Jin apps mein Webhook URL paste karne ka option dashboard me hota hai (e.g. Stripe, Shopify, Razorpay, GitHub, Google Forms). |
| **Webhooks Setup by API Request** | Instant (Real-time) | Aisi modern apps jahan webhook register karne ke liye ek API endpoint diya hota hai (REST Hooks). |
| **Polling to Check New Data** | 5 se 15 Minute | Purani ya basic APIs jahan webhooks nahi hote, aur Automate Workflows ko baar-baar jaakar check karna padta hai. |

---

## 2. Trigger Builder Drawer Ke Fields

Jab aap **"Add Trigger"** par click karte hain ya kisi trigger ko edit karte hain, toh right side se ek drawer khulta hai:

### 1. Basic Fields
- **Trigger Display Name** (`name`):
  - *Example*: `New Lead Captured` ya `Payment Successful`.
  - *Matlab*: User ko workflow builder me yahi naam dikhayi dega.
- **Trigger Key** (`key`):
  - *Example*: `new_lead_captured`.
  - *Matlab*: System ki internal unique id. Iske zariye hi variables banenge jaise `{{step.new_lead_captured.email}}`.
- **Trigger Description** (`description`):
  - *Example*: `Triggers automatically whenever a new customer registers on your website.`
  - *Matlab*: User ko samajhane ke liye chhota sa guide.
- **Trigger Type Dropdown**:
  - Teen options me se ek chunein: Webhooks Setup by Instructions, Webhooks Setup by API Request, ya Polling.

---

## 3. Mode 1: Webhooks Setup by Instructions (Instant Catch)

### Yeh Kaise Kaam Karta Hai?
Yeh sabse aasan aur reliable tareeqa hai.
1. Automate Workflows aapko ek unique **Webhook Listener URL** deta hai:
   `https://automate-workflows.com/api/hooks/catch/app_slug/trg_12345`
2. End-user is URL ko copy karke apne third-party software (jaise Stripe, Razorpay ya CRM) ke webhook section mein paste kar deta hai.
3. Jaise hi wahan event hoga, third-party software is URL par JSON data bhej dega.

### Live Webhook Capture Listener (Testing)
- Drawer mein **"Capture Webhook Response"** button par click karein.
- System listening mode me chala jayega (`Waiting for Webhook Response...`).
- Ab aap apne third-party software se ek test event fire karein (ya drawer me diye gaye **"Send Test Ping Now"** button ko dabayein, ya Postman se request bhejein).
- Jaise hi data aayega, green checkmark aayega:
  `✓ Sample Webhook Captured! Output fields updated below.`
- JSON response ke saare keys (jaise `email`, `name`, `amount`, `currency`) nikaal kar platform unhe **Trigger Output Variables Table** mein daal dega!

---

## 4. Mode 2: Webhooks Setup by API Request (REST Hooks)

### Yeh Kaise Kaam Karta Hai?
Isme end-user ko manually URL copy-paste nahi karna padta. Jab user workflow on karta hai, Automate Workflows backend se 3rd-party API ko call karke webhook register kar deta hai.

### Fields:
- **HTTP Method**: `POST` (usually), `GET`, `PUT`, `DELETE`, `PATCH`.
- **API Endpoint URL**: Service ka subscription URL (e.g. `https://api.yourdomain.com/v1/webhooks`).
- **Send Test Request**:
  - Drawer me **"Send Test Request"** button dabane par test payload bhejkar check kiya jata hai ki API `200 OK` return kar rahi hai ya nahi.
  - Wahan se aane wala sample data output variables ban jata hai.

---

## 5. Mode 3: Polling to Check New Data

### Yeh Kaise Kaam Karta Hai?
Agar kisi 3rd-party service mein webhooks ka support nahi hai, toh platform har 5 ya 10 minute baad unke server ko ping karke dekhta hai ki koi naya record aaya kya.

### Fields:
- **Polling Query URL**: Endpoint jahan se records ki list aati hai (e.g. `https://api.acme.com/v1/orders?sort=desc`).
- **Polling Frequency**:
  - `Every 5 minutes (Recommended)`
  - `Every 10 minutes`
  - `Every 15 minutes`
- **Deduplication Field Key**:
  - *Bohat zaroori field*: e.g. `id` ya `updated_at`.
  - *Kyun zaroori hai?*: Automate Workflows yaad rakhta hai ki kaunsa `id` pehle process ho chuka hai. Sirf **naye IDs** aane par hi workflow run hoga, taaki ek hi customer ke liye baar-baar duplicate workflow na chale!

---

## 6. Trigger Output Variables Table

Output variables table woh data hota hai jo trigger hone ke baad agle action steps ko milta hai:

| Field Key | Display Label | Data Type | Sample Value |
| :--- | :--- | :--- | :--- |
| `customer_email` | Customer Email | string | `rahul.sharma@example.com` |
| `amount` | Transaction Amount | number | `4999.00` |
| `status` | Payment Status | string | `PAID` |

Jab koi user workflow banayega, toh woh bina code likhe direct token select kar sakega:
```
{{step.new_lead_captured.customer_email}}
```
Aur yeh value direct WhatsApp, Email ya Google Sheet wale agle action me pass ho jayegi!
