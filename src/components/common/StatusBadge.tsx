import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Certificate, Escrow, EudrStatus, Lot, Negotiation, TxStage, User } from "@/domain/types";
import { useI18n } from "@/i18n/I18nProvider";
import type { MessageKey } from "@/i18n/es";

type Tone = "olive" | "yellow" | "danger" | "blue" | "default" | "pink-soft";

/** El estado siempre lleva texto e ícono, nunca solo color. */
function StatusPill({ tone, icon, label }: { tone: Tone; icon: string; label: string }) {
  return (
    <Badge variant={tone} className="gap-1.5 whitespace-nowrap">
      <Icon name={icon} size="sm" aria-hidden="true" />
      {label}
    </Badge>
  );
}

const stageTone: Record<TxStage, [Tone, string]> = {
  agreed: ["blue", "lock"],
  sample: ["blue", "package"],
  prepared: ["yellow", "package"],
  shipped: ["yellow", "truck"],
  in_transit: ["yellow", "ship"],
  delivered: ["pink-soft", "clipboard-check"],
  accepted: ["olive", "circle-check"],
  disputed: ["danger", "triangle-alert"],
  resolved: ["default", "gavel"],
};

export function StageBadge({ stage }: { stage: TxStage }) {
  const { t } = useI18n();
  const [tone, icon] = stageTone[stage];
  return <StatusPill tone={tone} icon={icon} label={t(`stage.${stage}` as MessageKey)} />;
}

export function EscrowBadge({ escrow }: { escrow: Escrow }) {
  const { t } = useI18n();
  const map: Record<Escrow, [Tone, string]> = {
    held: ["yellow", "lock-keyhole"],
    released: ["olive", "banknote"],
    refunded: ["blue", "wallet"],
  };
  const [tone, icon] = map[escrow];
  return <StatusPill tone={tone} icon={icon} label={t(`escrow.${escrow}` as MessageKey)} />;
}

export function EudrBadge({ status }: { status: EudrStatus }) {
  const { t } = useI18n();
  const map: Record<EudrStatus, [Tone, string]> = {
    enabled: ["olive", "shield-check"],
    pending: ["yellow", "history"],
    blocked: ["danger", "ban"],
  };
  const [tone, icon] = map[status];
  return <StatusPill tone={tone} icon={icon} label={t(`eudr.${status}` as MessageKey)} />;
}

export function CertStatusBadge({ status }: { status: Certificate["status"] }) {
  const { t } = useI18n();
  const map: Record<Certificate["status"], [Tone, string]> = {
    pending: ["yellow", "history"],
    validated: ["olive", "file-check"],
    rejected: ["danger", "x"],
  };
  const [tone, icon] = map[status];
  return <StatusPill tone={tone} icon={icon} label={t(`certStatus.${status}` as MessageKey)} />;
}

export function UserStatusBadge({ status }: { status: User["status"] }) {
  const { t } = useI18n();
  return status === "active" ? (
    <StatusPill tone="olive" icon="circle-check" label={t("userStatus.active")} />
  ) : (
    <StatusPill tone="danger" icon="ban" label={t("userStatus.blocked")} />
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  const { t } = useI18n();
  return verified ? (
    <StatusPill tone="blue" icon="shield-check" label={t("user.verified")} />
  ) : (
    <StatusPill tone="default" icon="history" label={t("user.unverified")} />
  );
}

export function LotStatusBadge({ status }: { status: Lot["status"] }) {
  const { t } = useI18n();
  const map: Record<Lot["status"], [Tone, string]> = {
    published: ["olive", "store"],
    negotiating: ["yellow", "message-circle"],
    sold: ["default", "lock"],
  };
  const [tone, icon] = map[status];
  return <StatusPill tone={tone} icon={icon} label={t(`lotStatus.${status}` as MessageKey)} />;
}

export function NegotiationBadge({ status }: { status: Negotiation["status"] }) {
  const { t } = useI18n();
  const map: Record<Negotiation["status"], [Tone, string]> = {
    open: ["yellow", "message-circle"],
    agreed: ["olive", "lock"],
    closed: ["default", "x"],
  };
  const [tone, icon] = map[status];
  return <StatusPill tone={tone} icon={icon} label={t(`negotiation.${status}` as MessageKey)} />;
}

export function PriceModeBadge({ mode }: { mode: Lot["priceMode"] }) {
  const { t } = useI18n();
  return mode === "fixed" ? (
    <StatusPill tone="default" icon="banknote" label={t("priceMode.fixed")} />
  ) : (
    <StatusPill tone="pink-soft" icon="hand-coins" label={t("priceMode.negotiable")} />
  );
}

export function ExampleBadge() {
  const { t } = useI18n();
  return (
    <Badge variant="dashed" size="sm" className="whitespace-nowrap">
      {t("common.example")}
    </Badge>
  );
}
