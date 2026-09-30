import * as React from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Brand, LangToggle, SkipLink } from "@/components/layout/Brand";
import { SiteFooter } from "@/components/layout/PublicLayout";
import { roleIcon, roleNav, rolePath } from "@/components/layout/roleNav";
import { useNotify } from "@/components/common/Notify";
import { ROLES, type Role } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useStore } from "@/store/DemoStore";
import { cn } from "@/lib/utils";

function RoleNavList({ role, onNavigate, inverted }: { role: Role; onNavigate?: () => void; inverted?: boolean }) {
  const { t } = useI18n();
  return (
    <ul className="grid gap-1">
      {roleNav[role].map((item) => (
        <li key={item.to}>
          <NavLink
            to={rolePath(role, item.to)}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "rt-focus flex min-h-11 items-center gap-3 rounded-[var(--r-card-sm)] px-3 py-2 font-medium no-underline",
                inverted
                  ? isActive
                    ? "bg-[var(--v-pink)] text-[color:var(--v-on-accent)]"
                    : "text-[color:var(--structure-text)] hover:bg-[var(--structure-quiet)]"
                  : isActive
                    ? "bg-[var(--v-ink)] text-[color:var(--v-on-ink)]"
                    : "text-[color:var(--v-text)] hover:bg-[var(--v-beige)]",
              )
            }
          >
            <Icon name={item.icon} size="sm" />
            {t(item.label)}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function RoleSwitcher({ role }: { role: Role }) {
  const { t } = useI18n();
  const { dispatch, me } = useStore();
  const navigate = useNavigate();
  const notify = useNotify();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-11 max-w-[220px] gap-2" aria-label={`${t("common.switchRole")}. ${t("common.currentRole", { role: t(`role.${role}` as MessageKey) })}`}>
          <Icon name={roleIcon[role]} size="sm" />
          <span className="hidden truncate sm:inline">{t(`role.${role}` as MessageKey)}</span>
          <Icon name="chevron-right" size="sm" className="rotate-90" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[260px]">
        {me && (
          <>
            <DropdownMenuLabel>
              <span className="block font-semibold">{me.name}</span>
              <span className="block text-[length:var(--fs-meta)] font-normal text-[color:var(--v-text-2)]">{me.organization}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel className="text-[length:var(--fs-meta)] text-[color:var(--v-text-2)]">{t("common.switchRole")}</DropdownMenuLabel>
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            disabled={r === role}
            onSelect={() => {
              dispatch({ type: "setRole", role: r });
              navigate(rolePath(r));
            }}
          >
            <Icon name={roleIcon[r]} size="sm" />
            {t(`role.${r}` as MessageKey)}
            {r === role && <Icon name="check" size="sm" className="ms-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            dispatch({ type: "reset" });
            notify(t("common.resetDone"));
          }}
        >
          <Icon name="history" size="sm" />
          {t("common.reset")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            dispatch({ type: "setRole", role: null });
            navigate("/");
          }}
        >
          <Icon name="log-out" size="sm" />
          {t("common.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ role }: { role: Role }) {
  const { t } = useI18n();
  const { state, dispatch, me } = useStore();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const mainRef = React.useRef<HTMLElement>(null);

  // Un enlace directo a /rol/... entra con ese rol.
  React.useEffect(() => {
    if (state.role !== role) dispatch({ type: "setRole", role });
  }, [role, state.role, dispatch]);

  // Al navegar, se lleva el foco al contenido para lectores de pantalla y teclado.
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (!ROLES.includes(role)) return <Navigate to="/ingresar" replace />;
  const roleLabel = t(`role.${role}` as MessageKey);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--v-canvas)]">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-[var(--v-border)] bg-[var(--v-canvas)]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-2 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="min-h-11 min-w-11 px-0 lg:hidden" aria-label={t("common.openMenu")}>
                <Icon name="menu" />
              </Button>
            </SheetTrigger>
            <SheetContent side="start" showCloseButton>
              <SheetHeader>
                <SheetTitle>{roleLabel}</SheetTitle>
                <SheetDescription>{me ? t("common.signedInAs", { name: me.name }) : ""}</SheetDescription>
              </SheetHeader>
              <nav aria-label={t("nav.label", { role: roleLabel })}>
                <RoleNavList role={role} onNavigate={() => setMenuOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <Brand to={rolePath(role)} compact />
          <Badge variant="dashed" size="sm" className="ms-2 hidden md:inline-flex">
            {t("app.demoBadge")}
          </Badge>
          <div className="ms-auto flex items-center gap-2">
            <LangToggle />
            <RoleSwitcher role={role} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-8 px-4 sm:px-6">
        <aside className="sticky top-[62px] hidden h-[calc(100dvh-62px)] w-[248px] shrink-0 overflow-y-auto py-6 lg:block">
          <div className="flex h-full flex-col gap-6 rounded-[var(--r-panel)] bg-[var(--v-structure)] p-4">
            <div className="flex items-center gap-3 px-1">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--structure-quiet)] text-[color:var(--on-structure)]">
                <Icon name={roleIcon[role]} size="sm" />
              </span>
              <div className="min-w-0">
                <div className="truncate font-semibold text-[color:var(--on-structure)]">{me?.name}</div>
                <div className="truncate text-[length:var(--fs-meta)] text-[color:var(--sidebar-muted)]">{roleLabel}</div>
              </div>
            </div>
            <nav aria-label={t("nav.label", { role: roleLabel })}>
              <RoleNavList role={role} inverted />
            </nav>
            <p className="mt-auto px-1 text-[length:var(--fs-meta)] leading-snug text-[color:var(--sidebar-muted)]">{me?.organization}</p>
          </div>
        </aside>
        <main id="contenido" ref={mainRef} tabIndex={-1} className="min-w-0 flex-1 py-8 outline-none">
          {/* Hasta sincronizar el rol, no se renderiza la vista (evita estado inicial de otro rol). */}
          {state.role === role && <Outlet />}
        </main>
      </div>
      <SiteFooter wide />
    </div>
  );
}

export function BackLink({ to, label }: { to: string; label?: string }) {
  const { t } = useI18n();
  return (
    <Link to={to} className="rt-link rt-focus mb-4 inline-flex min-h-11 items-center gap-1.5 font-medium">
      <Icon name="chevron-right" size="sm" className="rotate-180" />
      {label ?? t("common.back")}
    </Link>
  );
}
