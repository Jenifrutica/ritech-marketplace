import * as React from "react";
import { Alert, AlertBody, AlertIcon, type AlertProps } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";

const defaultIcon: Record<string, string> = {
  info: "shield-check",
  ok: "circle-check",
  warn: "triangle-alert",
  danger: "triangle-alert",
  default: "bell",
};

/**
 * Aviso sobre el Alert de 000h con su estructura completa (ícono + cuerpo).
 * Por defecto es role="note": solo los errores se anuncian como alerta.
 */
export function Notice({
  icon,
  variant = "default",
  role = "note",
  children,
  ...props
}: AlertProps & { icon?: string }) {
  return (
    <Alert variant={variant} role={role} data-morph="none" {...props}>
      <AlertIcon>
        <Icon name={icon ?? defaultIcon[variant ?? "default"]} size="sm" />
      </AlertIcon>
      <AlertBody>{children}</AlertBody>
    </Alert>
  );
}

export type NoticeProps = React.ComponentProps<typeof Notice>;
