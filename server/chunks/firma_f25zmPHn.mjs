import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_CtyRAPF4.mjs";
import "./compiler_D-pGYtJh.mjs";
import { B as toast, C as Spinner, J as createComponent, d as fetchMe, m as membershipIds, s as getActiveCompany, t as $$Layout, v as ConfirmDialog, y as FormAlert } from "./Layout_B6-NSy9D.mjs";
import { r as Collapse } from "./chunk-VY4YAQC3_1HHwjtlN.mjs";
import { a as describeFailure, d as removeCompanyUser, h as fetchCompanies, n as createCompanyUser, p as updateCompanyUser, s as fetchCompanyUsers, t as PermissionMatrix } from "./PermissionMatrix_F7x7Vp-K.mjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
// node_modules/@tracht-digital-labs/tds-core-frontend/src/lib/companyUsers.ts
var emptyDraft = () => ({
	email: "",
	name: "",
	permissions: [],
	permissionDenies: [],
	groupIds: [],
	isCompanyAdmin: false,
	status: "active"
});
var draftOf = (member) => ({
	email: member.email,
	name: member.name ?? "",
	permissions: [...member.permissions],
	permissionDenies: [...member.permissionDenies ?? []],
	groupIds: [...member.groupIds],
	isCompanyAdmin: member.isCompanyAdmin,
	status: member.status
});
/** The create/update body: trimmed, and a blank name sent as null. */
var bodyOf = (draft) => ({
	email: draft.email.trim(),
	name: draft.name.trim() || null,
	permissions: draft.permissions,
	permissionDenies: draft.permissionDenies,
	groupIds: draft.groupIds,
	isCompanyAdmin: draft.isCompanyAdmin,
	status: draft.status
});
/**
* The rights this admin may hand out. `null` from the server means "no
* ceiling"; then everything the assignable groups mention is offered, since
* there is no catalog call on this surface.
*/
function grantableRights(payload) {
	if (payload?.allowedPermissions) return payload.allowedPermissions;
	const fromGroups = /* @__PURE__ */ new Set();
	for (const group of payload?.groups ?? []) for (const key of group.permissions) fromGroups.add(key);
	return [...fromGroups].sort();
}
/** No seat left. An unlimited company (`remaining: null`) is never full. */
var seatsFull = (payload) => payload?.seats.remaining != null && payload.seats.remaining <= 0;
/**
* The company to open: the stored panel-wide pick when it is one of `ids`,
* else the first. Deliberately NOT `resolveActiveCompany`, which clears a
* stored pick that is not in the list: `ids` here can be a SUBSET of the
* memberships, and someone who is a plain member of A and an admin of B would
* lose their selection just by opening this page.
*/
var pickCompany = (stored, ids) => stored !== null && ids.includes(stored) ? stored : ids[0] ?? null;
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/CompanyMemberForm.tsx
var hint = { color: "var(--color-muted)" };
/** Create or edit one member of the company. */
function CompanyMemberForm({ draft, onDraft, isNew, groups, grantable, ceiling, saving, onSubmit, onCancel }) {
	const toggleGroup = (id, on) => onDraft({
		...draft,
		groupIds: on ? [...draft.groupIds, id] : draft.groupIds.filter((g) => g !== id)
	});
	return /* @__PURE__ */ jsxs("form", {
		className: "tds-card flex flex-col gap-4",
		style: { padding: "1.25rem" },
		onSubmit,
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-sm font-medium",
				children: isNew ? "Neuer Benutzer" : "Benutzer bearbeiten"
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
						type: "email",
						required: true,
						value: draft.email,
						onChange: (e) => onDraft({
							...draft,
							email: e.target.value
						})
					}),
					isNew && /* @__PURE__ */ jsx("span", {
						className: "text-xs",
						style: hint,
						children: "Existiert bereits ein Konto mit dieser Adresse, wird es Ihrer Firma hinzugefügt; eine Person braucht keine zweite Anmeldung."
					})
				]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm font-medium",
					children: "Name"
				}), /* @__PURE__ */ jsx("input", {
					className: "field-boxed",
					value: draft.name,
					onChange: (e) => onDraft({
						...draft,
						name: e.target.value
					})
				})]
			}),
			groups.length > 0 && /* @__PURE__ */ jsxs("fieldset", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ jsx("legend", {
						className: "text-sm font-medium",
						children: "Gruppen"
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-xs",
						style: hint,
						children: "Rechte aus einer Gruppe gelten zusätzlich zu den einzeln vergebenen."
					}),
					groups.map((group) => /* @__PURE__ */ jsxs("label", {
						className: "tds-list__row",
						style: { gap: "0.625rem" },
						children: [/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: draft.groupIds.includes(group.id),
							onChange: (e) => toggleGroup(group.id, e.target.checked)
						}), /* @__PURE__ */ jsxs("span", {
							className: "flex flex-col",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-sm",
								children: group.name
							}), group.description && /* @__PURE__ */ jsx("span", {
								className: "text-xs",
								style: hint,
								children: group.description
							})]
						})]
					}, group.id))
				]
			}),
			/* @__PURE__ */ jsxs("fieldset", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ jsx("legend", {
					className: "text-sm font-medium",
					children: "Rechte"
				}), /* @__PURE__ */ jsx(PermissionMatrix, {
					catalog: grantable.map((id) => ({
						id,
						label: id
					})),
					assignedGroups: groups.filter((g) => draft.groupIds.includes(g.id)),
					value: draft.permissions,
					denies: draft.permissionDenies,
					ceiling,
					onChange: (next) => onDraft({
						...draft,
						permissions: next.permissions,
						permissionDenies: next.denies
					})
				})]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "tds-list__row",
				style: { gap: "0.625rem" },
				children: [/* @__PURE__ */ jsx("input", {
					type: "checkbox",
					checked: draft.isCompanyAdmin,
					onChange: (e) => onDraft({
						...draft,
						isCompanyAdmin: e.target.checked
					})
				}), /* @__PURE__ */ jsxs("span", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-sm",
						children: "Firmenadmin"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs",
						style: hint,
						children: "Darf die Benutzer dieser Firma verwalten, also auch diese Seite hier."
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex flex-col gap-1",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm font-medium",
					children: "Status"
				}), /* @__PURE__ */ jsxs("select", {
					className: "field-boxed",
					value: draft.status,
					onChange: (e) => onDraft({
						...draft,
						status: e.target.value
					}),
					children: [/* @__PURE__ */ jsx("option", {
						value: "active",
						children: "Aktiv"
					}), /* @__PURE__ */ jsx("option", {
						value: "disabled",
						children: "Deaktiviert"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "tds-toolbar",
				children: [/* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "btn btn-primary",
					disabled: saving,
					children: saving ? /* @__PURE__ */ jsx(Spinner, { size: "sm" }) : "Speichern"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "btn btn-ghost",
					disabled: saving,
					onClick: onCancel,
					children: "Abbrechen"
				})]
			})
		]
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/CompanyMembersTable.tsx
/** The company's members with their groups, status and actions. */
function CompanyMembersTable({ users, groups, onEdit, onRemove }) {
	const groupName = useMemo(() => new Map(groups.map((g) => [g.id, g.name])), [groups]);
	return /* @__PURE__ */ jsxs("div", {
		className: "tds-card",
		style: { padding: "1.25rem" },
		children: [/* @__PURE__ */ jsxs("table", {
			className: "tds-table",
			children: [
				/* @__PURE__ */ jsx("caption", {
					className: "sr-only",
					children: "Benutzer dieser Firma"
				}),
				/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsx("th", { children: "Benutzer" }),
					/* @__PURE__ */ jsx("th", { children: "Gruppen" }),
					/* @__PURE__ */ jsx("th", { children: "Status" }),
					/* @__PURE__ */ jsx("th", { children: "Aktionen" })
				] }) }),
				/* @__PURE__ */ jsx("tbody", { children: users.map((member) => /* @__PURE__ */ jsxs("tr", { children: [
					/* @__PURE__ */ jsxs("td", { children: [/* @__PURE__ */ jsx("span", {
						className: "block text-sm",
						children: member.label
					}), /* @__PURE__ */ jsx("span", {
						className: "block text-xs",
						style: { color: "var(--color-muted)" },
						children: member.email
					})] }),
					/* @__PURE__ */ jsxs("td", { children: [
						member.isCompanyAdmin && /* @__PURE__ */ jsx("span", {
							className: "chip chip--info",
							children: "Firmenadmin"
						}),
						" ",
						member.groupIds.map((id) => groupName.get(id)).filter(Boolean).join(", ")
					] }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", {
						className: `status-pill ${member.status === "active" ? "" : "opacity-70"}`,
						children: member.status === "active" ? "Aktiv" : "Deaktiviert"
					}) }),
					/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", {
						className: "tds-row",
						style: { gap: "0.375rem" },
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: () => onEdit(member),
							children: "Bearbeiten"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							className: "btn btn-ghost",
							onClick: () => onRemove(member),
							children: "Entfernen"
						})]
					}) })
				] }, member.id)) })
			]
		}), users.length === 0 && /* @__PURE__ */ jsx("p", {
			className: "tds-empty",
			children: "Noch keine weiteren Benutzer in dieser Firma."
		})]
	});
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/components/CompanyUsersAdmin.tsx
/**
* A company admin managing their OWN company's users.
*
* ### Why this lives in the host and not in the Firmen extension
*
* `tds-customer-frontend` composes only support-tickets, billing, messages,
* projects and documents — the Firmen extension is admin-product only. A
* company admin signs in to the PORTAL, so the screen has to come from the
* shell, which both products build.
*
* ### What the server decides, and what this screen only renders
*
* The seat cap, the permission ceiling and the assignable groups all arrive in
* the list payload. This screen never computes them: it shows what the backend
* says is allowed and lets the backend refuse anything else. Filtering the
* checkboxes here is a courtesy — `CompanyUserGuard` is the boundary, and it
* names its refusals (`seat_limit`, `permission_not_allowed`, …) so a rejection
* says which right was the problem instead of "Forbidden".
*/
function CompanyUsersAdmin() {
	const { me, companyId, directory, payload, error, loading, select, reload } = useCompanyUsers();
	const [notice, setNotice] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [draft, setDraft] = useState(emptyDraft());
	const [saving, setSaving] = useState(false);
	const [pendingRemove, setPendingRemove] = useState(null);
	function startEditing(id, next) {
		setDraft(next);
		setEditingId(id);
		setNotice("");
	}
	async function save(event) {
		event.preventDefault();
		if (companyId === null || editingId === null) return;
		setSaving(true);
		try {
			const { res, data } = editingId === "new" ? await createCompanyUser(companyId, bodyOf(draft)) : await updateCompanyUser(companyId, editingId, bodyOf(draft));
			if (!data) {
				toast.danger(await describeFailure(res, "Speichern fehlgeschlagen"));
				return;
			}
			const temporary = "temporaryPassword" in data ? data.temporaryPassword : null;
			if (temporary) setNotice(`Benutzer angelegt. Temporäres Passwort: ${temporary}`);
			else toast.success(editingId === "new" ? "Benutzer angelegt." : "Benutzer gespeichert.");
			setEditingId(null);
			await reload();
		} finally {
			setSaving(false);
		}
	}
	async function remove(member) {
		if (companyId === null) return;
		const { res, data } = await removeCompanyUser(companyId, member.id);
		setPendingRemove(null);
		if (!data) {
			toast.danger(await describeFailure(res, "Entfernen fehlgeschlagen"));
			return;
		}
		toast.success("Benutzer aus der Firma entfernt.");
		await reload();
	}
	if (loading) return /* @__PURE__ */ jsx("div", {
		className: "tds-card",
		style: { padding: "1.5rem" },
		children: /* @__PURE__ */ jsx(Spinner, {
			size: "lg",
			tone: "primary"
		})
	});
	if (companyId === null) return /* @__PURE__ */ jsx("p", {
		className: "tds-alert",
		role: "status",
		children: me?.isAdmin ? "Es sind keine Firmen angelegt." : "Sie verwalten derzeit keine Firma. Ein Administrator kann Ihnen diese Rolle geben."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-4",
		children: [
			error && /* @__PURE__ */ jsx(FormAlert, { message: error }),
			directory.length > 0 && /* @__PURE__ */ jsxs("label", {
				className: "block",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm",
					children: "Firma"
				}), /* @__PURE__ */ jsx("select", {
					className: "field-boxed",
					value: companyId,
					onChange: (e) => {
						setEditingId(null);
						select(Number(e.target.value));
					},
					children: directory.map((company) => /* @__PURE__ */ jsx("option", {
						value: company.id,
						children: company.name
					}, company.id))
				})]
			}),
			notice && /* @__PURE__ */ jsx("p", {
				className: "tds-alert tds-alert--success",
				role: "status",
				children: notice
			}),
			payload && /* @__PURE__ */ jsx(SeatSummary, {
				payload,
				canAdd: !seatsFull(payload) && editingId === null,
				onAdd: () => startEditing("new", emptyDraft())
			}),
			/* @__PURE__ */ jsx(Collapse, {
				open: editingId !== null,
				children: editingId !== null && /* @__PURE__ */ jsx(CompanyMemberForm, {
					draft,
					onDraft: setDraft,
					isNew: editingId === "new",
					groups: payload?.groups ?? [],
					grantable: grantableRights(payload),
					ceiling: payload?.allowedPermissions ?? null,
					saving,
					onSubmit: save,
					onCancel: () => setEditingId(null)
				})
			}),
			/* @__PURE__ */ jsx(CompanyMembersTable, {
				users: payload?.users ?? [],
				groups: payload?.groups ?? [],
				onEdit: (member) => startEditing(member.id, draftOf(member)),
				onRemove: setPendingRemove
			}),
			/* @__PURE__ */ jsx(ConfirmDialog, {
				open: pendingRemove !== null,
				title: `„${pendingRemove?.label ?? ""}“ entfernen?`,
				message: "Das Konto bleibt bestehen und verliert nur den Zugang zu dieser Firma. Wenn die Person noch zu anderen Firmen gehört, bleibt der Zugang dorthin unberührt.",
				confirmLabel: "Entfernen",
				onCancel: () => setPendingRemove(null),
				onConfirm: () => pendingRemove && void remove(pendingRemove)
			})
		]
	});
}
/** Seats in use against the cap, and the add button. */
function SeatSummary({ payload, canAdd, onAdd }) {
	const { used, max } = payload.seats;
	return /* @__PURE__ */ jsxs("div", {
		className: "tds-card",
		style: { padding: "1rem" },
		children: [/* @__PURE__ */ jsxs("div", {
			className: "tds-row",
			style: {
				justifyContent: "space-between",
				gap: "1rem"
			},
			children: [/* @__PURE__ */ jsxs("span", {
				className: "text-sm",
				children: [
					/* @__PURE__ */ jsx("strong", { children: used }),
					max !== null ? ` von ${max}` : "",
					" Benutzerplätzen belegt",
					max === null && " (unbegrenzt)"
				]
			}), /* @__PURE__ */ jsx("button", {
				type: "button",
				className: "btn btn-primary",
				disabled: !canAdd,
				onClick: onAdd,
				children: "Benutzer hinzufügen"
			})]
		}), seatsFull(payload) && /* @__PURE__ */ jsx("p", {
			className: "text-xs",
			style: {
				color: "var(--color-muted)",
				marginTop: "0.5rem"
			},
			children: "Alle Plätze sind belegt. Entfernen Sie einen Benutzer oder fragen Sie nach mehr Plätzen."
		})]
	});
}
/**
* Who is asking, which companies they may manage here, and the open
* company's users.
*
* A platform admin administers every company — CompanyAdminMiddleware lets
* them through this surface regardless of memberships (they have none) and
* regardless of whether the company's delegation is switched on, because that
* grant limits what a COMPANY may do on its own. So they get the directory and
* a picker. Everyone else gets only the companies they ADMINISTER: a plain
* membership would render a screen where every write 403s.
*/
function useCompanyUsers() {
	const [me, setMe] = useState(null);
	const [companyId, setCompanyId] = useState(null);
	/** Non-empty only for a platform admin: every company, for the picker. */
	const [directory, setDirectory] = useState([]);
	const [payload, setPayload] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const load = useCallback(async (id) => {
		const { res, data } = await fetchCompanyUsers(id);
		if (!data) {
			setError(await describeFailure(res, "Benutzer konnten nicht geladen werden"));
			setPayload(null);
			return;
		}
		setPayload(data);
		setError("");
	}, []);
	useEffect(() => {
		(async () => {
			const principal = await fetchMe();
			setMe(principal);
			let ids;
			if (principal?.isAdmin) {
				const { companies } = await fetchCompanies();
				setDirectory(companies);
				ids = companies.map((c) => c.id);
			} else ids = membershipIds(principal, (c) => c.isCompanyAdmin === true);
			const active = pickCompany(getActiveCompany(), ids);
			setCompanyId(active);
			if (active !== null) await load(active);
			setLoading(false);
		})();
	}, [load]);
	return {
		me,
		companyId,
		directory,
		payload,
		error,
		loading,
		select: useCallback((id) => {
			setCompanyId(id);
			return load(id);
		}, [load]),
		reload: useCallback(async () => {
			if (companyId !== null) await load(companyId);
		}, [companyId, load])
	};
}
// node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/firma.astro
var firma_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Firma,
	file: () => $$file,
	url: () => $$url
});
var $$Firma = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Meine Firma" }, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section class="tds-page"><div class="tds-page__head"><div><p class="tds-page__eyebrow">Firma</p><h1 class="tds-page__title">Benutzer meiner Firma</h1><p class="tds-page__lede">Legen Sie Benutzer Ihrer Firma an, weisen Sie ihnen Gruppen und Rechte zu und bestimmen Sie, wer die Firma mitverwalten darf.</p></div></div>${renderComponent($$result, "CompanyUsersAdmin", CompanyUsersAdmin, {
		"client:load": true,
		"client:component-hydration": "load",
		"client:component-path": "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/components/CompanyUsersAdmin.tsx",
		"client:component-export": "default"
	})}</section>` })}`;
}, "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/firma.astro", void 0);
var $$file = "/home/runner/work/tds-customer-frontend/tds-customer-frontend/node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/firma.astro";
var $$url = "/firma";
// \0virtual:astro:page:node_modules/@tracht-digital-labs/tds-core-frontend/src/pages/firma@_@astro
var page = () => firma_exports;
export { page };
