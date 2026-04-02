# 🔗 Base Base — Integrations Guide

> **Domain:** Shared Utilities & Base Configuration
> **Prefix:** BB

---

## Integration Map

```
Base Base
  ├── Frappe Core
  ├── All Arkan Lab Apps
```

---

## Frappe Core

### Connection Type
- **Direction:** Bidirectional
- **Protocol:** Python API / REST
- **Authentication:** Frappe session / API key

### Data Flow
| Source | Target | Trigger | Data |
|--------|--------|---------|------|
| Base Base | Frappe Core | On submit | Document data |
| Frappe Core | Base Base | On change | Updated data |

### Configuration
```python
# In BB Settings or site_config.json
# frappe_core_enabled = 1
```

---

## All Arkan Lab Apps

### Connection Type
- **Direction:** Bidirectional
- **Protocol:** Python API / REST
- **Authentication:** Frappe session / API key

### Data Flow
| Source | Target | Trigger | Data |
|--------|--------|---------|------|
| Base Base | All Arkan Lab Apps | On submit | Document data |
| All Arkan Lab Apps | Base Base | On change | Updated data |

### Configuration
```python
# In BB Settings or site_config.json
# all_arkan_lab_apps_enabled = 1
```

---

## API Endpoints

All integration APIs use the standard response format from `base_base.api.response`:

```python
from base_base.api.response import success, error

@frappe.whitelist()
def sync_data():
    return success(data={}, message="Sync completed")
```

---

*Part of Base Base by Arkan Lab*
