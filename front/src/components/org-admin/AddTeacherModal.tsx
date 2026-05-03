import { useState } from "react";
import { motion } from "framer-motion";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

interface AddTeacherModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTeacherModal({ onClose, onSuccess }: AddTeacherModalProps) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [school, setSchool] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || !password) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/org-admin/teachers", { email, full_name: fullName, password, school: school || undefined });
      toast.success("Учитель создан");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Ошибка при создании учителя");
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-foreground font-sans">Добавить учителя</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground font-sans">Email *</label>
            <Input
              type="email"
              placeholder="teacher@school.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl font-sans"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground font-sans">Имя и фамилия *</label>
            <Input
              placeholder="Иван Иванов"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="rounded-xl font-sans"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground font-sans">Пароль *</label>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="Минимум 6 символов"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="rounded-xl font-sans pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground font-sans">Школа / учреждение</label>
            <Input
              placeholder="Необязательно"
              value={school}
              onChange={e => setSchool(e.target.value)}
              className="rounded-xl font-sans"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl font-sans" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" className="flex-1 rounded-xl font-sans" disabled={isLoading}>
              {isLoading ? "Создаём..." : "Создать"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
