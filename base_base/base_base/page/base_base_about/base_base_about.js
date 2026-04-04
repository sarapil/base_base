// Copyright (c) 2024, Arkan Lab — https://arkan.it.com
// License: MIT

frappe.pages["base-base-about"].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __("About Base Base"),
        single_column: true,
    });

    page.main.addClass("base-base-about-page");
    const $container = $('<div class="fv-about-container"></div>').appendTo(page.main);

    // Use frappe.visual.generator for premium rendering
    const renderWithGenerator = async () => {
        try {
            await frappe.visual.generator.aboutPage(
                $container[0],
                "base_base",
                {
                    color: "#6B7280",
                    mainDoctype: null,
                    features: [
        {
                "icon": "puzzle",
                "title": "Shared Utilities",
                "description": "Common Python and JavaScript utilities used across all Arkan Lab apps."
        },
        {
                "icon": "code",
                "title": "Helper Functions",
                "description": "Date formatting, string manipulation, validation, and conversion helpers."
        },
        {
                "icon": "database",
                "title": "Base Fixtures",
                "description": "Shared Custom Fields, Print Formats, and configuration templates."
        },
        {
                "icon": "shield",
                "title": "Security Utilities",
                "description": "Permission checking, role validation, and CAPS integration helpers."
        }
],
                    roles: null,
                    ctas: [
                        { label: __("Start Onboarding"), route: "base-base-onboarding", primary: true },
                        { label: __("Open Settings"), route: "app/base-base-settings" },
                    ],
                }
            );
        } catch(e) {
            console.warn("Generator failed, using fallback:", e);
            renderFallback($container);
        }
    };

    const renderFallback = ($el) => {
        $el.html(`
            <div style="text-align:center;padding:60px 20px">
                <h1 style="font-size:2.5rem;font-weight:800;background:linear-gradient(135deg,#6B7280,#333);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${__("Base Base")}</h1>
                <p style="font-size:1.15rem;color:var(--text-muted);max-width:600px;margin:16px auto">${__("Common Python and JavaScript utilities used across all Arkan Lab apps.")}</p>
                <div style="margin-top:24px">
                    <a href="/app/base-base-onboarding" class="btn btn-primary btn-lg">${__("Start Onboarding")}</a>
                </div>
            </div>
        `);
    };

    if (frappe.visual && frappe.visual.generator) {
        renderWithGenerator();
    } else {
        frappe.require("frappe_visual.bundle.js", () => {
            if (frappe.visual && frappe.visual.generator) {
                renderWithGenerator();
            } else {
                renderFallback($container);
            }
        });
    }
};
