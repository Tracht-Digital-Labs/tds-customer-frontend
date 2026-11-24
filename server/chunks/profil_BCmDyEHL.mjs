import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_CtyRAPF4.mjs";
import "./compiler_D-pGYtJh.mjs";
import { B as toast, C as Spinner, D as Tabs, E as TabPanel, G as formatDateTime, J as createComponent, O as Avatar, R as applyThemePreference, c as API_BASE, d as fetchMe, f as frontendFetch, g as LOGIN_URL, j as describeFailure, l as AUTH_API_URL, p as invalidateMe, t as $$Layout, y as FormAlert, z as readThemePreference } from "./Layout_B6-NSy9D.mjs";
import { t as Alert } from "./chunk-S5MXGWAS_2cpfCwdN.mjs";
import { a as Presence, o as TabIndicator } from "./chunk-VY4YAQC3_1HHwjtlN.mjs";
import { t as FileDropZone } from "./dropzone_ccp6l3V7.mjs";
import { useCallback, useEffect, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
/**
* Downscale in the browser before uploading.
*
* The production host has no guaranteed `ext-gd`, so the server validates and
* stores rather than transforms. Doing it here means a 4 MB phone photo becomes
* a ~30 KB square instead of a 413 the user has to solve with an image editor.
* Falls back to the original file if anything about canvas/WebP is unavailable —
* the server still enforces the real limit.
*/
async function downscaleAvatar(file) {
	try {
		const bitmap = await createImageBitmap(file);
		const side = Math.min(bitmap.width, bitmap.height);
		const canvas = document.createElement("canvas");
		canvas.width = 256;
		canvas.height = 256;
		const ctx = canvas.getContext("2d");
		if (!ctx) return file;
		const x = (bitmap.width - side) / 2;
		const y = (bitmap.height - side) / 2;
		ctx.drawImage(bitmap, x, y, side, side, 0, 0, 256, 256);
		bitmap.close?.();
		return await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", .9)) ?? file;
	} catch {
		return file;
	}
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/ProfileIdentity.tsx
/**
* Display name and picture, both in tds-auth-api: identity, and auth-api owns
* the `app_user` row. Only these two are editable here: `name` drives the admin
* user list and the public blog byline, and `email` is the login identity.
*
* The state lives in a hook the screen holds, not in the panel, so an unsaved
* name or a fresh picture survives switching tabs.
*/
function useProfileIdentity() {
	const [displayName, setDisplayName] = useState("");
	const [avatarUrl, setAvatarUrl] = useState(null);
	const [hasAvatar, setHasAvatar] = useState(false);
	const [saving, setSaving] = useState(false);
	const [avatarBusy, setAvatarBusy] = useState(false);
	/** Take the loaded principal's values as the starting point. */
	function adopt(me) {
		setDisplayName(me.displayName ?? "");
		setAvatarUrl(me.avatarUrl ?? null);
		setHasAvatar(Boolean(me.hasAvatar));
	}
	async function save() {
		setSaving(true);
		const res = await frontendFetch(`${AUTH_API_URL}/me`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ displayName: displayName.trim() })
		}).catch(() => null);
		setSaving(false);
		if (!res?.ok) {
			toast.danger(describeFailure(res, "Speichern fehlgeschlagen"));
			return;
		}
		invalidateMe();
		toast.success("Profil gespeichert.");
	}
	async function upload(file) {
		setAvatarBusy(true);
		try {
			const blob = await downscaleAvatar(file);
			if (blob.size > 2097152) {
				toast.warning("Das Bild ist zu groß (maximal 2 MB).");
				return;
			}
			const form = new FormData();
			form.append("file", blob, "avatar.webp");
			const res = await frontendFetch(`${AUTH_API_URL}/me/avatar`, {
				method: "POST",
				body: form
			}).catch(() => null);
			if (!res?.ok) {
				toast.danger(describeFailure(res, "Bild konnte nicht gespeichert werden"));
				return;
			}
			const body = await res.json().catch(() => ({}));
			setAvatarUrl(body.avatarUrl ?? null);
			setHasAvatar(true);
			invalidateMe();
			toast.success("Profilbild aktualisiert.");
		} finally {
			setAvatarBusy(false);
		}
	}
	async function removeAvatar() {
		setAvatarBusy(true);
		const res = await frontendFetch(`${AUTH_API_URL}/me/avatar`, { method: "DELETE" }).catch(() => null);
		setAvatarBusy(false);
		if (!res?.ok) {
			toast.danger(describeFailure(res, "Bild konnte nicht entfernt werden"));
			return;
		}
		setAvatarUrl(null);
		setHasAvatar(false);
		invalidateMe();
		toast.success("Profilbild entfernt.");
	}
	return {
		displayName,
		setDisplayName,
		avatarUrl,
		hasAvatar,
		saving,
		avatarBusy,
		adopt,
		save,
		upload,
		removeAvatar
	};
}
var hintStyle$2 = { color: "var(--color-muted)" };
function ProfileIdentity({ me, identity }) {
	const { displayName, setDisplayName, avatarUrl, hasAvatar, saving, avatarBusy } = identity;
	const fallbackName = me.name ?? me.email;
	const submit = (event) => {
		event.preventDefault();
		identity.save();
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "tds-card",
		style: { padding: "1.25rem" },
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "tds-row",
				style: {
					alignItems: "center",
					gap: "1rem"
				},
				children: [/* @__PURE__ */ jsx(Avatar, {
					name: me.label ?? fallbackName,
					src: hasAvatar ? avatarUrl : null,
					seed: me.userId,
					size: "lg",
					decorative: true
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-col gap-2",
					style: {
						flex: "1 1 16rem",
						minWidth: 0
					},
					children: [
						/* @__PURE__ */ jsx(FileDropZone, {
							label: avatarBusy ? "Wird hochgeladen …" : "Bild auswählen",
							hint: "oder hierher ziehen",
							activeLabel: "Loslassen zum Hochladen",
							accept: "image/png,image/jpeg,image/webp",
							disabled: avatarBusy,
							onFiles: ([file]) => void identity.upload(file),
							onReject: () => toast.warning("Bitte ein PNG-, JPEG- oder WebP-Bild wählen.")
						}),
						hasAvatar && /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn-ghost self-start",
							disabled: avatarBusy,
							onClick: () => void identity.removeAvatar(),
							children: "Entfernen"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs",
							style: hintStyle$2,
							children: [
								"PNG, JPEG oder WebP, maximal 2 MB. Das Bild wird vor dem Hochladen automatisch auf ",
								256,
								"×",
								256,
								" Pixel verkleinert."
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx("hr", {
				className: "tds-dropdown__sep",
				style: { margin: "1.25rem 0" }
			}),
			/* @__PURE__ */ jsxs("form", {
				className: "flex flex-col gap-4",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "flex flex-col gap-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium",
								children: "Anzeigename"
							}),
							/* @__PURE__ */ jsx("input", {
								className: "field-boxed",
								value: displayName,
								maxLength: 100,
								placeholder: fallbackName,
								onChange: (e) => setDisplayName(e.target.value)
							}),
							/* @__PURE__ */ jsxs("span", {
								className: "text-xs",
								style: hintStyle$2,
								children: [
									"So werden Sie in der Oberfläche angesprochen. Leer lassen, um „",
									fallbackName,
									"\" zu verwenden."
								]
							})
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "flex flex-col gap-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium",
								children: "Name"
							}),
							/* @__PURE__ */ jsx("input", {
								className: "field-boxed",
								value: me.name ?? "",
								readOnly: true,
								disabled: true
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs",
								style: hintStyle$2,
								children: "Der Name Ihres Kontos. Änderungen nimmt die Benutzerverwaltung vor."
							})
						]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "flex flex-col gap-1",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "text-sm font-medium",
								children: "E-Mail"
							}),
							/* @__PURE__ */ jsx("input", {
								className: "field-boxed",
								value: me.email,
								readOnly: true,
								disabled: true
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs",
								style: hintStyle$2,
								children: "Ihre Anmeldeadresse. Änderungen nimmt die Benutzerverwaltung vor."
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "tds-toolbar",
						children: /* @__PURE__ */ jsx("button", {
							type: "submit",
							className: "btn btn-primary",
							disabled: saving,
							children: saving ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : "Speichern"
						})
					})
				]
			})
		]
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/lib/preferences.ts
var PREFERENCES_URL = `${API_BASE}/me/preferences`;
var THEMES = [
	"light",
	"dark",
	"system"
];
var LOCALES = ["de", "en"];
/** Narrow an untrusted payload to the shape we understand. */
function parse(raw) {
	if (typeof raw !== "object" || raw === null) return {};
	const obj = raw;
	const out = {};
	if (typeof obj.theme === "string" && THEMES.includes(obj.theme)) out.theme = obj.theme;
	if (typeof obj.locale === "string" && LOCALES.includes(obj.locale)) out.locale = obj.locale;
	for (const key of ["notify_toast", "notify_email"]) {
		const value = obj[key];
		if (value === "0" || value === "1") out[key] = value;
	}
	return out;
}
/** Read the stored preferences. Resolves to `{}` on any failure — never throws. */
async function loadPreferences() {
	try {
		const res = await frontendFetch(PREFERENCES_URL);
		if (!res.ok) return {};
		return parse((await res.json()).preferences);
	} catch {
		return {};
	}
}
/**
* Persist a partial set of preferences.
*
* Returns the response so the caller can report the status — never `await` this
* and drop the result, which is the single most common defect across these
* repos: a 403 that closes the dialog and reloads the list while nothing
* changed. Resolves to `null` only when the request could not be made at all.
*/
async function savePreferences(values) {
	try {
		return await frontendFetch(PREFERENCES_URL, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ preferences: values })
		});
	} catch {
		return null;
	}
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/ProfilePreferences.tsx
/**
* Appearance and notifications: interface state, not identity, so it lives in
* tds-core-frontend-api (`/me/preferences`). Held by the screen like the
* identity state, so both tabs read the one copy.
*/
function usePreferenceSettings() {
	const [prefs, setPrefs] = useState({});
	const [theme, setTheme] = useState("system");
	const [unavailable, setUnavailable] = useState(false);
	useEffect(() => {
		setTheme(readThemePreference());
		loadPreferences().then((stored) => {
			setPrefs(stored);
			if (stored.theme) setTheme(stored.theme);
			setUnavailable(Object.keys(stored).length === 0);
		});
	}, []);
	function pickTheme(next) {
		setTheme(next);
		applyThemePreference(next);
	}
	async function persist(patch, action) {
		setPrefs((current) => ({
			...current,
			...patch
		}));
		const res = await savePreferences(patch);
		if (res?.ok) toast.success("Gespeichert.");
		else toast.danger(describeFailure(res, `${action} fehlgeschlagen`));
	}
	return {
		prefs,
		theme,
		unavailable,
		pickTheme,
		persist
	};
}
var THEME_OPTIONS = [
	{
		value: "light",
		label: "Hell",
		hint: "Immer die helle Oberfläche."
	},
	{
		value: "dark",
		label: "Dunkel",
		hint: "Immer die dunkle Oberfläche."
	},
	{
		value: "system",
		label: "Auto",
		hint: "Folgt der Einstellung Ihres Geräts."
	}
];
var hintStyle$1 = { color: "var(--color-muted)" };
function AppearancePanel({ settings }) {
	const { prefs, theme, unavailable, pickTheme, persist } = settings;
	return /* @__PURE__ */ jsxs("div", {
		className: "tds-card",
		style: { padding: "1.25rem" },
		children: [
			unavailable && /* @__PURE__ */ jsx("p", {
				className: "tds-alert",
				role: "status",
				children: "Einstellungen werden derzeit nur auf diesem Gerät gespeichert."
			}),
			/* @__PURE__ */ jsxs("fieldset", {
				className: "flex flex-col gap-2",
				style: { marginTop: "0.75rem" },
				children: [/* @__PURE__ */ jsx("legend", {
					className: "text-sm font-medium",
					children: "Erscheinungsbild"
				}), THEME_OPTIONS.map((option) => /* @__PURE__ */ jsxs("label", {
					className: "tds-list__row",
					style: { gap: "0.625rem" },
					children: [/* @__PURE__ */ jsx("input", {
						type: "radio",
						name: "theme",
						checked: theme === option.value,
						onChange: () => pickTheme(option.value)
					}), /* @__PURE__ */ jsxs("span", {
						className: "flex flex-col",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-sm",
							children: option.label
						}), /* @__PURE__ */ jsx("span", {
							className: "text-xs",
							style: hintStyle$1,
							children: option.hint
						})]
					})]
				}, option.value))]
			}),
			/* @__PURE__ */ jsx("hr", {
				className: "tds-dropdown__sep",
				style: { margin: "1.25rem 0" }
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex flex-col gap-1",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "text-sm font-medium",
						children: "Sprache"
					}),
					/* @__PURE__ */ jsxs("select", {
						className: "field-boxed",
						value: prefs.locale ?? "de",
						onChange: (e) => void persist({ locale: e.target.value }, "Sprache speichern"),
						children: [/* @__PURE__ */ jsx("option", {
							value: "de",
							children: "Deutsch"
						}), /* @__PURE__ */ jsx("option", {
							value: "en",
							children: "English"
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-xs",
						style: hintStyle$1,
						children: "Gilt für Hinweise und den Support-Chat. Die Menüs und Seiten der Verwaltung sind derzeit ausschließlich auf Deutsch."
					})
				]
			})
		]
	});
}
var NOTIFICATIONS = [{
	key: "notify_toast",
	label: "Hinweise in der Oberfläche",
	hint: "Kurze Einblendungen, wenn etwas Neues eintrifft."
}, {
	key: "notify_email",
	label: "E-Mail-Benachrichtigungen",
	hint: "Nachrichten zu Vorgängen, die Sie betreffen."
}];
function NotificationsPanel({ settings }) {
	const { prefs, persist } = settings;
	return /* @__PURE__ */ jsx("div", {
		className: "tds-card",
		style: { padding: "1.25rem" },
		children: /* @__PURE__ */ jsx("div", {
			className: "flex flex-col gap-3",
			children: NOTIFICATIONS.map(({ key, label, hint }) => /* @__PURE__ */ jsxs("label", {
				className: "tds-list__row",
				style: { gap: "0.625rem" },
				children: [/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					checked: (prefs[key] ?? "1") === "1",
					onChange: (e) => void persist({ [key]: e.target.checked ? "1" : "0" }, "Einstellung speichern")
				}), /* @__PURE__ */ jsxs("span", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-sm",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs",
						style: hintStyle$1,
						children: hint
					})]
				})]
			}, key))
		})
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/ProfileSecurity.tsx
var formatDate = (value) => formatDateTime(value, {
	style: "medium",
	fallback: value
});
var hintStyle = { color: "var(--color-muted)" };
/**
* Password and passkeys live on the central login site: the panel deliberately
* hosts no login UI, so those are links with a `?next=` back here rather than a
* second implementation of a security flow. Sessions are tds-auth-api's,
* listed here because this is where a user looks for them — and read again on
* every visit to the tab.
*/
function ProfileSecurity() {
	const [sessions, setSessions] = useState([]);
	const [error, setError] = useState("");
	const loadSessions = useCallback(async () => {
		const res = await frontendFetch(`${AUTH_API_URL}/me/sessions`).catch(() => null);
		if (!res?.ok) {
			setError(describeFailure(res, "Sitzungen konnten nicht geladen werden"));
			return;
		}
		const body = await res.json();
		setSessions(Array.isArray(body.sessions) ? body.sessions : []);
		setError("");
	}, []);
	useEffect(() => {
		loadSessions();
	}, [loadSessions]);
	async function revoke(session) {
		const res = await frontendFetch(`${AUTH_API_URL}/me/sessions/${encodeURIComponent(session.jti)}`, { method: "DELETE" }).catch(() => null);
		if (!res?.ok) {
			toast.danger(describeFailure(res, "Sitzung konnte nicht beendet werden"));
			return;
		}
		if (session.current) {
			location.replace(LOGIN_URL);
			return;
		}
		toast.success("Sitzung beendet.");
		loadSessions();
	}
	const next = encodeURIComponent(location.href);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "tds-card",
			style: { padding: "1.25rem" },
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-medium",
					children: "Anmeldung"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs",
					style: {
						...hintStyle,
						marginTop: "0.25rem"
					},
					children: "Passwort und Passkeys werden zentral bei der Anmeldung verwaltet."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "tds-toolbar",
					style: { marginTop: "0.75rem" },
					children: [/* @__PURE__ */ jsx("a", {
						className: "btn btn-ghost",
						href: `${LOGIN_URL}/passwort?next=${next}`,
						children: "Passwort ändern"
					}), /* @__PURE__ */ jsx("a", {
						className: "btn btn-ghost",
						href: `${LOGIN_URL}/passkeys?next=${next}`,
						children: "Passkeys verwalten"
					})]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "tds-card",
			style: { padding: "1.25rem" },
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "text-sm font-medium",
					children: "Aktive Sitzungen"
				}),
				error && /* @__PURE__ */ jsx(FormAlert, { message: error }),
				!error && sessions.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "tds-empty",
					children: "Keine weiteren Sitzungen."
				}),
				sessions.length > 0 && /* @__PURE__ */ jsx("ul", {
					className: "tds-list",
					style: { marginTop: "0.5rem" },
					children: sessions.map((session) => /* @__PURE__ */ jsxs("li", {
						className: "tds-list__row",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ jsxs("span", {
								className: "text-sm",
								children: [
									"Angemeldet seit ",
									formatDate(session.createdAt),
									session.current && /* @__PURE__ */ jsx("span", {
										className: "chip chip--info",
										style: { marginLeft: "0.5rem" },
										children: "Dieses Gerät"
									})
								]
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xs",
								style: hintStyle,
								children: ["Gültig bis ", formatDate(session.expiresAt)]
							})]
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: () => void revoke(session),
							children: session.current ? "Abmelden" : "Beenden"
						})]
					}, session.jti))
				})
			]
		})]
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/ProfileSettings.tsx
var TABS = [
	["profil", "Profil"],
	["darstellung", "Darstellung"],
	["benachrichtigungen", "Benachrichtigungen"],
	["sicherheit", "Sicherheit"]
];
function ProfileSettings() {
	const [tab, setTab] = useState("profil");
	const [me, setMe] = useState(null);
	const [loading, setLoading] = useState(true);
	const identity = useProfileIdentity();
	const preferences = usePreferenceSettings();
	useEffect(() => {
		fetchMe().then((principal) => {
			if (principal) {
				setMe(principal);
				identity.adopt(principal);
			}
			setLoading(false);
		});
	}, []);
	if (loading) return /* @__PURE__ */ jsx("div", {
		className: "tds-card",
		style: { padding: "1.5rem" },
		children: /* @__PURE__ */ jsx(Spinner, {
			size: "lg",
			tone: "primary"
		})
	});
	if (!me) return /* @__PURE__ */ jsx(Alert, { children: "Ihr Profil konnte nicht geladen werden." });
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ jsx(Tabs, {
			label: "Bereiche",
			idPrefix: "profil",
			tabs: TABS,
			value: tab,
			onChange: setTab,
			decorate: (_id, active) => active ? /* @__PURE__ */ jsx(TabIndicator, { group: "profil" }) : null
		}), /* @__PURE__ */ jsx(TabPanel, {
			idPrefix: "profil",
			id: tab,
			active: true,
			children: /* @__PURE__ */ jsxs(Presence, {
				view: tab,
				children: [
					tab === "profil" && /* @__PURE__ */ jsx(ProfileIdentity, {
						me,
						identity
					}),
					tab === "darstellung" && /* @__PURE__ */ jsx(AppearancePanel, { settings: preferences }),
					tab === "benachrichtigungen" && /* @__PURE__ */ jsx(NotificationsPanel, { settings: preferences }),
					tab === "sicherheit" && /* @__PURE__ */ jsx(ProfileSecurity, {})
				]
			})
		})]
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/profil.astro
var profil_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Profil,
	file: () => $$file,
	url: () => $$url
});
var $$Profil = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Profileinstellungen" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="tds-page"><div class="tds-page__head"><div><p class="tds-page__eyebrow">Mein Konto</p><h1 class="tds-page__title">Profileinstellungen</h1><p class="tds-page__lede">Ihr Profil, die Darstellung der Oberfläche und die Sicherheit Ihres Kontos.</p></div></div>${renderComponent($$result, "ProfileSettings", ProfileSettings, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/components/ProfileSettings.tsx",
		"client:component-export": "default"
	})}</section>` })}`;
}, "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/profil.astro", void 0);
var $$file = "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/profil.astro";
var $$url = "/profil";
// \0virtual:astro:page:node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/profil@_@astro
var page = () => profil_exports;
export { page };
