import { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRO_PRICE = 15;
const SCHOOL_PRICE = 49;

interface UpgradePlanModalProps {
  teacherCount: number;
  adminTelegram: string | null;
  onClose: () => void;
  onCheckout: (plan: string) => void;
}

export function UpgradePlanModal({
  teacherCount,
  adminTelegram,
  onClose,
  onCheckout,
}: UpgradePlanModalProps) {
  const [seats, setSeats] = useState(Math.max(teacherCount, 1));
  const [tab, setTab] = useState<"pro" | "school">("school");

  const proTotal = seats * PRO_PRICE;
  const schoolBetter = SCHOOL_PRICE < proTotal && seats > 1;

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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-bold text-foreground font-sans">Купить план</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-5 gap-1">
          {(["pro", "school"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold font-sans transition-colors ${
                tab === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "pro" ? "PRO (на учителя)" : "SCHOOL (вся орга)"}
            </button>
          ))}
        </div>

        {tab === "pro" ? (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-sans mb-1">Цена</p>
              <p className="text-2xl font-bold font-sans">${PRO_PRICE}<span className="text-sm font-normal text-muted-foreground"> / учитель / мес</span></p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground font-sans block mb-2">
                Количество учителей
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSeats(s => Math.max(1, s - 1))}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                >−</button>
                <Input
                  type="number"
                  min={1}
                  value={seats}
                  onChange={e => setSeats(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center font-mono rounded-xl w-20"
                />
                <button
                  onClick={() => setSeats(s => s + 1)}
                  className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-lg font-bold hover:bg-muted transition-colors"
                >+</button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {[1, 3, 5, 10].map(n => (
                  <button
                    key={n}
                    onClick={() => setSeats(n)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-sans border transition-colors ${
                      seats === n ? "bg-primary text-background border-primary" : "border-border hover:bg-muted"
                    }`}
                  >
                    {n === teacherCount ? `${n} (все)` : `${n}`}
                  </button>
                ))}
                {teacherCount > 1 && !([1, 3, 5, 10].includes(teacherCount)) && (
                  <button
                    onClick={() => setSeats(teacherCount)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold font-sans border transition-colors ${
                      seats === teacherCount ? "bg-primary text-background border-primary" : "border-border hover:bg-muted"
                    }`}
                  >
                    {teacherCount} (все)
                  </button>
                )}
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-sans">Итого / месяц</span>
              <span className="text-xl font-bold text-primary font-sans">${proTotal}</span>
            </div>
            {schoolBetter && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-700 font-sans">
                Выгоднее взять <b>SCHOOL</b> — ${SCHOOL_PRICE}/мес на всю организацию (сэкономите ${proTotal - SCHOOL_PRICE}/мес)
              </div>
            )}
            {adminTelegram && seats > 1 && (
              <p className="text-xs text-muted-foreground font-sans">
                Для оплаты сразу за несколько аккаунтов —&nbsp;
                <a href={`https://t.me/${adminTelegram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  напишите в Telegram
                </a>, оформим корп. счёт.
              </p>
            )}
            <Button
              className="w-full rounded-xl font-sans"
              onClick={() => onCheckout("pro")}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Перейти к оплате PRO
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-xs text-muted-foreground font-sans mb-1">Цена</p>
              <p className="text-2xl font-bold font-sans">${SCHOOL_PRICE}<span className="text-sm font-normal text-muted-foreground"> / мес — вся организация</span></p>
            </div>
            <ul className="space-y-2">
              {[
                "До 10 учителей",
                "2 100 генераций/месяц на всю школу",
                "Панель управления org-admin",
                "CSV-импорт пользователей",
                "Договор и счёт",
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm font-sans text-foreground">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-sans">Итого / месяц</span>
              <span className="text-xl font-bold text-primary font-sans">${SCHOOL_PRICE}</span>
            </div>
            <Button
              className="w-full rounded-xl font-sans"
              onClick={() => onCheckout("school")}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Перейти к оплате SCHOOL
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
