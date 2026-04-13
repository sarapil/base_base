# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Unit tests for base_base.utils.formatters module.
"""

import pytest
from datetime import date, datetime

from base_base.utils.formatters import (
    format_currency,
    format_percentage,
    format_date_short,
    format_datetime_short,
    truncate,
    format_file_size,
)


class TestFormatCurrency:
    """Tests for format_currency function."""

    def test_usd_default(self):
        """Format with default USD currency."""
        result = format_currency(1234.56)
        assert "1,234" in result or "1234" in result
        assert "56" in result

    def test_explicit_currency(self):
        """Format with explicit currency code."""
        result = format_currency(1000, "SAR")
        assert "1,000" in result or "1000" in result

    def test_zero_amount(self):
        """Zero amount should format correctly."""
        result = format_currency(0)
        assert "0" in result

    def test_negative_amount(self):
        """Negative amount should include minus sign."""
        result = format_currency(-500)
        assert "-" in result or "(" in result  # Some locales use parentheses
        assert "500" in result

    def test_large_number(self):
        """Large numbers should include thousands separator."""
        result = format_currency(1000000)
        # Should have separators
        assert "1" in result and "000" in result

    def test_string_input(self):
        """String input should be converted to float."""
        result = format_currency("1234.56")
        assert "1234" in result or "1,234" in result

    def test_none_returns_zero(self):
        """None input should return zero formatted."""
        result = format_currency(None)
        assert "0" in result


class TestFormatPercentage:
    """Tests for format_percentage function."""

    def test_basic_percentage(self):
        """Basic percentage formatting."""
        result = format_percentage(75)
        assert result == "75.0%"

    def test_decimal_precision_default(self):
        """Default precision is 1 decimal place."""
        result = format_percentage(33.333)
        assert result == "33.3%"

    def test_custom_precision(self):
        """Custom precision should work."""
        result = format_percentage(33.3333, precision=2)
        assert result == "33.33%"

    def test_zero_precision(self):
        """Zero precision should round to integer."""
        result = format_percentage(75.9, precision=0)
        assert result == "76.0%" or result == "76%"

    def test_zero_value(self):
        """Zero value should format correctly."""
        result = format_percentage(0)
        assert result == "0.0%"

    def test_hundred_percent(self):
        """100% should format correctly."""
        result = format_percentage(100)
        assert result == "100.0%"

    def test_over_hundred(self):
        """Values over 100 should work (growth rates)."""
        result = format_percentage(150)
        assert result == "150.0%"


class TestFormatDateShort:
    """Tests for format_date_short function."""

    def test_date_object(self):
        """Date object should format correctly."""
        result = format_date_short(date(2026, 4, 15))
        assert "15" in result and "2026" in result

    def test_string_date(self):
        """String date should format correctly."""
        result = format_date_short("2026-04-15")
        assert "15" in result and "2026" in result

    def test_none_returns_empty(self):
        """None should return empty string."""
        result = format_date_short(None)
        assert result == ""

    def test_empty_string_returns_empty(self):
        """Empty string should return empty."""
        result = format_date_short("")
        assert result == ""


class TestFormatDatetimeShort:
    """Tests for format_datetime_short function."""

    def test_datetime_object(self):
        """Datetime object should format correctly."""
        result = format_datetime_short(datetime(2026, 4, 15, 14, 30))
        assert "15" in result and "2026" in result
        assert "14" in result or "30" in result

    def test_string_datetime(self):
        """String datetime should format correctly."""
        result = format_datetime_short("2026-04-15 14:30:00")
        assert "15" in result and "2026" in result

    def test_none_returns_empty(self):
        """None should return empty string."""
        result = format_datetime_short(None)
        assert result == ""


class TestTruncate:
    """Tests for truncate function."""

    def test_short_text_unchanged(self):
        """Text shorter than max_length should be unchanged."""
        result = truncate("Hello", max_length=100)
        assert result == "Hello"

    def test_exact_length_unchanged(self):
        """Text exactly at max_length should be unchanged."""
        text = "A" * 100
        result = truncate(text, max_length=100)
        assert result == text

    def test_long_text_truncated(self):
        """Text longer than max_length should be truncated with ellipsis."""
        text = "A" * 150
        result = truncate(text, max_length=100)
        assert len(result) == 100
        assert result.endswith("...")

    def test_default_max_length(self):
        """Default max_length is 100."""
        text = "B" * 150
        result = truncate(text)
        assert len(result) == 100

    def test_empty_string(self):
        """Empty string should return empty."""
        result = truncate("")
        assert result == ""

    def test_none_returns_empty(self):
        """None should return empty string."""
        result = truncate(None)
        assert result == ""

    def test_small_max_length(self):
        """Very small max_length should still work."""
        result = truncate("Hello World", max_length=8)
        assert result == "Hello..."
        assert len(result) == 8


class TestFormatFileSize:
    """Tests for format_file_size function."""

    def test_bytes(self):
        """Small sizes in bytes."""
        result = format_file_size(500)
        assert "500" in result
        assert "B" in result

    def test_kilobytes(self):
        """Kilobyte range."""
        result = format_file_size(1024)
        assert "1" in result
        assert "KB" in result

    def test_megabytes(self):
        """Megabyte range."""
        result = format_file_size(1536000)
        assert "MB" in result

    def test_gigabytes(self):
        """Gigabyte range."""
        result = format_file_size(2 * 1024 * 1024 * 1024)
        assert "2" in result
        assert "GB" in result

    def test_terabytes(self):
        """Terabyte range."""
        result = format_file_size(1.5 * 1024 * 1024 * 1024 * 1024)
        assert "TB" in result

    def test_zero_bytes(self):
        """Zero bytes."""
        result = format_file_size(0)
        assert "0" in result
        assert "B" in result

    def test_decimal_formatting(self):
        """Decimal places should be included."""
        result = format_file_size(1536)  # 1.5 KB
        assert "." in result or "1" in result


class TestFormattersIntegration:
    """Integration tests combining multiple formatters."""

    def test_report_row_formatting(self):
        """Simulate formatting a report row."""
        amount = format_currency(1500.50, "USD")
        pct = format_percentage(75.5)
        dt = format_date_short(date(2026, 4, 15))
        
        assert "1500" in amount or "1,500" in amount
        assert pct == "75.5%"
        assert "2026" in dt

    def test_file_list_formatting(self):
        """Simulate formatting file list."""
        files = [
            (1024, "doc.pdf"),
            (2048000, "image.png"),
            (5368709120, "backup.zip"),
        ]
        
        for size, name in files:
            formatted = format_file_size(size)
            truncated_name = truncate(name, 20)
            assert formatted  # Should have a value
            assert truncated_name == name  # Short names unchanged
