import type { Role } from "@/domain/types";
import type { MessageKey } from "@/i18n/es";

export type NavItem = { to: string; label: MessageKey; icon: string; end?: boolean };

export const roleIcon: Record<Role, string> = {
  buyer: "globe",
  seller: "store",
  owner: "sprout",
  carrier: "truck",
  admin: "shield",
  tech: "server",
};

export const roleNav: Record<Role, NavItem[]> = {
  buyer: [
    { to: "", label: "nav.overview", icon: "house", end: true },
    { to: "catalog", label: "nav.catalog", icon: "search" },
    { to: "negotiations", label: "nav.negotiations", icon: "message-circle" },
    { to: "purchases", label: "nav.purchases", icon: "package" },
  ],
  seller: [
    { to: "", label: "nav.overview", icon: "house", end: true },
    { to: "publish", label: "nav.publish", icon: "plus" },
    { to: "lots", label: "nav.myLots", icon: "store" },
    { to: "negotiations", label: "nav.negotiations", icon: "message-circle" },
    { to: "sales", label: "nav.sales", icon: "banknote" },
  ],
  owner: [
    { to: "", label: "nav.overview", icon: "house", end: true },
    { to: "farms", label: "nav.farms", icon: "trees", end: true },
    { to: "farms/new", label: "nav.registerFarm", icon: "map-pin" },
    { to: "certificates", label: "nav.certificates", icon: "file-check" },
    { to: "samples", label: "nav.samples", icon: "flask-conical" },
  ],
  carrier: [{ to: "", label: "nav.orders", icon: "truck", end: true }],
  admin: [
    { to: "", label: "nav.overview", icon: "house", end: true },
    { to: "users", label: "nav.users", icon: "users" },
    { to: "certificates", label: "nav.certificates", icon: "file-check" },
    { to: "disputes", label: "nav.disputes", icon: "gavel" },
    { to: "commissions", label: "nav.commissions", icon: "hand-coins" },
  ],
  tech: [
    { to: "", label: "nav.backups", icon: "database", end: true },
    { to: "audit", label: "nav.audit", icon: "activity" },
  ],
};

export const rolePath = (role: Role, to = "") => (to ? `/${role}/${to}` : `/${role}`);
