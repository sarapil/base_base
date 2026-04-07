# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Unified License Validation Engine for Arkan Lab Apps.
=====================================================

Provides a single, reusable licensing system for all paid Arkan Lab apps.
Each app registers its Settings DocType name and license secret; this module
handles validation, caching, and API endpoints.

On Frappe Cloud: Auto-detects subscription → premium active.
Self-hosted: Validates against license key stored in app Settings.

Usage from any paid app::

    from base_base.utils.licensing import is_premium_active, get_license_info

    # Quick boolean check
    if is_premium_active("velara"):
        ...

    # Detailed info
    info = get_license_info("arrowz")
    # → {"is_premium": True, "tier": "premium", "source": "frappe_cloud", ...}
"""

import hashlib
import secrets

import frappe

# ---------------------------------------------------------------------------
# App registry — maps app_name → configuration
# ---------------------------------------------------------------------------

APP_REGISTRY: dict[str, dict] = {
    "auracrm": {
        "settings_doctype": "AuraCRM Settings",
        "license_field": "license_key",
        "secret_key": "auracrm_license_secret",
        "salt": "auracrm",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/auracrm",
    },
    "velara": {
        "settings_doctype": "VL Settings",
        "license_field": "license_key",
        "secret_key": "velara_license_secret",
        "salt": "velara",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/velara",
    },
    "vertex": {
        "settings_doctype": "VX Settings",
        "license_field": "license_key",
        "secret_key": "vertex_license_secret",
        "salt": "vertex",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/vertex",
    },
    "arrowz": {
        "settings_doctype": "Arrowz Settings",
        "license_field": "license_key",
        "secret_key": "arrowz_license_secret",
        "salt": "arrowz",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/arrowz",
    },
    "candela": {
        "settings_doctype": "Candela Settings",
        "license_field": "license_key",
        "secret_key": "candela_license_secret",
        "salt": "candela",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/candela",
    },
    "arkspace": {
        "settings_doctype": "ARKSpace Settings",
        "license_field": "license_key",
        "secret_key": "arkspace_license_secret",
        "salt": "arkspace",
        "marketplace_url": "https://frappecloud.com/marketplace/apps/arkspace",
    },
}

CACHE_TTL = 3600  # 1 hour


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def is_premium_active(app_name: str) -> bool:
    """Check if premium features should be enabled for *app_name*.

    Priority:
      1. Redis cache (TTL 1 hour)
      2. Frappe Cloud environment → always premium
      3. Valid license key in app Settings
      4. Default → free tier
    """
    cache_key = f"arkan_license:{app_name}"

    cached = frappe.cache.get_value(cache_key)
    if cached is not None:
        return cached

    config = APP_REGISTRY.get(app_name)
    if not config:
        return False

    # Priority 1: Frappe Cloud
    if _is_frappe_cloud():
        result = True
    else:
        # Priority 2: Valid license key
        result = _check_license_key(app_name, config)

    frappe.cache.set_value(cache_key, result, expires_in_sec=CACHE_TTL)
    return result


def get_license_info(app_name: str) -> dict:
    """Get detailed license information for *app_name*."""
    is_premium = is_premium_active(app_name)
    is_cloud = _is_frappe_cloud()

    config = APP_REGISTRY.get(app_name, {})

    return {
        "app": app_name,
        "is_premium": is_premium,
        "tier": "premium" if is_premium else "free",
        "source": (
            "frappe_cloud" if is_cloud
            else "license_key" if is_premium
            else "none"
        ),
        "marketplace_url": config.get("marketplace_url", ""),
    }


def clear_license_cache(app_name: str) -> None:
    """Clear cached license status (call after settings change)."""
    frappe.cache.delete_value(f"arkan_license:{app_name}")


def validate_key(app_name: str, key: str) -> bool:
    """Validate a license key without saving it.

    Key format: XXXX-XXXX-XXXX-HASH
    HASH = sha256(payload:<salt>:<secret>)[:8]
    """
    config = APP_REGISTRY.get(app_name)
    if not config:
        return False
    return _validate_key_internal(key, config)


def generate_key(app_name: str, site_name: str | None = None) -> dict:
    """Generate a new license key for *app_name* (System Manager only).

    Returns ``{"key": "AAAA-BBBB-CCCC-HASH", "site": "..."}``
    """
    config = APP_REGISTRY.get(app_name)
    if not config:
        frappe.throw(frappe._(f"Unknown app: {app_name}"))

    seg1 = secrets.token_hex(2).upper()
    seg2 = secrets.token_hex(2).upper()
    seg3 = secrets.token_hex(2).upper()

    payload = seg1 + seg2 + seg3
    secret = frappe.conf.get(config["secret_key"], "ARKAN_DEFAULT_SECRET")
    checksum = hashlib.sha256(
        f"{payload}:{config['salt']}:{secret}".encode()
    ).hexdigest()[:8].upper()

    return {
        "key": f"{seg1}-{seg2}-{seg3}-{checksum}",
        "app": app_name,
        "site": site_name or frappe.local.site,
    }


# ---------------------------------------------------------------------------
# Whitelisted API endpoints
# ---------------------------------------------------------------------------

@frappe.whitelist()
def get_app_license_status(app_name: str) -> dict:
    """API: Get license status for a specific app."""
    frappe.only_for("System Manager")
    _validate_app_name(app_name)
    return get_license_info(app_name)


@frappe.whitelist()
def validate_license_key(app_name: str, key: str) -> dict:
    """API: Validate a license key without saving."""
    frappe.only_for("System Manager")
    _validate_app_name(app_name)
    is_valid = validate_key(app_name, key)
    return {
        "valid": is_valid,
        "message": (
            frappe._("License key is valid") if is_valid
            else frappe._("Invalid license key")
        ),
    }


@frappe.whitelist()
def generate_license_key(app_name: str, site_name: str | None = None) -> dict:
    """API: Generate a license key (System Manager only)."""
    frappe.only_for("System Manager")
    _validate_app_name(app_name)
    return generate_key(app_name, site_name)


@frappe.whitelist()
def get_all_apps_license_status() -> dict:
    """API: Get license status for ALL registered paid apps."""
    frappe.only_for("System Manager")
    return {
        app_name: get_license_info(app_name)
        for app_name in APP_REGISTRY
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _is_frappe_cloud() -> bool:
    """Detect if running on Frappe Cloud."""
    return bool(
        frappe.conf.get("is_frappe_cloud")
        or frappe.conf.get("frappe_cloud_site")
    )


def _check_license_key(app_name: str, config: dict) -> bool:
    """Read the license key from app Settings and validate."""
    try:
        settings = frappe.get_single(config["settings_doctype"])
    except frappe.DoesNotExistError:
        return False

    key = settings.get(config["license_field"])
    if not key:
        return False

    return _validate_key_internal(key, config)


def _validate_key_internal(key: str, config: dict) -> bool:
    """Validate key format and checksum.

    Key format: XXXX-XXXX-XXXX-HASH (4 hex segments).
    """
    if not key or len(key) < 10:
        return False

    try:
        parts = key.strip().upper().split("-")
        if len(parts) != 4:
            return False

        # Each segment must be valid hex
        for part in parts:
            int(part, 16)

        payload = parts[0] + parts[1] + parts[2]
        secret = frappe.conf.get(config["secret_key"], "ARKAN_DEFAULT_SECRET")
        expected = hashlib.sha256(
            f"{payload}:{config['salt']}:{secret}".encode()
        ).hexdigest()[:8].upper()

        return parts[3] == expected
    except (ValueError, IndexError):
        return False
    except Exception as e:
        frappe.log_error(
            f"License validation error for {config.get('salt', 'unknown')}: {e}",
            "Arkan License",
        )
        return False


def _validate_app_name(app_name: str) -> None:
    """Guard against arbitrary app names in API calls."""
    if app_name not in APP_REGISTRY:
        frappe.throw(frappe._(f"Unknown app: {app_name}"))
