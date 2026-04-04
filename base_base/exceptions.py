# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

"""
Base Base — Custom Exception Hierarchy
القاعدة الأساسية
"""

import frappe


class BaseBaseError(Exception):
    """Base Base base exception — all app-specific errors inherit from this."""

    def __init__(self, message=None, title=None):
        self.message = message or frappe._("An error occurred in Base Base")
        self.title = title or frappe._("Base Base Error")
        super().__init__(self.message)


class ValidationError(BaseBaseError):
    """Raised when input validation fails."""

    def __init__(self, message=None, field=None):
        self.field = field
        super().__init__(
            message or frappe._("Validation failed"),
            title=frappe._("Validation Error"),
        )


class NotFoundError(BaseBaseError):
    """Raised when a requested resource is not found."""

    def __init__(self, doctype=None, name=None):
        msg = frappe._("{0} {1} not found").format(doctype or "Record", name or "")
        super().__init__(msg, title=frappe._("Not Found"))


class PermissionError(BaseBaseError):
    """Raised when user lacks required permissions."""

    def __init__(self, action=None, doctype=None):
        msg = frappe._("You do not have permission to {0} {1}").format(
            action or "access", doctype or "this resource"
        )
        super().__init__(msg, title=frappe._("Permission Denied"))


class ConfigurationError(BaseBaseError):
    """Raised when app configuration is incomplete or invalid."""

    def __init__(self, setting=None):
        msg = frappe._("Configuration error{0}").format(
            f": {setting}" if setting else ""
        )
        super().__init__(msg, title=frappe._("Configuration Error"))


class IntegrationError(BaseBaseError):
    """Raised when external service communication fails."""

    def __init__(self, service=None, detail=None):
        msg = frappe._("Integration error with {0}{1}").format(
            service or "external service",
            f" — {detail}" if detail else "",
        )
        super().__init__(msg, title=frappe._("Integration Error"))
