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
