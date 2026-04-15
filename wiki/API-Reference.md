# API Reference — مرجع الواجهة البرمجية

## Overview — نظرة عامة

Base Base is a **utility library** with no whitelisted APIs. Instead, it provides Python functions for use within other apps.

## Utility Modules — وحدات المساعدة

### 1. Validators (`base_base.utils.validators`)

Input validation helpers that throw `frappe.ValidationError` on invalid input.

```python
from base_base.utils.validators import (
    validate_required,
    validate_email,
    validate_phone,
    validate_positive_number,
    validate_in_list,
    sanitize_html,
)
```

| Function                                  | Description                   | Throws On                 |
| ----------------------------------------- | ----------------------------- | ------------------------- |
| `validate_required(value, field_label)`   | Check value is not empty/None | Empty/None                |
| `validate_email(email)`                   | Validate email format         | Invalid format            |
| `validate_phone(phone)`                   | Validate international phone  | Invalid format            |
| `validate_positive_number(value, label)`  | Ensure > 0                    | Zero/Negative/Non-numeric |
| `validate_in_list(value, options, label)` | Ensure value in allowed list  | Value not in list         |
| `sanitize_html(value)`                    | Remove XSS from HTML          | Never throws              |

**Example:**

```python
def validate(self):
    validate_required(self.name, "Name")
    validate_email(self.email)
    validate_phone(self.mobile)
    validate_positive_number(self.amount, "Amount")
    validate_in_list(self.status, ["Draft", "Active"], "Status")
```

---

### 2. Formatters (`base_base.utils.formatters`)

Output formatting helpers for display purposes.

```python
from base_base.utils.formatters import (
    format_currency,
    format_percentage,
    format_date_short,
    format_datetime_short,
    truncate,
    format_file_size,
)
```

| Function                               | Input                  | Output Example        |
| -------------------------------------- | ---------------------- | --------------------- |
| `format_currency(1234.56, "USD")`      | Amount, currency code  | `"$1,234.56"`         |
| `format_percentage(75.5, precision=1)` | Value, decimal places  | `"75.5%"`             |
| `format_date_short(date)`              | Date object/string     | `"15 Apr 2026"`       |
| `format_datetime_short(datetime)`      | Datetime object/string | `"15 Apr 2026 14:30"` |
| `truncate("Long text", 50)`            | Text, max length       | `"Long text..."`      |
| `format_file_size(1536000)`            | Bytes                  | `"1.5 MB"`            |

---

### 3. Constants (`base_base.utils.constants`)

Application-wide constants for consistency across apps.

```python
from base_base.utils.constants import (
    DEFAULT_PAGE_SIZE,  # 20
    MAX_PAGE_SIZE,      # 100
    CACHE_SHORT,        # 300 (5 min)
    CACHE_MEDIUM,       # 3600 (1 hour)
    CACHE_LONG,         # 86400 (24 hours)
    STATUS_DRAFT,       # "Draft"
    STATUS_ACTIVE,      # "Active"
    STATUS_CANCELLED,   # "Cancelled"
    STATUS_COMPLETED,   # "Completed"
    DATE_FORMAT,        # "%Y-%m-%d"
    DATETIME_FORMAT,    # "%Y-%m-%d %H:%M:%S"
)
```

---

### 4. Feature Gating (`base_base.utils.feature_gating`)

Manage freemium/premium feature access.

```python
from base_base.utils.feature_gating import (
    require_premium,      # Decorator
    is_feature_enabled,   # Runtime check
    get_app_features,     # Get feature registry
)
```

**Decorator Pattern:**

```python
@frappe.whitelist()
@require_premium("velara", "ai_pricing")
def run_ai_pricing(room):
    """Only runs if premium license active."""
    ...
```

**Runtime Check:**

```python
if is_feature_enabled("vertex", "advanced_analytics"):
    show_advanced_dashboard()
```

---

### 5. Licensing (`base_base.utils.licensing`)

Unified license validation for paid apps.

```python
from base_base.utils.licensing import (
    is_premium_active,     # Quick bool check
    get_license_info,      # Detailed info dict
    validate_key,          # Key validation
    generate_key,          # Key generation (admin)
    clear_license_cache,   # Cache invalidation
)
```

**Check License:**

```python
if is_premium_active("arrowz"):
    enable_premium_features()

info = get_license_info("arrowz")
# {
#   "is_premium": True,
#   "tier": "premium",
#   "source": "frappe_cloud",
#   "expiry": None
# }
```

---

## Error Handling — معالجة الأخطاء

All validators throw `frappe.ValidationError` with bilingual messages.

```python
try:
    validate_email(user_input)
except frappe.ValidationError as e:
    # e contains: "Invalid email address: {input}"
    frappe.log_error(str(e))
```

---

## Best Practices — أفضل الممارسات

1. **Always import from base_base** — don't duplicate validation logic
2. **Use constants** — avoid magic numbers and strings
3. **Cache appropriately** — use CACHE_SHORT/MEDIUM/LONG based on data freshness needs
4. **Handle None gracefully** — formatters return empty string for None input
5. **Test thoroughly** — run base_base tests to ensure compliance
   | `INTERNAL_ERROR` | 500 | Server error | خطأ في الخادم |
