# Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
# Developer Website: https://arkan.it.com
# License: MIT
# For license information, please see license.txt

app_name = "base_base"
app_title = "Base Base"
app_publisher = "Base Application"
app_description = "Shared development utilities and patterns for Frappe apps"
app_email = "ahmedshaheen@example.com"
app_license = "mit"

# Apps
# ------------------

required_apps = ["frappe", "frappe_visual", "arkan_help"]

# Each item in the list will be shown as an app in the apps page
add_to_apps_screen = [
    {
        "name": "base_base",
        "logo": "/assets/base_base/images/base_base-logo.svg",
        "title": "Base Base",
        "route": "/desk/base-base",
    }
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# MEGA: app_include_css = ["/assets/base_base/css/base_base_combined.css"]
# MEGA: app_include_js = ["/assets/base_base/js/base_base_combined.js"]

# include js, css files in header of web template
# web_include_css = "/assets/base_base/css/base_base.css"
# web_include_js = "/assets/base_base/js/base_base.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "base_base/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "base_base/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# Note: In Frappe v16, /desk is the main route and /app redirects to /desk
home_page = "desk"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "base_base.utils.jinja_methods",
# 	"filters": "base_base.utils.jinja_filters"
# }

# Boot Session
# ------------
# Add sidebar config to boot session
extend_bootinfo = "base_base.boot.extend_bootinfo"

# Installation
# ------------

# before_install = "base_base.install.before_install"

# ─── Post-Migration Seed ───
after_migrate = ["base_base.seed.seed_data"]

after_install = "base_base.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "base_base.uninstall.before_uninstall"
# after_uninstall = "base_base.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "base_base.utils.before_app_install"
# after_app_install = "base_base.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "base_base.utils.before_app_uninstall"
# after_app_uninstall = "base_base.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "base_base.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"base_base.tasks.all"
# 	],
# 	"daily": [
# 		"base_base.tasks.daily"
# 	],
# 	"hourly": [
# 		"base_base.tasks.hourly"
# 	],
# 	"weekly": [
# 		"base_base.tasks.weekly"
# 	],
# 	"monthly": [
# 		"base_base.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "base_base.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "base_base.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "base_base.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["base_base.utils.before_request"]
# after_request = ["base_base.utils.after_request"]

# Job Events
# ----------
# before_job = ["base_base.utils.before_job"]
# after_job = ["base_base.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"base_base.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

# CAPS Integration — Capability-Based Access Control
# ------------------------------------------------------------
caps_capabilities = [
    {"name": "BB_manage_settings", "category": "Module", "description": "Configure Base Base settings"},
    {"name": "BB_manage_modules", "category": "Module", "description": "Manage shared utility modules"},
    {"name": "BB_admin_access", "category": "Action", "description": "Full administrative access"},
]

# Fixtures
# --------------------------------------------------------
fixtures = [
    {"dt": "Custom Field", "filters": [["module", "=", "Base Base"]]},
    {"dt": "Desktop Icon", "filters": [["app", "=", "base_base"]]},
    {"dt": "Workspace", "filters": [["module", "like", "Base Base%"]]},
]

app_icon = "/assets/base_base/images/base_base-logo.svg"
app_color = "#6366F1"
app_logo_url = "/assets/base_base/images/base_base-logo.svg"

# Website Route Rules
# --------------------------------------------------------
website_route_rules = [
    {"from_route": "/base-base-about", "to_route": "base_base_about"},
    {"from_route": "/base-base-onboarding", "to_route": "base_base_onboarding"},
    {"from_route": "/عن-base-base", "to_route": "base_base_about"},
    {"from_route": "/base-base/<path:app_path>", "to_route": "base-base/<app_path>"},
]
