# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Unified Feature Gating System for Arkan Lab Apps.
==================================================

Each paid app declares its features in ``hooks.py``::

    app_feature_registry = {
        "room_management": "free",
        "ai_pricing": "premium",
    }

This module reads those declarations and gates access based on the
unified licensing engine in ``base_base.utils.licensing``.

Usage::

    from base_base.utils.feature_gating import (
        require_premium, is_feature_enabled, get_app_features,
    )

    # Decorator
    @frappe.whitelist()
    @require_premium("velara", "ai_pricing")
    def run_ai_pricing(room):
        ...

    # Runtime check
    if is_feature_enabled("vertex", "advanced_analytics"):
        show_dashboard()
"""

from functools import wraps

import frappe

TIER_FREE = "free"
TIER_PREMIUM = "premium"


# ---------------------------------------------------------------------------
# Feature registry loader
# ---------------------------------------------------------------------------

def _get_registry(app_name: str) -> dict[str, str]:
    """Load feature registry from app's hooks.py (cached)."""
    cache_key = f"arkan_features:{app_name}"
    cached = frappe.cache.get_value(cache_key)
    if cached is not None:
        return cached

    registry = frappe.get_hooks("app_feature_registry", app_name=app_name)

    # frappe.get_hooks returns a list; we merge dicts if multiple entries.
    # Values may be wrapped in lists by the hooks system, so unwrap them.
    merged: dict[str, str] = {}
    if isinstance(registry, list):
        for entry in registry:
            if isinstance(entry, dict):
                merged.update(entry)
    elif isinstance(registry, dict):
        merged = registry

    # Unwrap list-wrapped values (frappe.get_hooks wraps each value in [])
    for key, val in merged.items():
        if isinstance(val, list) and len(val) == 1:
            merged[key] = val[0]

    # Cache for 1 hour (registries don't change at runtime)
    frappe.cache.set_value(cache_key, merged, expires_in_sec=3600)
    return merged


# ---------------------------------------------------------------------------
# Decorator
# ---------------------------------------------------------------------------

def require_premium(app_name: str, feature_key: str):
    """Decorator: block execution if feature requires premium and no license.

    Usage::

        @frappe.whitelist()
        @require_premium("arrowz", "ai_call_analytics")
        def analyze_calls():
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            registry = _get_registry(app_name)
            tier = registry.get(feature_key, TIER_PREMIUM)

            if tier == TIER_PREMIUM:
                from base_base.utils.licensing import is_premium_active

                if not is_premium_active(app_name):
                    from base_base.utils.licensing import APP_REGISTRY
                    config = APP_REGISTRY.get(app_name, {})
                    url = config.get("marketplace_url", "")

                    frappe.throw(
                        frappe._(
                            "This feature requires a premium license. "
                            "Subscribe on Frappe Cloud Marketplace"
                            "{0} or contact Arkan Lab for a license key."
                        ).format(f" ({url})" if url else ""),
                        title=frappe._("Premium Feature"),
                        exc=frappe.PermissionError,
                    )

            return func(*args, **kwargs)
        return wrapper
    return decorator


# ---------------------------------------------------------------------------
# Runtime checks
# ---------------------------------------------------------------------------

def is_feature_enabled(app_name: str, feature_key: str) -> bool:
    """Check if *feature_key* is available for *app_name*'s current license.

    Free features always return True.
    Premium features return True only when a valid license is active.
    """
    registry = _get_registry(app_name)
    tier = registry.get(feature_key, TIER_PREMIUM)

    if tier == TIER_FREE:
        return True

    from base_base.utils.licensing import is_premium_active
    return is_premium_active(app_name)


def get_feature_tier(app_name: str, feature_key: str) -> str:
    """Get the tier of a specific feature."""
    registry = _get_registry(app_name)
    return registry.get(feature_key, TIER_PREMIUM)


def get_app_features(app_name: str) -> dict[str, dict]:
    """Get all features for *app_name* with their current status."""
    from base_base.utils.licensing import is_premium_active

    registry = _get_registry(app_name)
    premium = is_premium_active(app_name)

    return {
        feature: {
            "tier": tier,
            "enabled": tier == TIER_FREE or premium,
            "requires_upgrade": tier == TIER_PREMIUM and not premium,
        }
        for feature, tier in registry.items()
    }


def get_enabled_features_dict(app_name: str) -> dict[str, bool]:
    """Get ``{feature: bool}`` map for client-side consumption."""
    from base_base.utils.licensing import is_premium_active

    registry = _get_registry(app_name)
    premium = is_premium_active(app_name)

    return {
        feature: (tier == TIER_FREE or premium)
        for feature, tier in registry.items()
    }


# ---------------------------------------------------------------------------
# Whitelisted API endpoints
# ---------------------------------------------------------------------------

@frappe.whitelist()
def get_features(app_name: str) -> dict[str, bool]:
    """API: Get enabled features map for an app (for client-side use)."""
    frappe.only_for("System Manager")
    _validate_app(app_name)
    return get_enabled_features_dict(app_name)


@frappe.whitelist()
def check_feature_api(app_name: str, feature_key: str) -> dict:
    """API: Check if a specific feature is available."""
    _validate_app(app_name)
    enabled = is_feature_enabled(app_name, feature_key)
    tier = get_feature_tier(app_name, feature_key)

    return {
        "app": app_name,
        "feature": feature_key,
        "enabled": enabled,
        "tier": tier,
        "upgrade_required": not enabled and tier == TIER_PREMIUM,
    }


# ---------------------------------------------------------------------------
# Internal
# ---------------------------------------------------------------------------

def _validate_app(app_name: str) -> None:
    """Guard against arbitrary app names."""
    from base_base.utils.licensing import APP_REGISTRY
    if app_name not in APP_REGISTRY:
        frappe.throw(frappe._(f"Unknown app: {app_name}"))
