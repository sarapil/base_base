# Base Base — Architecture
# القاعدة الأساسية — الهيكلية

> Shared Base Application

## Overview

No DocTypes. Provides sidebar menu (categorized by app type), home page override, workspace filtering. Extends bootinfo.

## Technology Stack

- **Backend**: Python 3.14+ / Frappe 16.x
- **Database**: MariaDB 11.x
- **Frontend**: Frappe UI / JavaScript
- **Real-time**: Socket.IO via Redis
- **Cache/Queue**: Redis

## Integration Points

- **Frappe Core** — DocType CRUD, permissions, workflow
- **ERPNext** — Financial transactions (where applicable)
- **CAPS** — Capability-based access control
- **frappe_visual** — Visual components (graphs, dashboards)

## Security

- All APIs require authentication (except explicitly guest-allowed)
- Permission guards via `frappe.only_for()`, `@require_capability`, `.check_permission()`
- Field-level access via CAPS capability maps
