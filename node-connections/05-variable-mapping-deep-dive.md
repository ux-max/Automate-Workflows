# 05 — Variable Mapping & Flattening Engine Deep-Dive

> A technical deep-dive into how raw platform JSON payloads are ingested, recursively flattened into accessible dot-notation tokens, presented in the Variable Picker UI, and resolved dynamically at runtime.

---

## 🔬 The Lifecycle of a Variable Token

```
┌─────────────────────────┐
│  1. External Platform   │ Shopify / HubSpot / WhatsApp emits raw JSON event
└────────────┬────────────┘
             │ HTTP POST / REST Poll
             ▼
┌─────────────────────────┐
│ 2. Ingestion Listener   │ Validates HMAC signature or OAuth token, caches raw payload
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Flattening Engine    │ Recursively unpacks nested JSON into flattened key-value pairs
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. Variable Catalog     │ Indexes tokens: `{{step_1.key}}` with display name & sample data
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 5. UI Presentation      │ `VariablePicker.tsx` lists tokens with category badges & search
└────────────┬────────────┘
             │ User clicks token
             ▼
┌─────────────────────────┐
│ 6. Pill Rendering       │ Rendered as clickable pill `[ 👤 step_1.email ]` in `VariablePillInput`
└────────────┬────────────┘
             │ Serialized as `{{step_1.email}}`
             ▼
┌─────────────────────────┐
│ 7. Runtime Resolution   │ Execution runner interpolates tokens against live step outputs
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 8. Target API Dispatch  │ Outbound request dispatched with fully resolved real-world data!
└─────────────────────────┘
```

---

## ⚙️ The Recursive Flattening Engine Algorithm

When a platform transmits a deeply nested payload, standard UI inputs cannot easily bind to nested object properties. Automate Workflows employs a recursive dictionary flattening algorithm:

### Algorithm Logic:
```typescript
function flattenPayload(
  obj: Record<string, any>,
  prefix = "",
  result: Record<string, any> = {},
  isSimpleMode = true
): Record<string, any> {
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    const fullPath = prefix ? `${prefix}_${key}` : key

    if (val === null || val === undefined) {
      result[fullPath] = ""
    } else if (Array.isArray(val)) {
      if (!isSimpleMode) {
        // Advanced Mode: Preserve raw array for Iterator / Code Runner
        result[fullPath] = val
      }
      // Simple Mode: Expose first item fields and array length
      result[`${fullPath}_count`] = val.length
      val.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          flattenPayload(item, `${fullPath}_${index}`, result, isSimpleMode)
        } else {
          result[`${fullPath}_${index}`] = item
        }
      })
    } else if (typeof val === "object") {
      flattenPayload(val, fullPath, result, isSimpleMode)
    } else {
      result[fullPath] = val
    }
  }
  return result
}
```

### Transformation Example:

#### Input Raw Platform JSON:
```json
{
  "order": {
    "id": 98412,
    "buyer": {
      "name": "Sarah Jenkins",
      "address": {
        "city": "London",
        "postcode": "EC1A 1BB"
      }
    }
  }
}
```

#### Flattened Variable Catalog:
- `step_1.order_id` → `98412`
- `step_1.order_buyer_name` → `"Sarah Jenkins"`
- `step_1.order_buyer_address_city` → `"London"`
- `step_1.order_buyer_address_postcode` → `"EC1A 1BB"`

---

## 🎨 UI Presentation: The Variable Picker & Pill Input

### 1. `VariablePicker.tsx`
- **Context-Aware Scoping:** The picker automatically inspects the canvas step index. If the user is on Step 3, the picker only exposes outputs from Step 1 and Step 2.
- **Search Filtering:** Live search allows instant filtering across all upstream step keys, labels, and sample values.
- **App Badging & Icons:** Each variable displays the originating app's official icon, color theme, and step title (e.g. `Step 1 • Shopify Order Paid`).

### 2. `VariablePillInput.tsx`
- **Visual Tokenization:** Replaces raw mustache strings like `{{step_1.order_id}}` with sleek, rounded, colored pill badges.
- **Keyboard Shortcut (`/`):** Typing `/` anywhere inside the input immediately summons the variable picker at cursor position.
- **Press `/` Trigger:** An external button is rendered alongside mapped inputs for clear discoverability.

---

## 🚀 Runtime Resolution & Interpolation Engine

During workflow execution:
1. **Context Accumulation:** As each step executes successfully, its response payload is stored in the execution state dictionary:
   ```javascript
   executionMemory["step_1"] = {
     order_id: "ORD-98412",
     customer_email: "sarah@acme.com",
     amount: 1450.00
   }
   ```

2. **Template String Interpolation:**
   When an action step executes, its configured field mappings undergo dynamic token replacement:
   ```javascript
   function interpolateTemplate(templateStr, executionMemory) {
     if (typeof templateStr !== "string") return templateStr

     return templateStr.replace(/\{\{(?:step_)?(\d+|[a-zA-Z0-9_]+)\.([a-zA-Z0-9_.]+)\}\}/g, (match, stepRef, varPath) => {
       const stepKey = stepRef.startsWith("step_") ? stepRef : `step_${stepRef}`
       const stepData = executionMemory[stepKey]

       if (!stepData) return "" // Safe fallback if step was skipped
       return stepData[varPath] !== undefined ? String(stepData[varPath]) : ""
     })
   }
   ```

3. **Example Resolution:**
   - **Configured Input:** `"Hello {{step_1.customer_first_name}}, your order #{{step_1.order_id}} for ${{step_1.amount}} has been confirmed!"`
   - **Resolved Output:** `"Hello Sarah, your order #ORD-98412 for $1450.00 has been confirmed!"`

---

## 🛡️ Error Resilience & Type Safety

| Scenario | Handled Gracefully By | Behavior |
|:---|:---|:---|
| **Missing / Null Field in Webhook** | Safe Fallback Interpolator | Resolves to empty string `""` without throwing runtime exceptions. |
| **Numeric String in Formula Engine** | Formatter Type Coercion | Auto-coerces `"1450.00"` to float `1450.00` before `=SUM()` or math calculations. |
| **Array Passed to Single-Value Field** | JSON Serializer | Converts array to comma-separated string `item1, item2` or JSON representation. |
| **Step Condition Failure (Filter)** | Execution Pipeline Interceptor | Cleanly halts downstream variable evaluation without failing the entire workflow log. |

## ⚙️ Variable Mapping in Custom Parameters & Headers

Custom key-value parameters defined in the **Custom Parameters & Headers** section support the exact same variable interpolation engine as standard action fields:
- Users can map dynamic tokens like `{{step_1.calculated_score}}` or hybrid strings like `Ref-{{step_1.order_id}}`.
- The interpolator resolves keys and values simultaneously before dispatching HTTP headers (`X-*`, `Idempotency-Key`) or merging custom CRM properties (`lead_score`, `utm_campaign`).
- For a comprehensive guide on use cases and execution routing, see [**Custom Parameters & Headers Architecture**](../docs/11-custom-parameters-and-headers.md).

---

*← [Back: Flow Control & Utilities](./04-flow-control-and-utilities.md) | [Next: Custom Parameters & Headers](../docs/11-custom-parameters-and-headers.md) | [Back to Master Index](./README.md)*
