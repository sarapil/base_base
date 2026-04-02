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
    
    console.log('🔵 Base Base: Script loaded at', new Date().toISOString());

    // Force execution multiple times to ensure it works
    base_base.forceApply = function() {
        console.log('🔵 Base Base: forceApply called');
        
        // Initialize sidebar
        if (!base_base.sidebar) {
            base_base.sidebar = new base_base.SidebarManager();
        }
        base_base.sidebar.init();
        
        // Modify page body
        base_base.modifyPageBody();
        
        console.log('🔵 Base Base: forceApply completed');
    };
    
    if (!base_base.handleRootRedirect()) {
        console.log('🔵 Base Base: No redirect needed, initializing sidebar...');
        
        // Execute immediately when DOM is ready
        $(document).ready(function() {
            console.log('🔵 Base Base: Document ready');
            
            // Try multiple times with increasing delays
            setTimeout(() => base_base.forceApply(), 500);
            setTimeout(() => base_base.forceApply(), 1500);
            setTimeout(() => base_base.forceApply(), 3000);
        });
        
        // Also execute on page change (SPA navigation)
        if (typeof frappe !== 'undefined' && frappe.router) {
            frappe.router.on('change', function() {
                console.log('🔵 Base Base: Route changed, re-applying...');
                setTimeout(() => base_base.forceApply(), 500);
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
            
            console.log('Base Base: Modified .page-body (disabled scroll)');
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
