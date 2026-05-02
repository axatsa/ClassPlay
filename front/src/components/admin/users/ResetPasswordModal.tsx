import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/types/admin";
import { adminService } from "@/api/adminService";

interface ResetPasswordModalProps {
  teacherId: number | null;
  teachers: Teacher[];
  onClose: () => void;
}

const generateTempPassword = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  teacherId, teachers, onClose,
}) => {
  const { t } = useTranslation();
  const [tmpPwd, setTmpPwd] = useState(() => generateTempPassword());

  useEffect(() => {
    if (teacherId !== null) setTmpPwd(generateTempPassword());
  }, [teacherId]);

  const teacher = teacherId !== null ? teachers.find((t_) => t_.id === teacherId) : null;

  const handleConfirm = async () => {
    if (teacherId === null) return;
    try {
      await adminService.resetTeacherPassword(teacherId, tmpPwd);
      toast.success("Пароль успешно изменён");
      onClose();
    } catch {
      toast.error("Ошибка при сбросе пароля");
    }
  };

  return (
    <AnimatePresence>
      {teacherId !== null && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
            className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("admin_reset_pwd_title")}</h3>
                <p className="text-xs text-muted-foreground font-sans">{teacher?.name}</p>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground font-sans mb-1">{t("admin_temp_pwd")}</p>
              <p className="text-2xl font-mono font-bold text-foreground tracking-widest">{tmpPwd}</p>
            </div>
            <p className="text-xs text-muted-foreground font-sans mb-4">{t("admin_pwd_hint")}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl font-sans" onClick={onClose}>Отмена</Button>
              <Button className="flex-1 rounded-xl font-sans" onClick={handleConfirm}>Подтвердить</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
