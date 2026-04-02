"""
Base Base API Module
Provides API endpoints for sidebar configuration and utilities
Compatible with Frappe v16+
"""

import frappe
from frappe import _


@frappe.whitelist()
def get_sidebar_config() -> dict:
    """
    Get the sidebar configuration for the current user.
    Returns the categorized sidebar menu structure.
    """
    config = {
        "TopApps": {
            "label": _("Apps"),
            "icon": "grid",
            "order": 1,
            "items": [
                {"label": _("Arrowz"), "workspace": "Arrowz"},
                {"label": _("ARKSpace"), "workspace": "ARKSpace"},
                {"label": _("Arkan WiFi"), "workspace": "Arkan WiFi Manager"},
            ]
        },
        "Management": {
            "label": _("Management"),
            "icon": "organization",
            "order": 2,
            "items": [
                {"label": _("CRM"), "workspace": "CRM"},
                {"label": _("HR"), "workspace": "HR"},
                {"label": _("LMS"), "workspace": "LMS"},
                {"label": _("Support"), "workspace": "Support"},
                {"label": _("Projects"), "workspace": "Projects"},
                {"label": _("Quality"), "workspace": "Quality"},
                {"label": _("Assets"), "workspace": "Assets"},
            ]
        },
        "Admin": {
            "label": _("Admin"),
            "icon": "setting-gear",
            "order": 3,
            "items": [
                {"label": _("Users"), "workspace": "Users"},
                {"label": _("Integrations"), "workspace": "Integrations"},
                {"label": _("ERPNext Integrations"), "workspace": "ERPNext Integrations"},
                {"label": _("ERPNext Settings"), "workspace": "ERPNext Settings"},
                {"label": _("Website"), "workspace": "Website"},
            ]
        },
        "Finance": {
            "label": _("Finance"),
            "icon": "income",
            "order": 4,
            "items": [
                {"label": _("Accounting"), "workspace": "Accounting"},
                {"label": _("Buying"), "workspace": "Buying"},
                {"label": _("Selling"), "workspace": "Selling"},
                {"label": _("Stock"), "workspace": "Stock"},
                {"label": _("Payroll"), "workspace": "Payroll"},
            ]
        },
        "Development": {
            "label": _("Development"),
            "icon": "developer-mode",
            "order": 5,
            "items": [
                {"label": _("Build"), "workspace": "Build"},
                {"label": _("Frappe Builder"), "workspace": "Frappe Builder"},
            ]
        },
        "Tools": {
            "label": _("Tools"),
            "icon": "tool",
            "order": 6,
            "items": [
                {"label": _("Tools"), "workspace": "Tools"},
                {"label": _("Wiki"), "workspace": "Wiki"},
            ]
        }
    }
    
    # Filter based on user permissions and available workspaces
    filtered_config = filter_sidebar_by_permissions(config)
    
    return filtered_config


def filter_sidebar_by_permissions(config: dict) -> dict:
    """
    Filter sidebar items based on user permissions and available workspaces.
    """
    available_workspaces = get_available_workspaces()
    filtered: dict = {}
    
    for category_key, category in config.items():
        filtered_items = []
        for item in category.get("items", []):
            workspace_name = item.get("workspace")
            # Check if workspace exists and user has access
            if workspace_name in available_workspaces:
                filtered_items.append(item)
        
        # Only include category if it has visible items
        if filtered_items:
            filtered[category_key] = {
                "label": category.get("label"),
                "icon": category.get("icon"),
                "order": category.get("order", 99),
                "items": filtered_items
            }
    
    return filtered


def get_available_workspaces() -> set:
    """
    Get list of workspaces available to the current user.
    """
    workspaces = frappe.get_all(
        "Workspace",
        filters={
            "public": 1
        },
        fields=["name", "title"],
        order_by="title"
    )
    
    # Create a set of workspace names/titles for quick lookup
    available: set = set()
    for ws in workspaces:
        available.add(ws.name)
        available.add(ws.title)
    
    return available


@frappe.whitelist()
def get_home_page() -> str:
    """
    Get the home page route for the current user.
    """
    return "/desk/home"


@frappe.whitelist(allow_guest=True)
def redirect_root() -> None:
    """
    Redirect root requests to /desk/home.
    This is called by website_route_rules.
    """
    frappe.local.flags.redirect_location = "/desk/home"
    raise frappe.Redirect
