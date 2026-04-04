<!-- Post Type: Community Forum | Platform: discuss.frappe.io, GitHub Discussions -->
<!-- Target: Frappe developers and power users -->
<!-- Last Updated: 2026-04-04 -->

# [Announcement] Base Base — Development Utilities for Frappe Apps | Open Source

Hi Frappe Community! 👋

We're excited to share **Base Base**, a new open-source developer tools app for Frappe/ERPNext.

## What it does

✅ Shared Utility Functions
✅ Common Mixins & Base Classes
✅ Development Helpers
✅ Testing Utilities
✅ Migration Helpers

## Why we built it

- Code duplication across Frappe apps
- No shared utilities library
- Repeating patterns in every app

We couldn't find a good developer tools solution that integrates natively with ERPNext, so we built one.

## Tech Stack

- **Backend:** Python, Frappe Framework v16
- **Frontend:** JavaScript, Frappe UI, frappe_visual components
- **Database:** MariaDB (standard Frappe)
- **License:** MIT
- **Dependencies:** frappe_visual, caps, arkan_help

## Installation

```bash
bench get-app https://github.com/sarapil/base_base
bench --site your-site install-app base_base
bench --site your-site migrate
```

## Screenshots

[Screenshots will be added to the GitHub repository]

## Roadmap

We're actively developing and would love community feedback on:
1. What features would you like to see?
2. What integrations are most important?
3. Any bugs or issues you encounter?

## Links

- 🔗 **GitHub:** https://github.com/sarapil/base_base
- 📖 **Docs:** https://arkan.it.com/base_base/docs
- 🏪 **Marketplace:** Frappe Cloud Marketplace
- 📧 **Contact:** support@arkan.it.com

## About Arkan Lab

We're building a complete ecosystem of open-source business apps for Frappe/ERPNext, covering hospitality, construction, CRM, communications, coworking, and more. All apps are designed to work together seamlessly.

Check out our full portfolio: https://arkan.it.com

---

*Feedback and contributions welcome! Star ⭐ the repo if you find it useful.*
