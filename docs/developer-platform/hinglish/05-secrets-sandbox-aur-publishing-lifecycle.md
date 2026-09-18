# 05 — Secrets, Sandbox Testing Aur Publishing Lifecycle (Hinglish)

Jab aapki app ke Triggers, Actions aur Authentication set ho jate hain, toh aakhri phase shuru hota hai: **Secrets ko encrypt karna, Sandbox mein test karna, Beta users ke sath share karna, aur App Store mein publish karwana.**

---

## 1. Overview Tab Aur Environment Secrets (`{{common.KEY}}`)

### Streamlined 2-Step Overview Structure
Overview tab (`/developer/apps/[appId]?tab=overview`) ko 2 simple steps mein rakha gaya hai:
- **Step 1: App Identity & Details**:
  - App Logo (SVG/PNG upload up to 25KB, ya auto fallback icon).
  - App Display Name, Slug, aur Short Tagline.
  - Primary Category (e.g. `CRM`, `Marketing`, `Dev Tools`).
  - Full Description & Use Cases (kam se kam 20 characters zaroori hain).
  *(Note: Standalone Base API URL aur website inputs ko Overview tab se hata diya gaya hai taaki configuration bilkul clean aur simple rahe).*
- **Step 2: Environment Secrets & Common Data**:
  - Workspace level ke sensitive credentials, OAuth Client Secrets aur master tokens ko surakshit (encrypted) rakhne ki jagah.

### Secrets Kaise Add Karein?
1. **Add Secret** button dabayein.
2. **Variable Key**: Hamesha uppercase mein likhein (jaise `CLIENT_SECRET` ya `SIGNING_KEY`).
3. **Secret Value**: Token/Key paste karein. Isme `Eye` / `EyeOff` icon hota hai taaki screen par kisi ko password na dikhe.
4. **Description**: Note likhein (e.g. `Production OAuth Client Secret`).
5. **Mustache Syntax**: Yeh secret automatically ban jata hai:
   ```
   {{common.CLIENT_SECRET}}
   ```
6. Ab aap is secret ko bina kisi code ke:
   - OAuth 2.0 ke Client Secret box mein likh sakte hain.
   - Headers ke andar `Bearer {{common.CLIENT_SECRET}}` likh sakte hain.
   - End-user ko yeh secret kabhi nazar nahi aayega aur na hi client bundle me export hoga!

---

## 2. Testing & Sandbox Tab

Aapko apni app dosto ya clients ko dene se pehle khud chala kar dekhni hoti hai. Iske liye **Testing & Sandbox** tab diya gaya hai:
1. Dropdown se apna banaya koi bhi Trigger ya Action select karein.
2. Form mein test values (jaise apna email, demo customer name) bharein.
3. **Run Live Test** par click karein.
4. System live API ko call karke status code (`200 OK`) aur response time (`138 ms`) batata hai.
5. Sath hi output variables ke pills aate hain jisme **Copy Variable** button hota hai, jisse aap workflow token `{{step.action.field}}` copy kar sakte hain.

---

## 3. Sharing & Testers Tab (Private Beta)

Jab tak aapki app public review pass nahi karti, tab tak aap use **Private Beta** mein chala sakte hain:

### Beta Controls:
- **Private Beta Invite Link**:
  - Format: `https://automate-workflows.com/developer/invite/[token]`
  - **Copy Link** button se link copy karke apne client ya teammate ko bhejein.
  - **Regenerate Token**: Agar link kisi anjaan vyakti ke paas chala jaye, toh naya token generate karke purane link ko band kar sakte hain.
- **Max Beta Testers Quota**:
  - Aap limit set kar sakte hain ki kitne log is invite se app install kar sakte hain (e.g. 50 ya 100 testers).
- **Manual Beta Testers**:
  - User ka email address daalkar use direct invite bhej sakte hain.
- **Tester Onboarding Screen**:
  - Jab tester link open karta hai (`/developer/invite/[token]`), toh use app ka logo, naam aur description dikhta hai.
  - **"Accept Invite & Install App"** click karte hi yeh app uske workspace mein install ho jaati hai!

---

## 4. Publish & Review Tab (Store Submission)

Jab aap chahte hain ki aapki app Automate Workflows ke sabhi users ke liye open ho jaye:

### Automated Pre-Flight Checklist:
Submission button tabhi active hoga jab yeh 5 checklist items green check honge:
1. **App Logo**: SVG ya high-res PNG upload hona chahiye (≤ 25KB).
2. **App Details**: App Name, Slug, aur kam se kam 20 characters ka description hona chahiye.
3. **Authentication**: Auth scheme configured ho aur valid connection verification URL diya ho.
4. **Capabilities**: App ke andar kam se kam 1 Trigger ya 1 Action hona zaroori hai.
5. **Secure Endpoints**: Sabhi URLs secure HTTPS hone chahiye.

### Reviewer Sandbox Credentials:
Review team aapki app ko live check karegi, isliye aapko ek demo test account dena padta hai:
- **Test Account Username/Email**: Sandbox login ID.
- **Test Account Password/Key**: Sandbox API key ya password.
- **Environment URL**: Staging ya sandbox URL.
- **Reviewer Notes**: Reviewers ke liye zaroori instructions.

Submit karne par app ka status **In Review** (`in_review`) ho jata hai.

---

## 5. Admin Review Console (`/developer/admin`)

Platform administrators **Admin Review Console** mein jaakar aapki app ko audit karte hain:

### Reviewer Inspection Drawer:
1. Reviewer app par click karke right-hand **Inspection Drawer** (`w-[820px]`) kholta hai.
2. **Sandbox Credentials**: Ab clean neutral slate card mein dikhti hai (distracting blue highlights aur borders ko hata diya gaya hai).
3. **Run Live Verification Test**:
   - Clean secondary button ke roop mein styled hai.
   - Button dabane par automated test chalta hai: SSL / TLS 1.3 handshake verify hota hai aur response status `200 OK` check hota hai.
4. **Faisla (Decision)**:
   - **Request Changes**: Agar koi kami mili, toh review notes likhkar author ko bhej diya jata hai (`changes_requested`).
   - **Approve to Public Beta**: App pass ho gayi! App turant sabhi users ke liye Public Beta me live ho jaati hai (`public_beta`).
   - **Promote to Verified Partner**: Secondary action ke zariye top connectors ko **Official Verified Partner** status aur blue badge mil jata hai (`published`).
