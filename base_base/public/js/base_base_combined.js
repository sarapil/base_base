/* base_base — Combined JS (reduces HTTP requests) */
/* Auto-generated from 4 individual files */


/* === base_base.js === */
// Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
// Developer Website: https://arkan.it.com
// License: MIT
// For license information, please see license.txt

/**
 * Base Base App - Custom Sidebar and Root Redirect
 * Compatible with Frappe v16+
 *
 * This module provides a categorized collapsible sidebar for Frappe/ERPNext
 * Features:
 * - Categorized collapsible sidebar menus
 * - Hides duplicate items from original sidebar
 * - Uses original icons from workspaces
 * - Adds default icons for items without icons
 */

(function() {
    'use strict';

    console.log('Base Base v2.0: Script loaded (Frappe v16 compatible)');

    // Namespace for Base Base
    window.base_base = window.base_base || {};

    // ============================================
    // WORKSPACE ICONS FROM DATABASE
    // ============================================
    base_base.workspaceIconsDB = {
        'arkan-wifi-manager': 'wifi',
        'arkspace': 'building',
        'arrowz': 'broadcast',
        'lms': 'education',
        'manufacturing': 'organization',
        'tax-&-benefits': 'crm',
        'employee-lifecycle': 'assign',
        'shift-&-attendance': 'milestone',
        'performance': 'star',
        'wiki': 'education',
        'hr': 'hr',
        'hr-module': 'hr',
        'salary-payout': 'income',
        'expense-claims': 'expenses',
        'frappe-builder': 'getting-started',
        'integrations': 'integration',
        'build': 'tool',
        'accounting': 'accounting',
        'financial-reports': 'file',
        'receivables': 'arrow-right',
        'payables': 'arrow-left',
        'assets': 'assets',
        'tools': 'tool',
        'users': 'users',
        'leaves': 'non-profit',
        'crm': 'crm',
        'erpnext-integrations': 'integration',
        'welcome-workspace': 'image-view',
        'buying': 'buying',
        'projects': 'project',
        'stock': 'stock',
        'selling': 'sell',
        'erpnext-settings': 'setting',
        'website': 'website',
        'support': 'support',
        'quality': 'quality',
        'home': 'getting-started',
        'recruitment': 'users',
        'payroll': 'money-coins-1'
    };

    // ============================================
    // ROUTE REDIRECTS: Disabled for Frappe v16
    // In v16, /desk is the main route and /app redirects to /desk
    // No custom redirects needed - Frappe handles this natively
    // ============================================
    base_base.handleRouteRedirects = function() {
        // Disabled for v16 - routes are handled by Frappe core
        return false;
    };

    // Alias for backward compatibility
    base_base.handleRootRedirect = base_base.handleRouteRedirects;

    // ============================================
    // SIDEBAR CONFIGURATION (default fallback)
    // ============================================
    base_base.getDefaultSidebarConfig = function() {
        return {
            TopApps: {
                label: __('Apps'),
                icon: 'grid',
                order: 1,
                items: [
                    { label: __('Arrowz'), workspace: 'Arrowz' },
                    { label: __('ARKSpace'), workspace: 'ARKSpace' },
                    { label: __('Arkan WiFi'), workspace: 'Arkan WiFi Manager' }
                ]
            },
            Management: {
                label: __('Management'),
                icon: 'organization',
                order: 2,
                items: [
                    { label: __('CRM'), workspace: 'CRM' },
                    { label: __('HR'), workspace: 'HR' },
                    { label: __('LMS'), workspace: 'LMS' },
                    { label: __('Support'), workspace: 'Support' },
                    { label: __('Projects'), workspace: 'Projects' },
                    { label: __('Quality'), workspace: 'Quality' },
                    { label: __('Assets'), workspace: 'Assets' }
                ]
            },
            Admin: {
                label: __('Admin'),
                icon: 'setting-gear',
                order: 3,
                items: [
                    { label: __('Users'), workspace: 'Users' },
                    { label: __('Integrations'), workspace: 'Integrations' },
                    { label: __('ERPNext Integrations'), workspace: 'ERPNext Integrations' },
                    { label: __('ERPNext Settings'), workspace: 'ERPNext Settings' },
                    { label: __('Website'), workspace: 'Website' }
                ]
            },
            Finance: {
                label: __('Finance'),
                icon: 'income',
                order: 4,
                items: [
                    { label: __('Accounting'), workspace: 'Accounting' },
                    { label: __('Buying'), workspace: 'Buying' },
                    { label: __('Selling'), workspace: 'Selling' },
                    { label: __('Stock'), workspace: 'Stock' },
                    { label: __('Payroll'), workspace: 'Payroll' }
                ]
            },
            Development: {
                label: __('Development'),
                icon: 'developer-mode',
                order: 5,
                items: [
                    { label: __('Build'), workspace: 'Build' },
                    { label: __('Frappe Builder'), workspace: 'Frappe Builder' }
                ]
            },
            Tools: {
                label: __('Tools'),
                icon: 'tool',
                order: 6,
                items: [
                    { label: __('Tools'), workspace: 'Tools' },
                    { label: __('Wiki'), workspace: 'Wiki' }
                ]
            }
        };
    };

    // Workspaces to hide completely from sidebar
    base_base.hiddenWorkspaces = ['home', 'manufacturing'];

    // Get sidebar config from boot or use default
    base_base.getSidebarConfig = function() {
        if (frappe.boot && frappe.boot.base_base && frappe.boot.base_base.sidebar_config) {
            return frappe.boot.base_base.sidebar_config;
        }
        return base_base.getDefaultSidebarConfig();
    };

    // ============================================
    // SIDEBAR MANAGER CLASS
    // ============================================
    base_base.SidebarManager = class SidebarManager {
        constructor() {
            this.config = base_base.getSidebarConfig();
            this.sidebarContainer = null;
            this.collapsedState = this.loadCollapsedState();
            this.workspaceIcons = {}; // Store icons from original sidebar
            this.categorizedWorkspaces = new Set(); // Track workspaces in our categories
        }

        loadCollapsedState() {
            try {
                const saved = localStorage.getItem('base_base_sidebar_state');
                return saved ? JSON.parse(saved) : {};
            } catch (e) {
                return {};
            }
        }

        saveCollapsedState() {
            try {
                localStorage.setItem('base_base_sidebar_state', JSON.stringify(this.collapsedState));
            } catch (e) {
                console.warn('Could not save sidebar state');
            }
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            const checkInterval = setInterval(() => {
                const sidebar = document.querySelector('.desk-sidebar');
                if (sidebar && sidebar.children.length > 0) {
                    clearInterval(checkInterval);
                    this.enhanceSidebar();
                }
            }, 500);

            setTimeout(() => clearInterval(checkInterval), 10000);
        }

        enhanceSidebar() {
            this.sidebarContainer = document.querySelector('.desk-sidebar');
            if (!this.sidebarContainer) return;

            // Step 1: Collect all workspaces that will be in our categories
            this.collectCategorizedWorkspaces();

            // Step 2: Extract icons from original sidebar items
            this.extractOriginalIcons();

            // Step 3: Hide duplicate items from original sidebar
            this.hideDuplicateItems();

            // Step 4: Create enhanced sidebar with icons
            this.createCategorizedSidebar();

            // Step 5: Add event listeners
            this.bindEvents();
        }

        collectCategorizedWorkspaces() {
            console.log('🔵 Base Base: Config categories:', Object.keys(this.config));
            console.log('🔵 Base Base: TopApps exists?', !!this.config.TopApps);
            console.log('🔵 Base Base: Management items:', this.config.Management?.items?.length);
            Object.values(this.config).forEach(category => {
                if (category.items) {
                    category.items.forEach(item => {
                        const slug = this.getSlug(item.workspace);
                        this.categorizedWorkspaces.add(slug);
                        this.categorizedWorkspaces.add(item.workspace.toLowerCase());
                        // Also add with spaces replaced by hyphens
                        this.categorizedWorkspaces.add(item.workspace.toLowerCase().replace(/\s+/g, '-'));
                        // Add title as well
                        this.categorizedWorkspaces.add(item.label ? item.label.toLowerCase() : item.workspace.toLowerCase());
                    });
                }
            });

            // Also add hidden workspaces to the list
            if (base_base.hiddenWorkspaces) {
                base_base.hiddenWorkspaces.forEach(ws => {
                    this.categorizedWorkspaces.add(ws.toLowerCase());
                    this.categorizedWorkspaces.add(ws.toLowerCase().replace(/\s+/g, '-'));
                });
            }

            console.log('Base Base: Categorized workspaces to hide:', Array.from(this.categorizedWorkspaces));
        }

        extractOriginalIcons() {
            // Find all sidebar-item-container elements (this is the main container)
            const sidebarItems = this.sidebarContainer.querySelectorAll('.sidebar-item-container');

            sidebarItems.forEach(item => {
                const itemName = (item.getAttribute('item-name') || '').toLowerCase();
                const link = item.querySelector('a.item-anchor');

                if (link) {
                    const href = link.getAttribute('href') || '';
                    const slug = href.replace('/desk/', '').replace('/private/', '').split('?')[0].toLowerCase();

                    // Get icon from item-icon attribute on sidebar-item-icon span
                    let icon = null;
                    const iconHolder = item.querySelector('.sidebar-item-icon[item-icon]');
                    if (iconHolder) {
                        icon = iconHolder.getAttribute('item-icon');
                    }

                    // Also try to get from SVG use element
                    if (!icon) {
                        const useEl = item.querySelector('svg use');
                        if (useEl) {
                            const hrefAttr = useEl.getAttribute('href') || useEl.getAttribute('xlink:href') || '';
                            const extractedIcon = hrefAttr.replace('#icon-', '').replace('#', '');
                            if (extractedIcon) {
                                icon = extractedIcon;
                            }
                        }
                    }

                    if (icon) {
                        if (slug) this.workspaceIcons[slug] = icon;
                        if (itemName) this.workspaceIcons[itemName] = icon;
                    }
                }
            });

            console.log('Base Base: Extracted workspace icons:', this.workspaceIcons);
        }

        hideDuplicateItems() {
            // Target .sidebar-item-container which is the main wrapper for each sidebar item
            const sidebarItems = this.sidebarContainer.querySelectorAll('.sidebar-item-container');
            let hiddenCount = 0;

            sidebarItems.forEach(item => {
                const itemName = (item.getAttribute('item-name') || '').toLowerCase();
                const link = item.querySelector('a.item-anchor');

                let shouldHide = false;

                // Check by item-name attribute
                if (itemName && this.categorizedWorkspaces.has(itemName)) {
                    shouldHide = true;
                }

                // Check by item-name with hyphen
                const itemNameHyphen = itemName.replace(/\s+/g, '-');
                if (this.categorizedWorkspaces.has(itemNameHyphen)) {
                    shouldHide = true;
                }

                if (link) {
                    const href = link.getAttribute('href') || '';
                    const slug = href.replace('/desk/', '').replace('/private/', '').split('?')[0].toLowerCase();

                    // Check by slug
                    if (this.categorizedWorkspaces.has(slug)) {
                        shouldHide = true;
                    }
                }

                if (shouldHide) {
                    item.classList.add('base-base-hidden');
                    hiddenCount++;
                }
            });

            console.log('Base Base: Hidden', hiddenCount, 'duplicate items');
        }

        getSlug(workspaceName) {
            if (frappe.router && frappe.router.slug) {
                return frappe.router.slug(workspaceName);
            }
            return workspaceName.toLowerCase().replace(/\s+/g, '-');
        }

        getIconForWorkspace(workspaceName) {
            const slug = this.getSlug(workspaceName);

            // First try to get from database icons (most reliable)
            if (base_base.workspaceIconsDB[slug]) {
                return base_base.workspaceIconsDB[slug];
            }

            // Try with workspace name as slug
            const nameSlug = workspaceName.toLowerCase().replace(/\s+/g, '-');
            if (base_base.workspaceIconsDB[nameSlug]) {
                return base_base.workspaceIconsDB[nameSlug];
            }

            // Try extracted icons from sidebar
            if (this.workspaceIcons[slug]) {
                return this.workspaceIcons[slug];
            }
            if (this.workspaceIcons[workspaceName.toLowerCase()]) {
                return this.workspaceIcons[workspaceName.toLowerCase()];
            }

            // Return default icon
            return 'folder-normal';
        }

        createCategorizedSidebar() {
            // Remove any existing base-base sidebar menus to prevent duplicates
            const existingMenus = this.sidebarContainer.querySelectorAll('.base-base-sidebar-menu');
            existingMenus.forEach(menu => menu.remove());

            // Remove any existing separators
            const existingSeparators = this.sidebarContainer.querySelectorAll('.base-base-sidebar-separator');
            existingSeparators.forEach(sep => sep.remove());

            const menuWrapper = document.createElement('div');
            menuWrapper.className = 'base-base-sidebar-menu';

            // Sort categories by order
            const sortedCategories = Object.entries(this.config)
                .sort((a, b) => (a[1].order || 99) - (b[1].order || 99));

            sortedCategories.forEach(([categoryKey, category]) => {
                const section = this.createCategorySection(categoryKey, category);
                if (section) {
                    menuWrapper.appendChild(section);
                }
            });

            const separator = document.createElement('div');
            separator.className = 'base-base-sidebar-separator';

            // Insert in correct order: menuWrapper first, then separator
            this.sidebarContainer.insertBefore(separator, this.sidebarContainer.firstChild);
            this.sidebarContainer.insertBefore(menuWrapper, this.sidebarContainer.firstChild);
        }

        createCategorySection(key, category) {
            console.log('🔵 Base Base: Creating category:', key, 'with items:', category.items?.length);
            if (!category.items || category.items.length === 0) {
                return null;
            }

            const section = document.createElement('div');
            section.className = 'base-base-category';
            section.setAttribute('data-category', key);

            const isCollapsed = this.collapsedState[key] !== false;

            const header = document.createElement('div');
            header.className = 'base-base-category-header' + (isCollapsed ? '' : ' expanded');
            header.innerHTML = `
                <span class="category-icon">${frappe.utils.icon(category.icon || 'folder-normal', 'sm')}</span>
                <span class="category-label">${category.label}</span>
                <span class="category-chevron">${frappe.utils.icon(isCollapsed ? 'right' : 'down', 'xs')}</span>
            `;

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'base-base-category-items' + (isCollapsed ? ' collapsed' : '');

            category.items.forEach(item => {
                console.log('🔵 Base Base: Creating item:', item.label, '-> workspace:', item.workspace);
                const itemEl = this.createSidebarItem(item);
                if (itemEl) {
                    itemsContainer.appendChild(itemEl);
                }
            });

            section.appendChild(header);
            section.appendChild(itemsContainer);

            return section;
        }

        createSidebarItem(item) {
            const workspaceName = item.workspace;
            const slug = this.getSlug(workspaceName);
            const icon = this.getIconForWorkspace(workspaceName);

            const itemEl = document.createElement('div');
            itemEl.className = 'base-base-sidebar-item';
            itemEl.setAttribute('data-workspace', slug);

            const link = document.createElement('a');
            link.href = `/desk/${slug}`;
            link.className = 'base-base-sidebar-link';
            link.title = item.label;
            link.innerHTML = `
                <span class="item-icon">${frappe.utils.icon(icon, 'sm')}</span>
                <span class="item-label">${item.label}</span>
            `;

            if (window.location.pathname === `/desk/${slug}`) {
                itemEl.classList.add('selected');
            }

            itemEl.appendChild(link);
            return itemEl;
        }

        bindEvents() {
            this.sidebarContainer.querySelectorAll('.base-base-category-header').forEach(header => {
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const category = header.closest('.base-base-category');
                    const categoryKey = category.getAttribute('data-category');
                    const itemsContainer = category.querySelector('.base-base-category-items');
                    const chevron = header.querySelector('.category-chevron');

                    const isCurrentlyCollapsed = itemsContainer.classList.contains('collapsed');

                    if (isCurrentlyCollapsed) {
                        itemsContainer.classList.remove('collapsed');
                        header.classList.add('expanded');
                        chevron.innerHTML = frappe.utils.icon('down', 'xs');
                        this.collapsedState[categoryKey] = false;
                    } else {
                        itemsContainer.classList.add('collapsed');
                        header.classList.remove('expanded');
                        chevron.innerHTML = frappe.utils.icon('right', 'xs');
                        this.collapsedState[categoryKey] = true;
                    }

                    this.saveCollapsedState();
                });
            });

            // Update selected state on navigation
            $(document).on('page-change', () => {
                this.updateSelectedState();
            });

            // Also listen for frappe route change
            if (frappe.router) {
                frappe.router.on('change', () => {
                    this.updateSelectedState();
                });
            }
        }

        updateSelectedState() {
            this.sidebarContainer.querySelectorAll('.base-base-sidebar-item.selected').forEach(el => {
                el.classList.remove('selected');
            });

            const currentPath = window.location.pathname;
            this.sidebarContainer.querySelectorAll('.base-base-sidebar-link').forEach(link => {
                if (link.getAttribute('href') === currentPath) {
                    link.closest('.base-base-sidebar-item').classList.add('selected');
                }
            });
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    // Force execution to apply sidebar and page body modifications
    base_base.forceApply = function() {
        if (!base_base.sidebar) {
            base_base.sidebar = new base_base.SidebarManager();
        }
        base_base.sidebar.init();
        base_base.modifyPageBody();
    };

    if (!base_base.handleRootRedirect()) {
        $(document).ready(function() {
            // Apply once after DOM is ready
            setTimeout(() => base_base.forceApply(), 500);
        });

        // Re-apply on SPA navigation (debounced)
        if (typeof frappe !== 'undefined' && frappe.router) {
            let _applyTimer = null;
            frappe.router.on('change', function() {
                clearTimeout(_applyTimer);
                _applyTimer = setTimeout(() => base_base.forceApply(), 300);
            });
        }
    }

    // ============================================
    // PAGE BODY MODIFICATION
    // ============================================
    base_base.modifyPageBody = function() {
        const pageBody = document.querySelector('.page-body');
        if (pageBody) {
            // Remove any existing base-base spacers
            const existingSpacers = pageBody.querySelectorAll('.base-base-page-spacer');
            existingSpacers.forEach(spacer => spacer.remove());

            // Disable scroll
            pageBody.style.overflow = 'hidden';
        }
    };

    // Alias for backward compatibility
    base_base.modifyLayoutWrapper = base_base.modifyPageBody;

    // Disabled for Frappe v16 - routes are handled natively
    // if (typeof frappe !== 'undefined' && frappe.boot) {
    //     frappe.after_ajax && frappe.after_ajax(() => {
    //         if (window.location.pathname === '/' || window.location.pathname === '') {
    //             window.location.href = '/desk/home';
    //         }
    //     });
    // }

})();


/* === fv_integration.js === */
// Copyright (c) 2024, Arkan Lab — https://arkan.it.com
// License: MIT
// frappe_visual Integration for Base Base

(function() {
    "use strict";

    // App branding registration
    const APP_CONFIG = {
        name: "base_base",
        title: "Base Base",
        color: "#6B7280",
        module: "Base Base",
    };

    // Initialize visual enhancements when ready
    $(document).on("app_ready", function() {
        // Register app color with visual theme system
        if (frappe.visual && frappe.visual.ThemeManager) {
            try {
                document.documentElement.style.setProperty(
                    "--base-base-primary",
                    APP_CONFIG.color
                );
            } catch(e) {}
        }

        // Initialize bilingual tooltips for Arabic support
        if (frappe.visual && frappe.visual.bilingualTooltip) {
            // bilingualTooltip auto-initializes — just ensure it's active
        }
    });

    // Route-based visual page rendering
    $(document).on("page-change", function() {
        if (!frappe.visual || !frappe.visual.generator) return;


    // Visual Reports Hub
    if (frappe.get_route_str() === 'base-base-reports') {
        const page = frappe.container.page;
        if (page && page.main && frappe.visual.generator) {
            frappe.visual.generator.reportsHub(
                page.main[0] || page.main,
                "Base Base"
            );
        }
    }
    });
})();


/* === licensing.js === */
// Copyright (c) 2024, Moataz M Hassan (Arkan Lab)
// Developer Website: https://arkan.it.com
// License: MIT
// For license information, please see license.txt

/**
 * Arkan Lab — Unified Licensing Client
 * =====================================
 * Provides client-side helpers for feature gating across all paid apps.
 *
 * Usage from any app's JS:
 *
 *   // Check if a feature is enabled
 *   if (arkan.licensing.isEnabled("velara", "ai_pricing")) { ... }
 *
 *   // Guard a callback — shows upgrade prompt if not premium
 *   arkan.licensing.requirePremium("vertex", "advanced_analytics",
 *       __("Advanced Analytics"), () => { ... });
 *
 *   // Get license info for an app
 *   arkan.licensing.getStatus("arrowz").then(info => console.log(info));
 */

(function () {
    "use strict";

    // ── Namespace ────────────────────────────────────────────────
    window.arkan = window.arkan || {};
    arkan.licensing = arkan.licensing || {};

    // Per-app caches
    arkan.licensing._features = {};  // { app_name: { feature: bool } }
    arkan.licensing._status = {};    // { app_name: { is_premium, tier, ... } }
    arkan.licensing._loading = {};   // { app_name: Promise }

    // ── Load features for an app ─────────────────────────────────

    /**
     * Load the feature map for an app. Returns a Promise.
     * Caches the result so subsequent calls are instant.
     */
    arkan.licensing.loadFeatures = function (app_name) {
        if (arkan.licensing._features[app_name]) {
            return Promise.resolve(arkan.licensing._features[app_name]);
        }

        // Dedup concurrent loads
        if (arkan.licensing._loading[app_name]) {
            return arkan.licensing._loading[app_name];
        }

        arkan.licensing._loading[app_name] = new Promise((resolve) => {
            frappe.call({
                method: "base_base.utils.feature_gating.get_features",
                args: { app_name },
                callback: (r) => {
                    arkan.licensing._features[app_name] = r.message || {};
                    resolve(arkan.licensing._features[app_name]);
                },
                error: () => {
                    arkan.licensing._features[app_name] = {};
                    resolve({});
                },
            });
        });

        return arkan.licensing._loading[app_name];
    };

    // ── Check feature ────────────────────────────────────────────

    /**
     * Synchronous check if a feature is enabled.
     * Call loadFeatures() first or accept that it defaults to false
     * until the async load completes.
     */
    arkan.licensing.isEnabled = function (app_name, feature_key) {
        const features = arkan.licensing._features[app_name] || {};
        return features[feature_key] === true;
    };

    // ── Upgrade prompt ───────────────────────────────────────────

    /**
     * Show a professional upgrade prompt with a marketplace link.
     */
    arkan.licensing.showUpgradePrompt = function (app_name, feature_name) {
        const urls = {
            auracrm: "https://frappecloud.com/marketplace/apps/auracrm",
            velara: "https://frappecloud.com/marketplace/apps/velara",
            vertex: "https://frappecloud.com/marketplace/apps/vertex",
            arrowz: "https://frappecloud.com/marketplace/apps/arrowz",
            candela: "https://frappecloud.com/marketplace/apps/candela",
            arkspace: "https://frappecloud.com/marketplace/apps/arkspace",
        };
        const url = urls[app_name] || "https://frappecloud.com/marketplace";

        frappe.msgprint({
            title: __("Premium Feature"),
            indicator: "blue",
            message: `
                <div style="text-align:center; padding: 1rem;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔒</div>
                    <p><strong>${frappe.utils.escape_html(feature_name)}</strong>
                       ${__("requires a premium license.")}</p>
                    <p style="color: var(--text-muted); font-size: var(--text-sm);">
                        ${__("Subscribe on Frappe Cloud Marketplace or contact Arkan Lab for a license key.")}
                    </p>
                    <a href="${frappe.utils.escape_html(url)}"
                       target="_blank" rel="noopener"
                       class="btn btn-primary btn-sm mt-3">
                        ${__("Upgrade Now")}
                    </a>
                </div>
            `,
        });
    };

    // ── Require premium ──────────────────────────────────────────

    /**
     * Guard a callback behind premium check.
     * If the feature is enabled, runs callback immediately.
     * Otherwise shows upgrade prompt.
     */
    arkan.licensing.requirePremium = function (app_name, feature_key, feature_name, callback) {
        if (arkan.licensing.isEnabled(app_name, feature_key)) {
            callback();
        } else {
            arkan.licensing.showUpgradePrompt(app_name, feature_name);
        }
    };

    // ── Get license status ───────────────────────────────────────

    /**
     * Fetch license status for an app. Returns a Promise.
     */
    arkan.licensing.getStatus = function (app_name) {
        if (arkan.licensing._status[app_name]) {
            return Promise.resolve(arkan.licensing._status[app_name]);
        }

        return new Promise((resolve) => {
            frappe.call({
                method: "base_base.utils.licensing.get_app_license_status",
                args: { app_name },
                callback: (r) => {
                    arkan.licensing._status[app_name] = r.message || {};
                    resolve(arkan.licensing._status[app_name]);
                },
                error: () => resolve({}),
            });
        });
    };

    // ── Clear cache ──────────────────────────────────────────────

    arkan.licensing.clearCache = function (app_name) {
        delete arkan.licensing._features[app_name];
        delete arkan.licensing._status[app_name];
        delete arkan.licensing._loading[app_name];
    };

    console.log("Arkan Licensing: Client library loaded");
})();


/* === xr_mixin.js === */
/**
 * XR Mixin for Frappe Page Controllers
 * Adds VR/AR buttons and session management to any 3D page.
 *
 * Usage:
 *   // In your page controller constructor, after engine is available:
 *   frappe.base_base.xr_mixin.attach(this, {
 *       get_engine: () => this.engine,
 *       get_spatial_data: () => this.get_xr_panels(),  // optional
 *       vr_options: {},  // optional VRViewer overrides
 *       ar_options: {},  // optional AROverlay overrides
 *   });
 *
 * This adds:
 *   - "Enter VR" and "View in AR" toolbar buttons (auto-hidden if unsupported)
 *   - this.enterXR("vr"|"ar") method
 *   - this.exitXR() method
 *   - SpatialUI panels from get_spatial_data() callback
 *   - Hand tracking + teleport navigation in VR
 */
frappe.provide("frappe.base_base.xr_mixin");

frappe.base_base.xr_mixin = {
	attach(controller, opts = {}) {
		controller._xr_opts = opts;
		controller._xr_session = null;
		controller._xr_spatial = null;

		controller.enterXR = async function (mode) {
			const engine = opts.get_engine?.();
			if (!engine) {
				frappe.msgprint(__("3D engine not initialized. Load a model first."));
				return;
			}

			frappe.dom.freeze(__("Starting XR session..."));

			try {
				const xr = await frappe.visual.loadXR();
				const support = await xr.isSupported();

				if (mode === "vr" && !support.vr) {
					frappe.msgprint(__("WebXR VR is not supported on this device/browser."));
					return;
				}
				if (mode === "ar" && !support.ar) {
					frappe.msgprint(__("WebXR AR is not supported on this device/browser."));
					return;
				}

				if (mode === "vr") {
					const vr_opts = Object.assign(
						{ scene: engine.scene, teleport: true, spatialUI: true, controllers: true },
						opts.vr_options || {}
					);

					controller._xr_session = new frappe.visual.xr.VRViewer(
						engine.renderer.domElement.parentElement,
						Object.assign(vr_opts, { engine })
					);
					await controller._xr_session.init();

					// Spatial UI panels
					if (opts.get_spatial_data) {
						controller._xr_spatial = new frappe.visual.xr.SpatialUI(engine);
						const panels = opts.get_spatial_data();
						if (Array.isArray(panels)) {
							panels.forEach((p) => {
								const panel = controller._xr_spatial.createPanel(p.content, p.position);
								if (p.billboard !== false) {
									controller._xr_spatial.enableBillboard(panel);
								}
							});
						}
					}

					frappe.show_alert({ message: __("VR session started"), indicator: "blue" });
				} else if (mode === "ar") {
					const ar_opts = Object.assign(
						{ shadowPlane: true, measurements: true },
						opts.ar_options || {}
					);

					controller._xr_session = new frappe.visual.xr.AROverlay(
						engine.renderer.domElement.parentElement,
						Object.assign(ar_opts, { engine })
					);
					await controller._xr_session.init();

					frappe.show_alert({ message: __("AR session started — point camera at a surface"), indicator: "green" });
				}
			} catch (e) {
				frappe.msgprint({
					title: __("XR Error"),
					indicator: "red",
					message: e.message || __("Failed to start XR session"),
				});
			} finally {
				frappe.dom.unfreeze();
			}
		};

		controller.exitXR = function () {
			if (controller._xr_spatial) {
				controller._xr_spatial.dispose();
				controller._xr_spatial = null;
			}
			if (controller._xr_session) {
				controller._xr_session.dispose();
				controller._xr_session = null;
			}
			frappe.show_alert({ message: __("XR session ended"), indicator: "gray" });
		};

		// Add toolbar buttons (only if support can be detected)
		controller._xr_add_buttons = function () {
			controller.page.add_inner_button(__("Enter VR"), () => controller.enterXR("vr"), __("XR"));
			controller.page.add_inner_button(__("View in AR"), () => controller.enterXR("ar"), __("XR"));
		};

		// Auto-add buttons
		controller._xr_add_buttons();
	},
};

