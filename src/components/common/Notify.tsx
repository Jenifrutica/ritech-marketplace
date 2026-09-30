import * as React from "react";
import { Toast, ToastClose, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/i18n/I18nProvider";

type Note = { id: number; text: string; tone: "default" | "danger" };
type Notify = (text: string, tone?: Note["tone"]) => void;

const NotifyContext = React.createContext<Notify>(() => {});

/** Confirmaciones breves de cada acción, anunciadas a lectores de pantalla por Radix Toast. */
export function NotifyProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [notes, setNotes] = React.useState<Note[]>([]);
  const notify = React.useCallback<Notify>((text, tone = "default") => {
    setNotes((current) => [...current.slice(-2), { id: Date.now() + Math.random(), text, tone }]);
  }, []);

  return (
    <NotifyContext.Provider value={notify}>
      <ToastProvider swipeDirection="right" label={t("common.status")}>
        {children}
        {notes.map((note) => (
          <Toast
            key={note.id}
            variant={note.tone === "danger" ? "danger" : "default"}
            onOpenChange={(open) => {
              if (!open) setNotes((current) => current.filter((n) => n.id !== note.id));
            }}
          >
            <Icon name={note.tone === "danger" ? "triangle-alert" : "circle-check"} size="sm" />
            <ToastTitle className="flex-1">{note.text}</ToastTitle>
            <ToastClose
              aria-label={t("common.close")}
              className="text-[color:var(--v-on-ink)] hover:bg-[var(--structure-quiet)]"
            />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </NotifyContext.Provider>
  );
}

export function useNotify(): Notify {
  return React.useContext(NotifyContext);
}
