import { useState } from "react";
import { motion } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InviteModalProps {
  inviteLink: string;
  onClose: () => void;
}

export function InviteModal({ inviteLink, onClose }: InviteModalProps) {
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground font-sans">Инвайт-ссылка</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground font-sans mb-4">
          Отправьте эту ссылку учителю — он зарегистрируется и автоматически попадёт в вашу организацию.
        </p>
        <div className="flex gap-2">
          <Input value={inviteLink} readOnly className="font-mono text-xs rounded-xl" />
          <Button variant="outline" className="rounded-xl shrink-0" onClick={copyInvite}>
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
