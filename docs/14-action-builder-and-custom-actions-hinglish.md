# Action Builder aur Custom Actions — Complete Master Guide (Hinglish)

> **Official Technical Architecture aur User Manual (Hinglish Edition)**
> 
> *Automate Workflows mein Custom (Private) Actions aur Action Builder ka complete guide — iska core philosophy, business benefits, AI-assisted development workflow, sandbox testing harness, deployment lifecycle, aur Workflow Canvas mein use karne ka pura aasan tarika.*

---

## 📑 Table of Contents (Vishay Suchi)

1. [Executive Summary aur Core Philosophy](#1-executive-summary-aur-core-philosophy)
2. [Action Builder aur Custom Actions Kya Hai?](#2-action-builder-aur-custom-actions-kya-hai)
   - [Ecosystem Comparison: Native Apps vs. Custom Apps vs. Private Actions](#ecosystem-comparison)
   - [The "Action-First" Design Philosophy](#the-action-first-design-philosophy)
3. [Action Builder Kyu Beneficial Hai? (Fayde aur Value Proposition)](#3-action-builder-kyu-beneficial-hai-fayde-aur-value-proposition)
   - [1. Zero Integration Roadblocks (Koi Vendor Lock-In Nahi)](#1-zero-integration-roadblocks)
   - [2. AI Prompt Se Seconds Mein Action Ready](#2-ai-prompt-se-seconds-mein-action-ready)
   - [3. Built-In TypeScript Handler aur Schema Compiler](#3-built-in-typescript-handler-aur-schema-compiler)
   - [4. Isolated Interactive Sandbox aur Test Harness](#4-isolated-interactive-sandbox-aur-test-harness)
   - [5. Strict Draft vs. Live Deployment Safety](#5-strict-draft-vs-live-deployment-safety)
   - [6. Workflow Canvas Mein Seamless Direct Integration](#6-workflow-canvas-mein-seamless-direct-integration)
4. [Architecture aur System Flow Diagram](#4-architecture-aur-system-flow-diagram)
5. [Step-by-Step Guide: Custom Action Kaise Banayein aur Use Karein](#5-step-by-step-guide-custom-action-kaise-banayein-aur-use-karein)
   - [Step 1: Action Builder Studio Open Karein (`/custom-actions`)](#step-1-action-builder-studio-open-karein)
   - [Step 2: AI Prompt Dena aur Code Generate Karna](#step-2-ai-prompt-dena-aur-code-generate-karna)
   - [Step 3: Code Diffs aur Helper Functions Review Karna](#step-3-code-diffs-aur-helper-functions-review-karna)
   - [Step 4: Input Fields aur Auth Settings Configure Karna](#step-4-input-fields-aur-auth-settings-configure-karna)
   - [Step 5: Test Harness Mein Real API Request Test Karna](#step-5-test-harness-mein-real-api-request-test-karna)
   - [Step 6: Live Deploy Karna (Deploy Live Modal)](#step-6-live-deploy-karna)
   - [Step 7: Workflow Canvas (`/workflows/editor`) Mein Private Action Use Karna](#step-7-workflow-canvas-mein-private-action-use-karna)
6. [Real-World Case Studies (Asli Zindagi Ke Examples)](#6-real-world-case-studies-asli-zindagi-ke-examples)
   - [Case Study A: Internal Microservice Webhook with HMAC Signature](#case-study-a-internal-microservice-webhook)
   - [Case Study B: Niche SaaS CRM Endpoint](#case-study-b-niche-saas-crm-endpoint)
   - [Case Study C: Google Sheets Batch Delete Operation](#case-study-c-google-sheets-batch-delete-operation)
7. [Security aur Environment Governance](#7-security-aur-environment-governance)
8. [Troubleshooting aur Best Practices (Aam Samasyaon Ka Samadhan)](#8-troubleshooting-aur-best-practices)

---

## 1. Executive Summary aur Core Philosophy

Aam taur par Zapier, Make ya Workato jaise automation platforms mein kaam karte waqt users ek badi samasya face karte hain jise kehte hain **"The Integration Wall"**:
- Maan lijiye aapko Slack ya Google Sheets use karna hai. Official connector mein 4-5 basic actions to hain, lekin aapko jo specific API endpoint chahiye (jaise `batchUpdate`, `deleteSheet`, `customWebhook`, ya `ephemeralAlert`), wo official app mein exist hi nahi karta.
- Agar aapki company ka koi proprietary internal database, ERP system ya CRM hai, to uske liye poori OAuth application register karke approval lene mein developer team ke hafte ya mahine nikal jaate hain.
- Generic HTTP Webhook node har workflow mein manually likhna padta hai, jisme baar-baar headers aur raw JSON body copy-paste karni padti hai.

**Action Builder** is poori problem ko jad se khatam karta hai. Yeh platform users aur developers ko aisi power deta hai jisse wo **sirf ek simple English/Hinglish prompt likh kar** ya direct code edit karke apna manchaha **Private Custom Action** bana sakte hain, live sandbox mein test kar sakte hain, aur turant **Deploy Live** karke apne **Workflow Canvas** mein use kar sakte hain!

---

## 2. Action Builder aur Custom Actions Kya Hai?

### Ecosystem Comparison

Automate Workflows platform par 3 tarah ke integrations hote hain. Aaiye inme farq samjhein:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 AUTOMATE WORKFLOWS ECOSYSTEM                                      │
├───────────────────────────────┬─────────────────────────────────┬────────────────────────────────┤
│ 1. Native / SaaS Suite        │ 2. Developer Platform Apps      │ 3. Action Builder              │
│ (Pre-Built Connectors)        │ (Public / Team OAuth Apps)      │ (Custom Private Actions)       │
├───────────────────────────────┼─────────────────────────────────┼────────────────────────────────┤
│ • Canvas mein pehle se maujood│ • Complex multi-step OAuth apps │ • Specific single actions      │
│ • Slack, HubSpot, Gmail, etc. │ • Custom branding, app portal   │ • AI prompt se instant banta hai│
│ • Standard triggers & actions │ • In-built actions & webhooks   │ • Aapke workspace mein private │
│ • Platform team manage karti  │ • Public distribution ke liye   │ • Turant 1-click live deploy   │
│ • Fixed features set          │ • Poora API schema chahiye      │ • "Action-First" approach      │
└───────────────────────────────┴─────────────────────────────────┴────────────────────────────────┘
```

### The "Action-First" Design Philosophy

Traditional developer platforms mein jab aap koi integration banate hain, to pehle aapko App Name, App Icon, Developer Account, OAuth Redirection URIs, aur Webhook Endpoints set up karne padte hain.

Lekin **Action Builder "Action-First"** approach par kaam karta hai:
- User ko app ke naam ya packaging se matlab nahi hota, user ko apne **kaam (Action)** se matlab hota hai.
- Jaise: *"Mujhe Shopify ka unfulfilled order cancel karna hai"* ya *"Mujhe internal webhook par HMAC signed payload bhejna hai"*.
- Isliye Private Actions ko kisi specific third-party app logo ya app name mein baandh kar nahi rakha jaata.
- Canvas aur App Drawer mein inka card seedha **Action Name** (jaise `Execute Webhook Action`, `Delete Sheet Tab`) aur universal **Zap (⚡)** icon ke sath dikhta hai, jisse koi confusion nahi hoti.

---

## 3. Action Builder Kyu Beneficial Hai? (Fayde aur Value Proposition)

### 1. Zero Integration Roadblocks (Koi Vendor Lock-In Nahi)
Duniya ke kisi bhi tool ya internal microservice ka agar koi REST API ya Webhook endpoint hai, to aapko kisi third-party connector ka wait nahi karna. Aap 1 minute ke andar us API ka custom action bana sakte hain.

### 2. AI Prompt Se Seconds Mein Action Ready
Aapko bas plain language mein batana hai:
> *"Create a Google Sheets action to delete a sheet tab by spreadsheet ID and sheet ID using batchUpdate API"*

Hamara built-in AI engine turant:
- Endpoint URL, HTTP Methods (`POST`, `PUT`, `DELETE`), aur headers analyze karega.
- Production-ready TypeScript execution code likhega jisme error boundaries aur validation pehle se shamil honge.
- Zaroori input fields (jaise `spreadsheet_id`, `sheet_id`) ka dynamic form schema create karega.
- Authentication parameters (Bearer Token, API Key) ko cleanly bind karega.

### 3. Built-In TypeScript Handler aur Schema Compiler
Action Builder mein har action ek robust TypeScript handler ke sath run hota hai:
- `jsonOk(data)`: Successful execution ke liye clean 200 OK structure return karta hai.
- `jsonErr(message, code, debug)`: Kisi bhi network fail, invalid token ya bad request ko safely catch karta hai taki workflow crash na ho.
- Aap jab chahein tab integrated Code Editor mein jaakar ek-ek line code inspect aur customize kar sakte hain.

### 4. Isolated Interactive Sandbox aur Test Harness
Live workflow mein use karne se pehle action ko test karna behad zaroori hai:
- Action Builder ke andar hi **Interactive Test Console** diya gaya hai.
- Wahan aap actual test parameters aur token enter karke **Run Test Request** par click kar sakte hain.
- Response ka HTTP status code (e.g. `200 OK`), request latency (e.g. `157ms`), aur returned JSON payload turant inspect kar sakte hain.

### 5. Strict Draft vs. Live Deployment Safety
- Jab tak aap action ko explicitly live nahi karte, tab tak wo **`Draft`** state mein rehta hai.
- Draft actions live chal rahe workflows ko kabhi affect nahi karte.
- Jab aap **Deploy Live** par click karke confirm karte hain, tabhi wo **`Live`** banta hai aur Workflow Canvas mein selection ke liye available hota hai.
- Agar aap live action mein baad mein AI se koi naya code generate karwate hain, to status dobara safely `Draft` ho jaata hai jab tak aap review karke redeploy na karein!

### 6. Workflow Canvas Mein Seamless Direct Integration
- Deploy hone ke baad, Workflow Editor (`/workflows/editor`) mein **Step 1: Choose App** drawer kholte hi aapko **`Private Actions`** ka category pill milta hai.
- Wahan se 1-click mein action add hota hai.
- **Variable Picker** ke zariye upstream triggers (jaise Form submission ya Webhook) ke variables (`{{trigger.body.email}}`) direct map kiye ja sakte hain!

---

## 4. Architecture aur System Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              ACTION BUILDER KA WORKING FLOW                            │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                        1. User Prompt / Code Modification
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ AI Generation Engine:                                                                 │
│ • TypeScript Handler generate karta hai (`handleExecuteAction`)                       │
│ • Input Fields Schema banata hai (`endpoint_url`, `payload_json`, etc.)               │
│ • Authentication Scheme set karta hai (Bearer Token, API Key)                         │
│ • Line-by-line Diff Summary show karta hai (Additions & Validations)                 │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Test Harness (Sandbox Environment):                                                   │
│ • Real API request dispatch hoti hai test credentials ke sath                         │
│ • Response Latency (ms), Status Code, aur Raw JSON data inspect hota hai              │
│ • Test history persist hoti hai local database mein                                   │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                        2. Deploy Live Confirmation Modal
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ State Transition: `status: "draft"`  ──►  `status: "live"`                            │
│ Action Workspace DB / LocalStorage mein live mark ho jaata hai                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│ Workflow Canvas Ingestion (`/workflows/editor`):                                      │
│ • App Drawer mein "Private Actions" category filter ke andar show hota hai            │
│ • Canvas par Node add hota hai (Vertical & Horizontal dono canvas views mein)         │
│ • Setup Details drawer mein Variable Picker se upstream dynamic values map hoti hain │
│ • Live Workflow run hone par execution engine is handler ko execute karta hai        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step Guide: Custom Action Kaise Banayein aur Use Karein

### Step 1: Action Builder Studio Open Karein
1. Apne **Automate Workflows** dashboard par login karein.
2. Navigation menu mein **Custom Actions** par click karein (URL: `/custom-actions`).
3. Aapke saamne 3-panel **Action Builder Studio** open hoga:
   - **Left Panel (Catalog):** Yahan aapke saare existing actions dikhenge (unke `Draft` ya `Live` badge ke sath) aur `+ New` button.
   - **Center Panel (AI Studio):** Yahan interactive AI conversation, prompt input dock, code diffs, aur status cards honge.
   - **Right Panel (Details Drawer):** Yahan live code editor, schema fields, auth configuration, aur test runner milega.

---

### Step 2: AI Prompt Dena aur Code Generate Karna
1. Left panel mein **`+ New`** button dabayein.
2. Bottom mein prompt input dock mein plain English ya requirement type karein:
   - *Example:* `"Create a custom API action to POST contact details with HMAC signature to an external CRM webhook"`
3. **Send** button dabayein.
4. AI engine kuch seconds analyze karega aur code generate karega:
   - Chat mein aayega: *"Here's what I'll change"* card jisme line numbers ke sath added features dikhenge.
   - Niche aayega: **"Your updated action is ready to deploy"** card jisme line count aur `[Draft]` status hoga.

---

### Step 3: Code Diffs aur Helper Functions Review Karna
1. Ready card par **`View Code`** button par click karein (ya right drawer expand karein).
2. Aapko cleanly formatted TypeScript handler dikhega:
   ```typescript
   // ── Helpers ──
   function jsonOk(data) { 
     return { statusCode: 200, statusMessage: 'OK', success: true, ...data }; 
   }
   function jsonErr(message, code, debug) { 
     return { statusCode: code || 400, statusMessage: message, success: false, error: message, ...(debug ? { _debug: debug } : {}) }; 
   }

   // ── Action Execution Handler ──
   async function handleExecuteAction(body, headers) {
     const token = headers['authorization'] || headers['x-api-key'] || process.env.API_ACCESS_TOKEN;
     if (!token) return jsonErr('Missing required credential: authorization header or token', 401);

     const endpoint = body.endpoint_url || 'https://api.service.com/v1/resource';
     if (!endpoint) return jsonErr('Missing required field: endpoint_url', 400);

     const res = await fetch(endpoint, {
       method: 'POST',
       headers: {
         'Authorization': 'Bearer ' + token,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify(body)
     });
     return res.json();
   }
   ```
3. Aap code ko direct manually bhi edit kar sakte hain ya AI se aur changes karwa sakte hain (jaise: *"Add retry logic if response is 429"*).

---

### Step 4: Input Fields aur Auth Settings Configure Karna
Right drawer mein **Schema** tab par jayein:
- **Authentication:** Apne hisab se chunein (`Bearer Token`, `API Key`, `OAuth 2.0`, ya `None`).
- **Input Fields:** Wo fields check karein jo workflow setup ke dauran user ko dikhenge:
  - `endpoint_url` (Text input, required)
  - `payload_json` (Textarea input, supports mapping)

---

### Step 5: Test Harness Mein Real API Request Test Karna
1. Chat card par ya right drawer mein **`Test Action`** par click karein.
2. Test harness open hoga. Wahan test endpoint aur payload enter karein:
   ```json
   {
     "endpoint_url": "https://api.service.com/v1/resource",
     "payload_json": "{\"name\": \"John Doe\", \"plan\": \"Enterprise\"}"
   }
   ```
3. **Run Test Request** par click karein.
4. Response check karein:
   - **Status:** `200 OK`
   - **Latency:** `157ms`
   - **Response Payload:** Expandable JSON viewer jisme server ka returned response dikhega.

---

### Step 6: Live Deploy Karna (Deploy Live Modal)
1. Jab test successful ho jaye, to blue button **`Deploy Live`** par click karein.
2. Ek popup open hoga: **Deploy Custom Action**.
3. Apna manchaha **Action Name** confirm ya rename karein (jaise: `Execute Webhook Action`).
4. **Deploy** button click karein.
5. Action turant **Live** ho jayega:
   - Status badge change hokar green **`Deployed`** ho jayega.
   - Niche banner aa jayega: *"Action is live! Ready for selection in Workflow Canvas."*
   - Left sidebar mein bhi badge gray `Draft` se green `Live` ban jayega.

---

### Step 7: Workflow Canvas Mein Private Action Use Karna
1. Ab **Workflow Editor** (`/workflows/editor`) par jayein.
2. Workflow canvas par koi unconfigured action node par click karein ya `+ Add Step` dabayein.
3. **Step 1: Choose App** drawer open hoga.
4. Top category filter pills mein se **`Private Actions`** pill select karein.
5. Wahan aapka live deployed action card dikhega:
   - Card Title: `Execute Webhook Action`
   - Subtitle: `Private Action`
   - Status: `Live`
   - Icon: `Zap (⚡)`
6. Card par click karein — canvas par node turant is action ke sath bind ho jayega!
7. **Step 2: Setup Details** drawer open hoga:
   - Apni API key ya secret credentials enter karein.
   - Endpoint URL daalein ya input box ke right side mein bane **Variable Picker (Eye/Tag Icon)** par click karein.
   - Variable Picker smoothly drawer ke aage open hoga (layering fix ke sath), jahan se aap pichhle trigger ka output (jaise `{{trigger.body.customer_email}}`) 1-click mein map kar sakte hain.
8. **Save & Continue** dabayein — aapka customized workflow live run ke liye taiyar hai!

---

## 6. Real-World Case Studies (Asli Zindagi Ke Examples)

### Case Study A: Internal Microservice Webhook with HMAC Signature
- **Problem:** Ek company ko apne internal ERP warehouse ko update karna tha jab bhi website par naya order aaye. Unke server ko SHA-256 HMAC signature security chahiye thi, jo normal Zapier webhook node mein impossible thi.
- **Solution:** Unhone Action Builder mein AI prompt diya: *"Create custom webhook with HMAC-SHA256 signature using secret key"*.
- **Result:** TypeScript handler ne headers mein `X-Signature-SHA256` calculate karke request bheji. Poora setup 3 minute mein ready ho gaya!

### Case Study B: Niche SaaS CRM Endpoint
- **Problem:** Ek sales team local Indian CRM use karti thi jiska koi Zapier ya Make connector exist nahi karta tha.
- **Solution:** Unhone Action Builder mein CRM ke REST API documentation ka endpoint aur `X-API-KEY` header daal kar action banaya `Create Lead in Custom CRM`.
- **Result:** Google Forms submission se direct us CRM mein real-time leads create hone lagi bina kisi developer assistance ke.

### Case Study C: Google Sheets Batch Delete Operation
- **Problem:** Google Sheets ke standard connector se sheet rows add ya update to hoti hain, lekin pura worksheet tab delete karne ka option nahi hota.
- **Solution:** Action Builder se `Delete Sheet Tab` action banaya gaya jo Google ke `batchUpdate` API ko execute karta hai.
- **Result:** Mahine ke aakhir mein purani temporary sheets automatically clean ho jaati hain.

---

## 7. Security aur Environment Governance

1. **Encrypted Runtime Headers:** Workflow configure karte waqt jo bhi sensitive API tokens ya credentials daale jaate hain, wo backend vault mein encrypt rehte hain aur execution ke waqt safe headers mein inject hote hain.
2. **Workspace Privacy:** Aapke Custom Actions sirf aapke workspace ke andar private rehte hain. Jab tak aap unhe Developer Platform ke zariye public marketplace mein submit nahi karte, tab tak koi bahar ka user unhe nahi dekh sakta.
3. **Audit History:** Test harness mein kiye gaye saare test runs ka record (status code, latency, payload) inspect kiya ja sakta hai.

---

## 8. Troubleshooting aur Best Practices (Aam Samasyaon Ka Samadhan)

| Samasya / Sawal | Wajah (Cause) | Samadhan (Solution) |
| :--- | :--- | :--- |
| **Workflow Canvas ke App Drawer mein action nahi dikh raha** | Action abhi tak `Draft` state mein hai | `/custom-actions` par jayein aur **Deploy Live** button dabakar modal confirm karein. |
| **Test request 401 Unauthorized de rahi hai** | API Key ya Bearer Token missing ya invalid hai | Right drawer ke Auth tab mein credential check karein ya valid token enter karein. |
| **Variable Picker drawer ke piche chup raha tha** | Stacking context / Z-index issue | Fixed: Variable Picker ab React Portal ke zariye direct `document.body` par `zIndex: 150` ke sath open hota hai. |
| **Code edit karne par status dobara Draft kyu ho gaya?** | Safety auto-protection | Jab bhi code modify hota hai, platform safely usko `Draft` kar deta hai taki testing ke baad hi new changes live hon. |

---

*Automate Workflows Documentation Team — September 2026*
