# Base Base — Technical Context

> **Shared Base Application — Sidebar & Navigation Overrides**
> التطبيق الأساسي — الشريط الجانبي وتخصيصات التنقل

Provides a unified sidebar navigation structure across all Arkan Lab apps,
customizes the home page route, and injects workspace filtering logic.

## Architecture

```
base_base/
├── base_base/
│   ├── hooks.py              # App config — JS/CSS, boot, home_page override
│   ├── api.py                # 3 endpoints: get_sidebar_menu, get_home_page, redirect_home
│   ├── boot.py               # Extends bootinfo with sidebar config, version info, workspace filtering
│   ├── seed.py               # Post-migrate seed data
│   ├── exceptions.py         # Custom exception hierarchy
│   └── base_base/            # Module: Base Base (empty — no doctypes)
│       └── __init__.py
├── public/
│   ├── js/
│   │   └── base_base.js      # Main JS bundle (sidebar UI)
│   └── css/
│       └── base_base.css     # Sidebar styling
└── translations/
    └── ar.csv                # Arabic translations
```

## API Endpoints (3)

| Endpoint | Auth | Description |
|----------|------|-------------|
| `api.get_sidebar_menu` | System Manager | Categorized sidebar: TopApps, Management, Admin, Finance, Dev, Tools |
| `api.get_home_page` | System Manager | Returns home page route `/desk/home` |
| `api.redirect_home` | Guest (allow_guest) | Redirects root requests to `/desk/home` |

## Sidebar Categories

The sidebar menu is organized into 6 categories, filtered by user permissions:
1. **Top Apps** — Primary apps (ERPNext, HRMS, etc.)
2. **Management** — Management tools (Gameplan, Insights, etc.)
3. **Admin** — Administration (CAPS, Settings)
4. **Finance** — Financial modules
5. **Development** — Developer tools
6. **Tools** — Utilities

## Integration Points

- `extend_bootinfo` — Injects sidebar configuration into `frappe.boot`
- `home_page` — Overrides website home page to `/desk/home`
- `app_include_js` / `app_include_css` — Sidebar UI loaded on every desk page

## Dependencies

- **frappe** >= 16.0.0, < 17.0.0
- Python >= 3.10
