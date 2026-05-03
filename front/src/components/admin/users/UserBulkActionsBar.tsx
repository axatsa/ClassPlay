import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Calendar, Lock, Unlock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { adminService } from "@/api/adminService";

interface UserBulkActionsBarProps {
  selectedIds: number[];
  setSelectedIds: (v: number[]) => void;
  onRefresh: () => void;
}

export const UserBulkActionsBar: React.FC<UserBulkActionsBarProps> = ({
  selectedIds, setSelectedIds, onRefresh,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleChangePlan = async () => {
    const plan = prompt("Введите план (free, pro, school):", "pro");
    if (plan) {
      await adminService.bulkChangePlan(selectedIds, plan);
      setSelectedIds([]);
      onRefresh();
      toast.success(`План изменён на ${plan}`);
    }
  };

  const handleExtend = async () => {
    const days = prompt("На сколько дней продлить?", "30");
    if (days && !isNaN(parseInt(days))) {
      await adminService.bulkExtendSubscription(selectedIds, parseInt(days));
      setSelectedIds([]);
      onRefresh();
      toast.success(`Подписка продлена на ${days} дней`);
    }
  };

  const handleBlock = async () => {
    await adminService.bulkBlockTeachers(selectedIds);
    setSelectedIds([]);
    onRefresh();
    toast.success("Пользователи заблокированы");
  };

  const handleUnblock = async () => {
    await adminService.bulkUnblockTeachers(selectedIds);
    setSelectedIds([]);
    onRefresh();
    toast.success("Пользователи разблокированы");
  };

  const handleDelete = () => setConfirmOpen(true);

  const confirmDelete = async () => {
    await adminService.bulkDeleteTeachers(selectedIds);
    setSelectedIds([]);
    onRefresh();
    toast.success("Пользователи удалены");
  };

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 flex-wrap max-w-[90vw]"
        >
          <span className="text-sm font-semibold font-sans">Выбрано: {selectedIds.length}</span>
          <div className="h-4 w-px bg-background/20" />
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
              onClick={handleChangePlan}
            >
              <CreditCard className="w-3.5 h-3.5" /> План
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
              onClick={handleExtend}
            >
              <Calendar className="w-3.5 h-3.5" /> Продлить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
              onClick={handleBlock}
            >
              <Lock className="w-3.5 h-3.5" /> Блокировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-background/10 text-background gap-2 h-8 text-xs font-sans"
              onClick={handleUnblock}
            >
              <Unlock className="w-3.5 h-3.5" /> Разблокировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-destructive/20 text-destructive gap-2 h-8 text-xs font-sans"
              onClick={handleDelete}
            >
              <X className="w-3.5 h-3.5" /> Удалить
            </Button>
          </div>
        </motion.div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Удалить ${selectedIds.length} учителей?`}
        message="Все выбранные учителя будут удалены безвозвратно. Это действие нельзя отменить."
        confirmLabel="Удалить всех"
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </AnimatePresence>
  );
};
