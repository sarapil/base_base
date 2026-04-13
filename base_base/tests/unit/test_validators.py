# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Unit tests for base_base.utils.validators module.
"""

import pytest
import frappe

from base_base.utils.validators import (
    validate_required,
    validate_email,
    validate_phone,
    validate_positive_number,
    validate_in_list,
    sanitize_html,
)


class TestValidateRequired:
    """Tests for validate_required function."""

    def test_valid_string(self):
        """Non-empty string should pass."""
        # Should not raise
        validate_required("test value", "Field Name")

    def test_valid_number(self):
        """Non-zero number should pass."""
        validate_required(123, "Field Name")
        validate_required(0.5, "Field Name")

    def test_empty_string_raises(self):
        """Empty string should raise ValidationError."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_required("", "Customer Name")
        assert "Customer Name" in str(exc_info.value)
        assert "required" in str(exc_info.value).lower()

    def test_none_raises(self):
        """None should raise ValidationError."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_required(None, "Email")
        assert "Email" in str(exc_info.value)

    def test_zero_raises(self):
        """Zero should raise (falsy value)."""
        with pytest.raises(frappe.ValidationError):
            validate_required(0, "Quantity")

    def test_empty_list_raises(self):
        """Empty list should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_required([], "Items")


class TestValidateEmail:
    """Tests for validate_email function."""

    def test_valid_simple_email(self):
        """Standard email format should pass."""
        assert validate_email("user@example.com") is True

    def test_valid_complex_email(self):
        """Email with dots and plus should pass."""
        assert validate_email("user.name+tag@example.co.uk") is True

    def test_valid_numeric_email(self):
        """Email with numbers should pass."""
        assert validate_email("user123@domain456.org") is True

    def test_invalid_no_at(self):
        """Email without @ should raise."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_email("userexample.com")
        assert "Invalid email" in str(exc_info.value)

    def test_invalid_no_domain(self):
        """Email without domain should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_email("user@")

    def test_invalid_no_tld(self):
        """Email without TLD should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_email("user@example")

    def test_invalid_empty(self):
        """Empty string should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_email("")

    def test_invalid_none(self):
        """None should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_email(None)

    def test_invalid_spaces(self):
        """Email with spaces should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_email("user @example.com")


class TestValidatePhone:
    """Tests for validate_phone function."""

    def test_valid_international(self):
        """International format with + should pass."""
        assert validate_phone("+12345678901") is True

    def test_valid_without_plus(self):
        """Without + but valid digits should pass."""
        assert validate_phone("12345678901") is True

    def test_valid_with_spaces(self):
        """Spaces should be stripped and pass."""
        assert validate_phone("+1 234 567 8901") is True

    def test_valid_with_dashes(self):
        """Dashes should be stripped and pass."""
        assert validate_phone("+1-234-567-8901") is True

    def test_valid_with_parentheses(self):
        """Parentheses should be stripped and pass."""
        assert validate_phone("+1 (234) 567-8901") is True

    def test_invalid_too_short(self):
        """Phone number too short should raise."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_phone("12345")
        assert "Invalid phone" in str(exc_info.value)

    def test_invalid_too_long(self):
        """Phone number too long should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_phone("+123456789012345678")

    def test_invalid_letters(self):
        """Phone with letters should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_phone("+1234abc5678")

    def test_invalid_empty(self):
        """Empty string should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_phone("")

    def test_invalid_none(self):
        """None should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_phone(None)

    def test_invalid_starts_with_zero(self):
        """Phone starting with 0 after + should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_phone("+0123456789")


class TestValidatePositiveNumber:
    """Tests for validate_positive_number function."""

    def test_valid_positive_int(self):
        """Positive integer should pass."""
        validate_positive_number(100, "Amount")

    def test_valid_positive_float(self):
        """Positive float should pass."""
        validate_positive_number(99.99, "Price")

    def test_valid_small_positive(self):
        """Small positive number should pass."""
        validate_positive_number(0.001, "Rate")

    def test_zero_raises(self):
        """Zero should raise (must be > 0)."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_positive_number(0, "Quantity")
        assert "greater than zero" in str(exc_info.value).lower()

    def test_negative_raises(self):
        """Negative number should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_positive_number(-50, "Amount")

    def test_string_number_works(self):
        """String representation of number should work."""
        validate_positive_number("100", "Amount")
        validate_positive_number("99.5", "Rate")

    def test_invalid_string_raises(self):
        """Non-numeric string should raise."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_positive_number("abc", "Value")
        assert "must be a number" in str(exc_info.value).lower()

    def test_none_raises(self):
        """None should raise."""
        with pytest.raises(frappe.ValidationError):
            validate_positive_number(None, "Amount")


class TestValidateInList:
    """Tests for validate_in_list function."""

    def test_valid_string_in_list(self):
        """String value in list should pass."""
        validate_in_list("Draft", ["Draft", "Active", "Cancelled"], "Status")

    def test_valid_number_in_list(self):
        """Number value in list should pass."""
        validate_in_list(1, [1, 2, 3], "Priority")

    def test_invalid_not_in_list(self):
        """Value not in list should raise."""
        with pytest.raises(frappe.ValidationError) as exc_info:
            validate_in_list("Pending", ["Draft", "Active"], "Status")
        assert "must be one of" in str(exc_info.value).lower()
        assert "Draft, Active" in str(exc_info.value)

    def test_case_sensitive(self):
        """Validation is case-sensitive."""
        with pytest.raises(frappe.ValidationError):
            validate_in_list("draft", ["Draft", "Active"], "Status")

    def test_empty_list_always_raises(self):
        """Empty allowed list should always raise."""
        with pytest.raises(frappe.ValidationError):
            validate_in_list("any", [], "Field")


class TestSanitizeHtml:
    """Tests for sanitize_html function."""

    def test_plain_text_unchanged(self):
        """Plain text should remain unchanged."""
        result = sanitize_html("Hello, World!")
        assert result == "Hello, World!"

    def test_safe_html_preserved(self):
        """Safe HTML tags should be preserved."""
        result = sanitize_html("<b>Bold</b> and <i>italic</i>")
        assert "<b>Bold</b>" in result
        assert "<i>italic</i>" in result

    def test_script_removed(self):
        """Script tags should be removed."""
        result = sanitize_html("<script>alert('xss')</script>Hello")
        assert "<script>" not in result
        assert "alert" not in result
        assert "Hello" in result

    def test_onclick_removed(self):
        """onclick attributes should be removed."""
        result = sanitize_html('<div onclick="evil()">Content</div>')
        assert "onclick" not in result
        assert "Content" in result

    def test_empty_string_returns_empty(self):
        """Empty string should return empty."""
        assert sanitize_html("") == ""

    def test_none_returns_empty(self):
        """None should return empty string."""
        assert sanitize_html(None) == ""

    def test_javascript_url_removed(self):
        """javascript: URLs should be removed."""
        result = sanitize_html('<a href="javascript:alert(1)">Click</a>')
        assert "javascript:" not in result
