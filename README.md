# Base Base — Shared Foundation Library

<p align="center">
  <img src="base_base/public/images/base_base-logo.svg" alt="Base Base Logo" width="120">
</p>

<h3 align="center">مكتبة الأساسيات المشتركة</h3>

<p align="center">
  <a href="https://github.com/ArkanLab/base_base/actions/workflows/ci.yml">
    <img src="https://github.com/ArkanLab/base_base/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/ArkanLab/base_base/actions/workflows/linters.yml">
    <img src="https://github.com/ArkanLab/base_base/actions/workflows/linters.yml/badge.svg" alt="Linters">
  </a>
  <img src="https://img.shields.io/badge/Frappe-v16-blue" alt="Frappe v16">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT License">
</p>

---

> Shared utility foundation for all Arkan Lab apps. Provides desktop icon injection, common overrides, base classes, and cross-app utilities.

## ✨ Features

- 🖥️ **Desktop Icon Injection** — `desktop_utils.inject_app_desktop_icon()` for workspace grouping on `/desk`
- 🔧 **Shared Utilities** — Common Python/JS helpers used across multiple Arkan Lab apps
- 🏗️ **Base Classes** — Reusable controller and model patterns
- 🔄 **Custom Field Fixtures** — Shared custom fields and property setters
- 🌐 **RTL Support** — CSS utilities for Arabic/RTL layout

## 📦 Installation

```bash
bench get-app https://github.com/ArkanLab/base_base --branch main
bench --site <site_name> install-app base_base
bench migrate
```

### Requirements

- Frappe Framework v16+
- frappe_visual (UI component library)

## 🏗️ Usage

Base Base is a **dependency app** — it's installed as a required app by other Arkan Lab applications. You generally don't interact with it directly.

### Desktop Icon Injection

```python
from base_base.desktop_utils import inject_app_desktop_icon

# In your app's boot or after_install hook:
inject_app_desktop_icon("my_app", "My App", "/app/my-workspace", "/assets/my_app/logo.svg")
```

## 🤝 Contributing

```bash
cd apps/base_base
pre-commit install
```

Tools: ruff, eslint, prettier, pyupgrade

## 📄 License

MIT

## Contact

For support and inquiries:
- Phone: +201508268982
- WhatsApp: https://wa.me/201508268982

