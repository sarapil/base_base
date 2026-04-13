# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Unit tests for base_base.utils.constants module.
"""

import pytest

from base_base.utils.constants import (
    APP_NAME,
    APP_TITLE,
    APP_PREFIX,
    APP_COLOR,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    CACHE_SHORT,
    CACHE_MEDIUM,
    CACHE_LONG,
    STATUS_DRAFT,
    STATUS_ACTIVE,
    STATUS_CANCELLED,
    STATUS_COMPLETED,
    DATE_FORMAT,
    DATETIME_FORMAT,
)


class TestAppMetadata:
    """Tests for app metadata constants."""

    def test_app_name(self):
        """App name should be lowercase snake_case."""
        assert APP_NAME == "base_base"
        assert "_" in APP_NAME
        assert APP_NAME.islower()

    def test_app_title(self):
        """App title should be human-readable."""
        assert APP_TITLE == "Base Base"
        assert " " in APP_TITLE

    def test_app_prefix(self):
        """App prefix should be 2-4 uppercase chars."""
        assert APP_PREFIX == "BB"
        assert len(APP_PREFIX) <= 4
        assert APP_PREFIX.isupper()

    def test_app_color(self):
        """App color should be valid hex."""
        assert APP_COLOR.startswith("#")
        assert len(APP_COLOR) == 7
        # Should be valid hex
        int(APP_COLOR[1:], 16)


class TestPaginationConstants:
    """Tests for pagination constants."""

    def test_default_page_size(self):
        """Default page size should be reasonable."""
        assert DEFAULT_PAGE_SIZE == 20
        assert DEFAULT_PAGE_SIZE > 0
        assert DEFAULT_PAGE_SIZE <= 100

    def test_max_page_size(self):
        """Max page size should be larger than default."""
        assert MAX_PAGE_SIZE == 100
        assert MAX_PAGE_SIZE >= DEFAULT_PAGE_SIZE

    def test_page_sizes_are_integers(self):
        """Page sizes should be integers."""
        assert isinstance(DEFAULT_PAGE_SIZE, int)
        assert isinstance(MAX_PAGE_SIZE, int)


class TestCacheTTLConstants:
    """Tests for cache TTL constants."""

    def test_cache_short(self):
        """Short cache should be 5 minutes."""
        assert CACHE_SHORT == 300
        assert CACHE_SHORT == 5 * 60

    def test_cache_medium(self):
        """Medium cache should be 1 hour."""
        assert CACHE_MEDIUM == 3600
        assert CACHE_MEDIUM == 60 * 60

    def test_cache_long(self):
        """Long cache should be 24 hours."""
        assert CACHE_LONG == 86400
        assert CACHE_LONG == 24 * 60 * 60

    def test_cache_ordering(self):
        """Cache TTLs should be in ascending order."""
        assert CACHE_SHORT < CACHE_MEDIUM < CACHE_LONG


class TestStatusConstants:
    """Tests for status constants."""

    def test_status_values(self):
        """Status constants should be title case strings."""
        assert STATUS_DRAFT == "Draft"
        assert STATUS_ACTIVE == "Active"
        assert STATUS_CANCELLED == "Cancelled"
        assert STATUS_COMPLETED == "Completed"

    def test_status_uniqueness(self):
        """All status values should be unique."""
        statuses = [STATUS_DRAFT, STATUS_ACTIVE, STATUS_CANCELLED, STATUS_COMPLETED]
        assert len(statuses) == len(set(statuses))

    def test_status_not_empty(self):
        """Status values should not be empty."""
        for status in [STATUS_DRAFT, STATUS_ACTIVE, STATUS_CANCELLED, STATUS_COMPLETED]:
            assert status
            assert len(status) > 0


class TestDateFormatConstants:
    """Tests for date format constants."""

    def test_date_format_iso(self):
        """Date format should be ISO standard."""
        assert DATE_FORMAT == "%Y-%m-%d"

    def test_datetime_format_iso(self):
        """Datetime format should be ISO standard."""
        assert DATETIME_FORMAT == "%Y-%m-%d %H:%M:%S"

    def test_date_format_valid(self):
        """Date format should be valid strftime format."""
        from datetime import date, datetime
        
        test_date = date(2026, 4, 15)
        result = test_date.strftime(DATE_FORMAT)
        assert result == "2026-04-15"

    def test_datetime_format_valid(self):
        """Datetime format should be valid strftime format."""
        from datetime import datetime
        
        test_dt = datetime(2026, 4, 15, 14, 30, 45)
        result = test_dt.strftime(DATETIME_FORMAT)
        assert result == "2026-04-15 14:30:45"


class TestConstantsUsability:
    """Tests for practical usage of constants."""

    def test_constants_can_be_used_in_queries(self):
        """Constants should be usable in frappe queries."""
        # Simulate building a query
        filters = {"status": STATUS_ACTIVE}
        assert filters["status"] == "Active"

    def test_constants_can_be_used_for_caching(self):
        """Cache TTL constants should be usable with frappe.cache."""
        # Simulate cache usage
        expires_in_sec = CACHE_MEDIUM
        assert isinstance(expires_in_sec, int)
        assert expires_in_sec > 0

    def test_pagination_in_api(self):
        """Pagination constants should work in API context."""
        # Simulate API pagination
        page_size = min(50, MAX_PAGE_SIZE)
        assert page_size == 50
        
        page_size = min(200, MAX_PAGE_SIZE)
        assert page_size == 100  # Capped at max
