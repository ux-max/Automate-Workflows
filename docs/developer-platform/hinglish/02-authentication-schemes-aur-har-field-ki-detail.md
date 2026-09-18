# 02 — Authentication Schemes Aur Har Ek Field Ka Matlab (Hinglish)

Authentication ka kaam yeh ensure karna hota hai ki jab koi end-user workflow mein aapki app use kare, toh uska account surakshit (secure) tareeqe se connect ho sake.

App Builder ke **Authentication** tab mein authentication ko **4 sequential steps** mein divide kiya gaya hai:
- **Step 1**: Select Authentication Type
- **Step 2**: Configuration (OAuth 2.0, Parameters, ya Basic Auth)
- **Step 3**: User Credentials (Visual Fields for End-Users)
- **Step 4**: Connection Verification & Label Templating *(No Auth select karne par yeh automatically hide ho jata hai)*

---

## 1. 5 Standardized Auth Schemes

Developer Platform mein 5 types ki Authentication schemes aati hain (sabke icons consistent blue color ke hain):

```
1. OAuth 2.0 (User Authorization) ─── Login popup ke zariye permission grant karna (Globe Icon)
2. Parameters                     ─── Query, Path ya Body parameters me token/keys bhejna (Key Icon)
3. Bearer Token                   ─── Header me 'Authorization: Bearer <token>' + Multi-Auth (Lock Icon)
4. Basic Authentication           ─── Username aur Password ko Base64 encode karke bhejna (ShieldCheck Icon)
5. No Authentication              ─── Open APIs (Steps 2, 3 aur 4 automatically hide ho jate hain) (Globe Icon)
```

> [!NOTE]
> Puraane mixed-color icons (amber, purple, green) ko standard blue design system se replace kar diya gaya hai. Aur puraana alag se "API Key" option ab **Parameters** mein hi consolidate ho chuka hai.

---

## 2. Scheme 1: OAuth 2.0 (User Authorization)

### Yeh Kaise Kaam Karta Hai?
Yeh wahi system hai jisme user ko password nahi dena padta, balki ek popup khulta hai (jaise "Sign in with Google" ya "Authorize with HubSpot").
1. User **Connect Account** par click karta hai.
2. Automate Workflows service ke **Authorization URL** par user ko redirect karta hai.
3. User wahan login karke **"Allow"** button dabata hai.
4. Service Automate Workflows ke callback URL par ek **Code** bhejti hai.
5. Automate Workflows backend se **Access Token URL** ko call karke us code ke badle `access_token` le leta hai.
6. Jab token expire hota hai, toh platform bina user ko pareshan kiye **Refresh URL** se naya token le leta hai.

### Har Ek Field Ka Matlab Aur Uski Value Kahan Se Milegi:

| Field Ka Naam | Kahan Se Milegi? | Asal Kaam / Technical Working |
| :--- | :--- | :--- |
| **Authorization URL** | 3rd-party Developer Console ya API Docs se | Browser mein khulne wala login link jahan user permissions approve karta hai (e.g. `https://accounts.google.com/o/oauth2/v2/auth`). |
| **Access Token URL** | 3rd-party API Docs se | Backend endpoint jahan code exchange hota hai aur access token milta hai (POST request). |
| **Refresh URL** (Optional) | 3rd-party API Docs se | Token expire hone par naya token lene ka URL (agar blank ho toh Access Token URL hi use hota hai). |
| **Client ID** | 3rd-party portal par App register karne par | Aapki app ki public identity. Isme direct string ya `{{common.CLIENT_ID}}` daal sakte hain. |
| **Client Secret** | 3rd-party portal par App register karne par | App ka secret password. Hamesha `{{common.CLIENT_SECRET}}` use karein taaki plaintext leak na ho. |
| **Scopes** | 3rd-party API Documentation | Permission list (e.g. `contacts.read contacts.write offline_access`). Space ya comma se separate hoti hai. |
| **PKCE Enabled** | API Security Guidelines | Modern single-page apps ya mobile apps ke liye code verifier security feature. Agar API require kare toh on karein. |
| **Redirect / Callback URL** | Platform khud generate karta hai | Is URL ko copy karke 3rd-party app settings ke "Allowed Redirect URIs" whitelist me paste karna padta hai. |

---

## 3. Scheme 2: Parameters (Custom Query/Path/Body Auth)

### Yeh Kaise Kaam Karta Hai?
Kayi aisi APIs hoti hain jo standard Bearer token use nahi kartin. Woh kehti hain ki API key ko URL query parameter mein bhejo (jaise `?api_key=XYZ`), ya request body mein bhejo, ya subdomain do (jaise `https://{subdomain}.company.com`).
Iske liye **Parameters** scheme use hoti hai.

### Step 2: `Set Body/Query/Path Parameters` Checkbox
Jab aap is checkbox ko tick karte hain, toh visual parameter rows ban jaati hain:

1. **Parameter Key**: API ko jo exact field name chahiye (e.g. `api_key`, `access_token`, `tenant_id`, `subdomain`).
2. **Settings Gear (⚙) Drawer**:
   - **Display Label**: User ko form mein kya likha hua dikhai dega (e.g. `Apna Secret API Key Dalein`, `Workspace Subdomain`).
   - **Field Type**:
     - `Text (String)`: Normal text input.
     - `Password`: Bullet points (••••) mein hide hone wala secret field.
     - `Number`: Sirf numbers allow karega.
     - `Boolean`: True/False ka toggle switch.
     - `Dropdown`: Pre-defined options ki list.
   - **Placeholder Text**: Example format jo box ke andar halka-halka dikhta hai (e.g. `key_live_••••••••`).
   - **Help Instruction**: Niche likhi instruction jo user ko batati hai ki yeh key unke dashboard me kahan milegi.
   - **Required Field Switch**: On karne par user is field ko khali nahi chhod sakta.
3. **Icons & Controls**:
   - `❐+` (Duplicate): Row ko clone karein.
   - `⋮⋮` (Drag handle): Rows ko upar-niche karke order badlein.
   - `🗑` (Delete): Row ko delete karein.

> [!IMPORTANT]
> Authentication ke Step 2 mein se custom HTTP Headers ko hata diya gaya hai taaki configuration simple aur clean rahe. Agar aapki API ko custom headers chahiye, toh unhe **Actions** tab ke **HTTP Headers** section mein configure kiya jata hai.

---

## 4. Scheme 3: Bearer Token

### Yeh Kaise Kaam Karta Hai?
Bearer Token sabse common API method hai. Isme user ka Personal Access Token (PAT) ya API Key automatically is format mein Header ke zariye bheji jaati hai:
```http
Authorization: Bearer <user_token>
```

> [!NOTE]
> Puraana rich text configuration card hata diya gaya hai. Ab Bearer Token bilkul single-click aur clean tareeqe se configure hota hai.

### Multi-Auth Feature: `Enable Parameters Auth (Multi-Auth)`
Kayi tools aise hote hain (jaise Automate Workflows, Notion, Stripe) jahan token toh Bearer hota hai, par API call karte waqt user se unka `Account ID` ya `Subdomain` bhi poochna zaroori hota hai.
- **Jab Multi-Auth ON hota hai**:
  - Automate Workflows Bearer token header mein automatically bhejega.
  - Aur Step 2 mein **Set Body/Query/Path Parameters** khul jayega, jahan aap user se extra fields (jaise `Organization ID`) maang sakte hain.
- **Jab Multi-Auth OFF hota hai**:
  - Sirf Bearer Token maanga jayega aur directly Header me jayega.

---

## 5. Scheme 4: Basic Authentication

### Yeh Kaise Kaam Karta Hai?
Legacy APIs (jaise puraane Jira, cPanel, Mailgun) Basic Auth use karte hain. Isme Username aur Password ko Base64 encode karke header bheja jata hai:
```http
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```
- **Username Label**: User ko kya label dikhana hai (e.g. `API Username` ya `Email Address`).
- **Password Label**: Password ka label (e.g. `API Secret Password` ya `Personal Token`).
- **Help Instructions**: Guidance text.

---

## 6. Scheme 5: No Authentication (Public API)

### Yeh Kaise Kaam Karta Hai?
Agar aap aisi API integrate kar rahe hain jisme kisi password, key ya login ki zaroorat nahi hai (jaise public weather API, currency rates feed, ya public open data):
- Jab aap **No Authentication** select karte hain, toh **Step 2 (Configuration)**, **Step 3 (User Credentials)**, aur **Step 4 (Connection Verification & Label Templating)** automatically **chhip (hide) jaate hain**.
- User ko koi account connect nahi karna padta, woh direct Triggers aur Actions use kar sakta hai.

---

## 7. Step 4: Connection Verification & Label Templating

(No Authentication ko chhodkar, baaki sabhi schemes mein Step 4 aati hai):

1. **Connection Test URL**:
   - Ek aisa lightweight API URL jo login check karta hai (e.g. `https://api.example.com/v1/me` ya `https://api.example.com/v1/user/profile`).
2. **HTTP Method**: `GET` ya `POST` (usually `GET`).
3. **Expected Status Code**: `200` OK.
   - Jab user account jodega, Automate Workflows is URL par live request bhejega. Agar response `200` aaya, toh connection successful ho jayega; agar `401 Unauthorized` aaya toh user ko error dikha dega.
4. **Connection Label Template**:
   - Syntax: `{{email}}` ya `{{email}} ({{account_id}})`.
   - Jab user ek hi app ke 2-3 accounts jode (jaise Personal account aur Business account), toh dropdown me use kya naam dikhega, yeh is template se decide hota hai.
