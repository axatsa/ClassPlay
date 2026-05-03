import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title = "Подтвердите действие",
  message,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {danger && (
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                )}
                <h3 className="font-bold text-foreground font-sans">{title}</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground font-sans mb-5">{message}</p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-sans"
                onClick={onClose}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={danger ? "destructive" : "default"}
                className="flex-1 rounded-xl font-sans"
                onClick={() => { onConfirm(); onClose(); }}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
