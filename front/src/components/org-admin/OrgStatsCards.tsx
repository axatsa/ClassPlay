import { motion } from "framer-motion";
import { Shield, Users, Zap, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrgMeResponse as OrgStats } from "@/types/api";

interface OrgStatsCardsProps {
  stats: OrgStats | null;
  isLoading: boolean;
  adminTelegram: string | null;
}

export function OrgStatsCards({ stats, isLoading, adminTelegram }: OrgStatsCardsProps) {
  const seatsPercent = stats ? Math.round((stats.seats_used / Math.max(stats.seats_total, 1)) * 100) : 0;

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-sans">Мест занято</p>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {stats.seats_used}<span className="text-lg text-muted-foreground font-sans">/{stats.seats_total}</span>
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm text-muted-foreground font-sans">Учителей</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.teachers_count}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-sm text-muted-foreground font-sans">Токенов за месяц</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.tokens_this_month.toLocaleString()}</p>
            </motion.div>
          </div>

          {/* Telegram contact banner */}
          {adminTelegram ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground font-sans">Нужно больше токенов?</p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Напишите администратору ClassPlay — он увеличит лимит для всей вашей организации.
                </p>
              </div>
              <a href={`https://t.me/${adminTelegram}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button size="sm" className="gap-2 font-sans rounded-xl bg-blue-500 hover:bg-blue-600 text-white">
                  <Send className="w-3.5 h-3.5" /> Написать
                </Button>
              </a>
            </motion.div>
          ) : null}

          {/* Seat usage bar */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground font-sans">Использование лицензий</p>
              <span className="text-sm font-bold text-foreground font-sans">{seatsPercent}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${seatsPercent}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-full ${seatsPercent >= 90 ? "bg-destructive" : seatsPercent >= 70 ? "bg-yellow-500" : "bg-primary"}`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground font-sans">
              <span>Истекает: {new Date(stats.expires_at).toLocaleDateString("ru-RU")}</span>
              <span className={`font-semibold ${stats.status === "active" ? "text-emerald-600" : "text-destructive"}`}>
                {stats.status === "active" ? "Активна" : stats.status}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
