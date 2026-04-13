# Base Base — Architecture
# القاعدة الأساسية — الهيكلية

> Shared Utility Library for All Arkan Lab Applications

## Overview — نظرة عامة

Base Base is a **pure utility library** (0 DocTypes) providing reusable functions for:
- Input validation
- Output formatting  
- Application constants
- Feature gating (freemium/premium)
- Unified licensing engine

All Arkan Lab apps MUST use `base_base` utilities instead of duplicating logic.

## Technology Stack

- **Backend**: Python 3.14+ / Frappe 16.x
- **Database**: MariaDB 11.x
- **Cache**: Redis (license validation caching)
- **Dependencies**: frappe, frappe_visual, arkan_help

---

## Module Map — خريطة الوحدات

```
base_base/
├── utils/
│   ├── validators.py      # Input validation helpers
│   ├── formatters.py      # Output formatting helpers
│   ├── constants.py       # App-wide constants
│   ├── feature_gating.py  # Feature tier management
│   └── licensing.py       # Unified license engine
├── api/                   # Whitelisted API endpoints
├── services/              # Business logic layer
└── help/                  # Contextual help files
```

---

## Utility Functions Reference

### 1. Validators (`base_base.utils.validators`)

| Function | Description | Parameters | Example |
|----------|-------------|------------|---------|
| `validate_required(value, field_label)` | Raise if value is empty/None | `value`: any, `field_label`: str | `validate_required(doc.name, "Name")` |
| `validate_email(email)` | Validate email format | `email`: str | `validate_email("test@example.com")` |
| `validate_phone(phone)` | Validate phone (international) | `phone`: str | `validate_phone("+1234567890")` |
| `validate_positive_number(value, field_label)` | Ensure value > 0 | `value`: numeric, `field_label`: str | `validate_positive_number(100, "Amount")` |
| `validate_in_list(value, valid_options, field_label)` | Ensure value in allowed list | `value`: any, `valid_options`: list, `field_label`: str | `validate_in_list("Draft", [...], "Status")` |
| `sanitize_html(value)` | Remove XSS from HTML | `value`: str | `sanitize_html(user_input)` |

**Usage Example:**
```python
from base_base.utils.validators import validate_email, validate_phone, validate_required

class MyDocType(Document):
    def validate(self):
        validate_required(self.customer_name, "Customer Name")
        validate_email(self.email)
        validate_phone(self.mobile)
```

---

### 2. Formatters (`base_base.utils.formatters`)

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `format_currency(amount, currency=None)` | Format as currency string | `amount`: float, `currency`: str (optional) | `"$1,234.56"` |
| `format_percentage(value, precision=1)` | Format as percentage | `value`: float, `precision`: int | `"75.5%"` |
| `format_date_short(date_value)` | Short date format | `date_value`: date/str | `"15 Apr 2026"` |
| `format_datetime_short(dt_value)` | Short datetime format | `dt_value`: datetime/str | `"15 Apr 2026 14:30"` |
| `truncate(text, max_length=100)` | Truncate with ellipsis | `text`: str, `max_length`: int | `"Long text..."` |
| `format_file_size(size_bytes)` | Human-readable file size | `size_bytes`: int | `"1.5 MB"` |

**Usage Example:**
```python
from base_base.utils.formatters import format_currency, format_file_size

# In a report or display
total = format_currency(order.grand_total, "SAR")  # "SAR 5,432.10"
size = format_file_size(1536000)  # "1.5 MB"
```

---

### 3. Constants (`base_base.utils.constants`)

| Constant | Value | Description |
|----------|-------|-------------|
| `APP_NAME` | `"base_base"` | App identifier |
| `APP_TITLE` | `"Base Base"` | Display name |
| `APP_PREFIX` | `"BB"` | DocType prefix |
| `APP_COLOR` | `"#6366F1"` | Brand color (Indigo) |
| `DEFAULT_PAGE_SIZE` | `20` | Default pagination |
| `MAX_PAGE_SIZE` | `100` | Max pagination limit |
| `CACHE_SHORT` | `300` | 5 minutes TTL |
| `CACHE_MEDIUM` | `3600` | 1 hour TTL |
| `CACHE_LONG` | `86400` | 24 hours TTL |
| `STATUS_DRAFT` | `"Draft"` | Status constant |
| `STATUS_ACTIVE` | `"Active"` | Status constant |
| `STATUS_CANCELLED` | `"Cancelled"` | Status constant |
| `STATUS_COMPLETED` | `"Completed"` | Status constant |
| `DATE_FORMAT` | `"%Y-%m-%d"` | ISO date format |
| `DATETIME_FORMAT` | `"%Y-%m-%d %H:%M:%S"` | ISO datetime format |

**Usage Example:**
```python
from base_base.utils.constants import DEFAULT_PAGE_SIZE, STATUS_ACTIVE, CACHE_MEDIUM

@frappe.whitelist()
def get_projects(page_size=DEFAULT_PAGE_SIZE):
    return frappe.get_all("Project", filters={"status": STATUS_ACTIVE}, limit=page_size)

# Caching
frappe.cache.set_value("my_key", data, expires_in_sec=CACHE_MEDIUM)
```

---

### 4. Feature Gating (`base_base.utils.feature_gating`)

Manages freemium/premium feature access across all Arkan Lab apps.

**Decorator Pattern:**
```python
from base_base.utils.feature_gating import require_premium

@frappe.whitelist()
@require_premium("velara", "ai_pricing")
def run_ai_pricing(room):
    """This function only works if user has premium license."""
    ...
```

**Runtime Check:**
```python
from base_base.utils.feature_gating import is_feature_enabled

if is_feature_enabled("vertex", "advanced_analytics"):
    show_advanced_dashboard()
else:
    show_basic_dashboard()
```

**App Feature Registry (in hooks.py):**
```python
app_feature_registry = {
    "room_management": "free",
    "ai_pricing": "premium",
    "multi_property": "premium",
}
```

---

### 5. Licensing Engine (`base_base.utils.licensing`)

Unified license validation for all paid Arkan Lab apps.

**API Functions:**

| Function | Description | Returns |
|----------|-------------|---------|
| `is_premium_active(app_name)` | Check if premium is active | `bool` |
| `get_license_info(app_name)` | Get detailed license info | `dict` |
| `validate_key(app_name, key)` | Validate a license key | `bool` |
| `generate_key(app_name, site=None)` | Generate a license key | `dict` |
| `clear_license_cache(app_name)` | Clear cached license state | `None` |

**Priority Order:**
1. Redis cache (TTL 1 hour)
2. Frappe Cloud detection → auto-premium
3. License key in app Settings DocType
4. Default → free tier

**Usage Example:**
```python
from base_base.utils.licensing import is_premium_active, get_license_info

if is_premium_active("arrowz"):
    enable_ai_features()

info = get_license_info("velara")
# {
#   "is_premium": True,
#   "tier": "premium",
#   "source": "frappe_cloud",
#   "expiry": None
# }
```

---

## Integration Points

| Integration | Purpose |
|-------------|---------|
| **Frappe Core** | Base framework, caching, translation |
| **frappe_visual** | Visual components for any dashboards |
| **arkan_help** | Contextual help system |
| **CAPS** | Permission gating (separate from feature gating) |
| **All Arkan Apps** | Consumers of utility functions |

---

## Security

- All public functions validate inputs before processing
- `sanitize_html()` prevents XSS injection
- License keys use SHA-256 checksums with app-specific salts
- No hardcoded secrets — uses `frappe.conf` for secret keys
- Cache invalidation prevents stale license states

---

## Testing

Test coverage target: 90%+ for all utility functions.

```bash
# Run all base_base tests
bench --site dev.localhost run-tests --app base_base

# Run specific test file
bench --site dev.localhost run-tests --app base_base --module base_base.tests.unit.test_validators
```

---

## Changelog

| Version | Changes |
|---------|---------|
| 0.0.1 | Initial release with validators, formatters, constants |
| 0.0.2 | Added feature_gating and licensing modules |
| 0.0.3 | Added comprehensive Arabic translations |
