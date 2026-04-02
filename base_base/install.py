"""
Base Base — Post-Install Setup
Runs after `bench install-app base_base`.
"""

import frappe
from frappe import _


def after_install():
    """Post-installation setup for Base Base."""
    inject_desktop_icon()
    print(f"✅ {_("Base Base")}: post-install complete")


def inject_desktop_icon():
    """Create desktop shortcut icon for Base Base."""
    if frappe.db.exists("Desktop Icon", {"module_name": "Base Base"}):
        return

    try:
        frappe.get_doc({
            "doctype": "Desktop Icon",
            "module_name": "Base Base",
            "label": _("Base Base"),
            "icon": "octicon octicon-bookmark",
            "color": "#6366F1",
            "type": "module",
            "standard": 1,
        }).insert(ignore_permissions=True)
    except Exception:
        pass  # May not exist in all Frappe versions
