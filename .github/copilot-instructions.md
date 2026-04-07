# Base Base — AI Copilot Instructions

## Overview

**Base Base** (base_base) is an Arkan Lab Frappe v16 application.
Shared development utilities and patterns for Frappe apps

**Brand Color:** #6366F1

## Architecture

- **Framework:** Frappe v16 + ERPNext v16
- **Pattern:** Thin Controller → Service Layer (mandatory)
- **Permissions:** CAPS capability-based access control
- **UI:** frappe_visual components (307+ available)
- **i18n:** Arabic (ar) + English (en) mandatory

## Key Rules

1. Use `extend_doctype_class` — **NEVER** `override_doctype_class`
2. All business logic in `services/` layer — thin controllers only
3. Parameterized SQL only — **NEVER** raw f-string queries
4. All `@frappe.whitelist()` APIs must have permission checks as first line
5. No `frappe.db.commit()` inside document events
6. CSS Logical Properties only (`margin-inline-start`, NOT `margin-left`)
7. All strings wrapped in `__()` for i18n
8. Icons via `frappe.visual.icons.*` — NEVER Font Awesome

## DocType Prefix

All DocTypes use the `BA_` prefix to avoid conflicts.

## Refer To

- `/workspaces/frappe_docker/.github/copilot-instructions.md` — Master constitution
- `docs/ARCHITECTURE.md` — App-specific architecture
- `CONTEXT.md` — Quick context reference
