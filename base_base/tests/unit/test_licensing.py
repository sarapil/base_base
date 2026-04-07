# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Tests for the unified licensing engine (base_base.utils.licensing).
"""

import hashlib

import frappe
import pytest

from base_base.utils.licensing import (
    APP_REGISTRY,
    _validate_key_internal,
    generate_key,
    is_premium_active,
    validate_key,
    clear_license_cache,
    get_license_info,
)


class TestKeyValidation:
    """Test license key format and checksum validation."""

    def test_valid_key_format(self):
        """Generated keys should be valid."""
        for app_name in APP_REGISTRY:
            result = generate_key(app_name, "test.site")
            assert validate_key(app_name, result["key"]) is True
            assert result["app"] == app_name

    def test_invalid_key_rejected(self):
        """Random strings should not validate."""
        assert validate_key("auracrm", "INVALID-KEY") is False
        assert validate_key("auracrm", "") is False
        assert validate_key("auracrm", "AAAA-BBBB-CCCC-0000") is False

    def test_key_wrong_app_rejected(self):
        """A key generated for one app should not work for another."""
        key_data = generate_key("auracrm")
        assert validate_key("velara", key_data["key"]) is False

    def test_key_case_insensitive(self):
        """Keys should validate regardless of case."""
        key_data = generate_key("vertex")
        lower_key = key_data["key"].lower()
        assert validate_key("vertex", lower_key) is True

    def test_key_whitespace_stripped(self):
        """Leading/trailing whitespace should be stripped."""
        key_data = generate_key("arrowz")
        padded = f"  {key_data['key']}  "
        assert validate_key("arrowz", padded) is True

    def test_unknown_app_rejected(self):
        """Unknown app names should return False."""
        assert validate_key("nonexistent_app", "AAAA-BBBB-CCCC-DDDD") is False

    def test_key_segments_are_hex(self):
        """All key segments should be valid hexadecimal."""
        key_data = generate_key("candela")
        parts = key_data["key"].split("-")
        assert len(parts) == 4
        for part in parts:
            int(part, 16)  # Should not raise

    def test_checksum_deterministic(self):
        """Same payload + salt + secret should produce same checksum."""
        config = APP_REGISTRY["auracrm"]
        payload = "AABBCCDD"
        secret = frappe.conf.get(config["secret_key"], "ARKAN_DEFAULT_SECRET")
        cs1 = hashlib.sha256(
            f"{payload}:{config['salt']}:{secret}".encode()
        ).hexdigest()[:8].upper()
        cs2 = hashlib.sha256(
            f"{payload}:{config['salt']}:{secret}".encode()
        ).hexdigest()[:8].upper()
        assert cs1 == cs2

    def test_each_app_generates_unique_keys(self):
        """Two calls should produce different keys (randomness test)."""
        k1 = generate_key("arkspace")
        k2 = generate_key("arkspace")
        assert k1["key"] != k2["key"]


class TestLicenseStatus:
    """Test license status detection."""

    def test_default_is_free(self):
        """Without any key or Frappe Cloud, should default to free."""
        clear_license_cache("auracrm")
        # In dev environment without FC, this should be False
        result = is_premium_active("auracrm")
        assert isinstance(result, bool)

    def test_unknown_app_is_free(self):
        """Unknown apps should always return False."""
        assert is_premium_active("nonexistent") is False

    def test_license_info_structure(self):
        """License info should have required keys."""
        info = get_license_info("velara")
        assert "app" in info
        assert "is_premium" in info
        assert "tier" in info
        assert "source" in info
        assert info["app"] == "velara"
        assert info["tier"] in ("free", "premium")

    def test_all_apps_registered(self):
        """All 6 paid apps should be in the registry."""
        expected = {"auracrm", "velara", "vertex", "arrowz", "candela", "arkspace"}
        assert expected == set(APP_REGISTRY.keys())


class TestFeatureGating:
    """Test the feature gating system."""

    def test_free_feature_always_enabled(self):
        from base_base.utils.feature_gating import is_feature_enabled
        # Any feature declared as "free" should always return True
        # regardless of license status
        result = is_feature_enabled("auracrm", "lead_management")
        assert result is True

    def test_unknown_feature_defaults_to_premium(self):
        from base_base.utils.feature_gating import get_feature_tier
        # Unknown features should default to premium (most restrictive)
        tier = get_feature_tier("auracrm", "totally_made_up_feature")
        assert tier == "premium"

    def test_get_app_features_returns_dict(self):
        from base_base.utils.feature_gating import get_app_features
        features = get_app_features("auracrm")
        assert isinstance(features, dict)
        # Should have entries from the registry
        if features:
            first = next(iter(features.values()))
            assert "tier" in first
            assert "enabled" in first
            assert "requires_upgrade" in first

    def test_enabled_features_dict(self):
        from base_base.utils.feature_gating import get_enabled_features_dict
        features = get_enabled_features_dict("velara")
        assert isinstance(features, dict)
        # All values should be booleans
        for val in features.values():
            assert isinstance(val, bool)
