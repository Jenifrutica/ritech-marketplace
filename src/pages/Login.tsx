import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/icon";
import { roleIcon, rolePath } from "@/components/layout/roleNav";
import { imageById, imageSrc } from "@/data/imageCredits";
import { demoUserByRole } from "@/data/seed";
import { ROLES } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";
import { useStore } from "@/store/DemoStore";

/** Ingreso simulado: se elige un rol, sin contraseña. */
export function Login() {
  const { t } = useI18n();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const bg = imageById.galeras;

  return (
    <section className="rt-photo min-h-[calc(100dvh-62px)]" aria-labelledby="login-title">
      <img src={imageSrc("galeras")} alt="" />
      <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6 md:py-20">
        <div className="max-w-[640px] text-[color:#FBF6EC]">
          <h1 id="login-title" className="rt-display text-[clamp(30px,5vw,48px)] font-medium leading-[1.05]">
            {t("login.title")}
          </h1>
          <p className="mt-3 text-[length:var(--fs-lead)] text-[color:#EFE4D3]">{t("login.lead")}</p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => {
            const user = state.users.find((u) => u.id === demoUserByRole[role]);
            const label = t(`role.${role}` as MessageKey);
            return (
              <li key={role}>
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "setRole", role });
                    navigate(rolePath(role));
                  }}
                  className="rt-focus group grid h-full w-full content-start gap-3 rounded-[var(--r-card)] bg-[var(--v-paper)] p-5 text-left text-[color:var(--v-text)] [box-shadow:inset_0_0_0_1px_var(--v-border)] hover:[box-shadow:inset_0_0_0_2px_var(--v-ink)]"
                >
                  <span className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-full bg-[var(--v-pink-soft)] text-[color:var(--rt-cherry)]">
                      <Icon name={roleIcon[role]} />
                    </span>
                    <Icon name="arrow-right" size="sm" className="text-[color:var(--v-text-3)] group-hover:translate-x-0.5" />
                  </span>
                  <span className="rt-display text-[length:var(--fs-title)] font-semibold">
                    <span className="sr-only">{t("login.enterAs", { role: "" })}</span>
                    {label}
                  </span>
                  <span className="text-[length:var(--fs-control)] leading-snug text-[color:var(--v-text-2)]">
                    {t(`role.${role}.desc` as MessageKey)}
                  </span>
                  {user && (
                    <span className="border-t border-[var(--v-border)] pt-3 text-[length:var(--fs-meta)] text-[color:var(--v-text-3)]">
                      {t("login.demoUser", { name: user.name, org: user.organization })}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="rt-credit mt-8 text-[color:#EFE4D3]">{t("common.photoCredit", { author: bg.author, license: bg.license })}</p>
      </div>
    </section>
  );
}
