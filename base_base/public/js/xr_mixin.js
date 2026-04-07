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
