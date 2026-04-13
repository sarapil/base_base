# Developer — Usage Scenarios
# سيناريوهات المطور

## Role Overview

- **Title**: Frappe App Developer / مطور تطبيقات Frappe
- **Primary Access**: Code-level integration with base_base utilities
- **Device**: Desktop (IDE)

---

## Daily Scenarios (يومي)

### DS-001: Input Validation in DocType

- **Goal**: Validate user input in a DocType's validate() method
- **Pre-conditions**: base_base is installed in bench
- **Steps**:
  1. Import validators:
     ```python
     from base_base.utils.validators import validate_required, validate_email, validate_phone
     ```
  2. Use in validate method:
     ```python
     def validate(self):
         validate_required(self.customer_name, "Customer Name")
         validate_email(self.email)
         if self.mobile:
             validate_phone(self.mobile)
     ```
  3. Test with invalid data → should throw clear error
- **Screen**: N/A (code-level)
- **Breakpoints**: N/A
- **Error scenarios**: ValidationError raised with field name and message

### DS-002: Format Currency for Display

- **Goal**: Display monetary values in user-friendly format
- **Pre-conditions**: base_base is installed
- **Steps**:
  1. Import formatter:
     ```python
     from base_base.utils.formatters import format_currency
     ```
  2. Use in report or template:
     ```python
     total_display = format_currency(doc.grand_total, "SAR")
     # Result: "SAR 5,432.10"
     ```
- **Screen**: Report columns, form display
- **Error scenarios**: None (handles None gracefully)

### DS-003: Use Application Constants

- **Goal**: Use consistent constants instead of magic numbers
- **Pre-conditions**: base_base is installed
- **Steps**:
  1. Import constants:
     ```python
     from base_base.utils.constants import (
         DEFAULT_PAGE_SIZE, STATUS_ACTIVE, CACHE_MEDIUM
     )
     ```
  2. Use in API:
     ```python
     @frappe.whitelist()
     def get_items(page_size=DEFAULT_PAGE_SIZE):
         return frappe.get_all("Item", 
             filters={"status": STATUS_ACTIVE},
             limit=min(page_size, 100)
         )
     ```
  3. Use for caching:
     ```python
     frappe.cache.set_value("key", data, expires_in_sec=CACHE_MEDIUM)
     ```
- **Screen**: N/A
- **Error scenarios**: Import error if base_base not installed

---

## Weekly Scenarios (أسبوعي)

### WS-001: Implement Feature Gating

- **Goal**: Gate premium features behind license check
- **Pre-conditions**: App has feature registry in hooks.py
- **Steps**:
  1. Define features in hooks.py:
     ```python
     app_feature_registry = {
         "basic_reports": "free",
         "ai_analytics": "premium",
     }
     ```
  2. Import and use decorator:
     ```python
     from base_base.utils.feature_gating import require_premium
     
     @frappe.whitelist()
     @require_premium("my_app", "ai_analytics")
     def run_ai_analysis():
         # Only runs if premium active
         ...
     ```
  3. Or use runtime check:
     ```python
     from base_base.utils.feature_gating import is_feature_enabled
     
     if is_feature_enabled("my_app", "ai_analytics"):
         show_ai_button()
     ```
- **Screen**: Conditional UI elements
- **Error scenarios**: Feature disabled message shown to user

### WS-002: Check License Status

- **Goal**: Verify premium license is active for an app
- **Pre-conditions**: App registered in licensing.APP_REGISTRY
- **Steps**:
  1. Import licensing:
     ```python
     from base_base.utils.licensing import is_premium_active, get_license_info
     ```
  2. Check status:
     ```python
     if is_premium_active("velara"):
         enable_premium_features()
     
     info = get_license_info("velara")
     # {"is_premium": True, "tier": "premium", "source": "frappe_cloud"}
     ```
- **Screen**: Settings page, license status
- **Error scenarios**: Cache may return stale data (clear with clear_license_cache())

---

## Monthly Scenarios (شهري)

### MS-001: Register New App in Licensing

- **Goal**: Add a new app to the unified licensing system
- **Pre-conditions**: New app needs premium features
- **Steps**:
  1. Edit `base_base/utils/licensing.py`:
     ```python
     APP_REGISTRY["new_app"] = {
         "settings_doctype": "New App Settings",
         "license_field": "license_key",
         "secret_key": "new_app_license_secret",
         "salt": "new_app",
         "marketplace_url": "https://frappecloud.com/marketplace/apps/new_app",
     }
     ```
  2. Create Settings DocType with `license_key` field
  3. Add secret to `site_config.json`:
     ```json
     {"new_app_license_secret": "RANDOM_256BIT_SECRET"}
     ```
  4. Test key generation and validation
- **Screen**: App settings page
- **Error scenarios**: Missing secret key, wrong field name

### MS-002: Update Utility Functions

- **Goal**: Add new reusable utility function
- **Pre-conditions**: Function needed by multiple apps
- **Steps**:
  1. Identify the category (validators, formatters, etc.)
  2. Add function to appropriate module:
     ```python
     # base_base/utils/validators.py
     def validate_url(url: str) -> bool:
         """Validate URL format."""
         pattern = r"^https?://[^\s]+$"
         if not re.match(pattern, url or ""):
             frappe.throw(_("Invalid URL: {0}").format(url))
         return True
     ```
  3. Add translations to ar.csv
  4. Add unit tests
  5. Update ARCHITECTURE.md documentation
- **Screen**: N/A
- **Error scenarios**: Breaking changes to existing functions

---

## Exception Scenarios (استثنائي)

### ES-001: Debug License Validation Failure

- **Goal**: Troubleshoot why premium features aren't working
- **Pre-conditions**: Premium should be active but isn't
- **Steps**:
  1. Clear cache:
     ```python
     from base_base.utils.licensing import clear_license_cache
     clear_license_cache("my_app")
     ```
  2. Check info:
     ```python
     info = get_license_info("my_app")
     print(info)  # Debug output
     ```
  3. Verify key format:
     ```python
     from base_base.utils.licensing import validate_key
     is_valid = validate_key("my_app", stored_key)
     ```
  4. Check Settings DocType has correct key
  5. Check frappe.conf has secret key
- **Screen**: Console/terminal
- **Error scenarios**: Invalid key format, missing secret, cache staleness

### ES-002: Handle Validation Errors Gracefully

- **Goal**: Catch validation errors in API and return proper response
- **Pre-conditions**: API uses base_base validators
- **Steps**:
  1. Wrap validation in try/except:
     ```python
     @frappe.whitelist()
     def create_item(data):
         try:
             validate_required(data.get("name"), "Name")
             validate_email(data.get("email"))
             # ... create item
             return {"status": "success"}
         except frappe.ValidationError as e:
             return {"status": "error", "message": str(e)}
     ```
  2. Or let Frappe handle it (will show in UI)
- **Screen**: API response / form error
- **Error scenarios**: Multiple validation errors (only first is raised)
