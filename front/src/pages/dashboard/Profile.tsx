import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Mail, Phone, School, Lock, Edit3, Save, X,
  Zap, BookOpen, BarChart2, Copy, Check, LogOut,
  Star, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface UserProfile {
  id: number;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  school: string | null;
  created_at: string | null;
  tokens_limit: number;
  tokens_used_this_month: number;
}

interface SubscriptionData {
  plan: string;
  expires_at: string | null;
  is_active: boolean;
  tokens_used: number;
  tokens_limit: number;
  tokens_remaining: number;
  reset_at: string | null;
  limits: {
    books_per_day: number;
    generations_per_month: number;
  };
}

interface Stats {
  total_resources: number;
  total_tokens: number;
  active_classes: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", school: "" });
  const [pwdForm, setPwdForm] = useState({ old_password: "", new_password: "", confirm: "" });
  const [copied, setCopied] = useState(false);
  const { logout } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await api.get("/payments/subscription/me");
      setSubscription(res.data);
    } catch {}
  };

  const loadProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data);
      setEditForm({
        full_name: res.data.full_name || "",
        phone: res.data.phone || "",
        school: res.data.school || "",
      });
    } catch {}
  };

  const loadStats = async () => {
    try {
      const [res, classRes, historyRes] = await Promise.allSettled([
        api.get("/generator/usage-stats"),
        api.get("/classes/"),
        api.get("/history/"),
      ]);
      setStats({
        total_resources: historyRes.status === "fulfilled" ? (historyRes.value.data?.items?.length || historyRes.value.data?.length || 0) : 0,
        total_tokens: res.status === "fulfilled" ? (res.value.data?.tokens_used_this_month || 0) : 0,
        active_classes: classRes.status === "fulfilled" ? (classRes.value.data?.length || 0) : 0,
      });
    } catch {}
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch("/auth/me", editForm);
      setProfile(p => p ? { ...p, ...editForm } : p);
      setEditing(false);
      flash("Профиль обновлён", "success");
    } catch {
      flash("Ошибка при сохранении", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (pwdForm.new_password !== pwdForm.confirm) {
      flash("Пароли не совпадают", "error");
      return;
    }
    setSavingPwd(true);
    try {
      await api.put("/auth/change-password", {
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      setPwdForm({ old_password: "", new_password: "", confirm: "" });
      flash("Пароль изменён", "success");
    } catch (e: any) {
      flash(e?.response?.data?.detail || "Ошибка смены пароля", "error");
    } finally {
      setSavingPwd(false);
    }
  };

  const flash = (text: string, type: "success" | "error") => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  const copyEmail = () => {
    if (profile?.email) {
      navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const usagePercent = profile && profile.tokens_limit > 0
    ? Math.min(100, Math.round((profile.tokens_used_this_month / profile.tokens_limit) * 100))
    : 0;

  const usageColor = usagePercent > 80 ? "#ef4444" : usagePercent > 50 ? "#f59e0b" : "#10b981";

  if (!profile) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-xl mx-auto p-4">
<div className="bg-white dark:bg-gray-800 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        {/* Header row */}
        <div className="bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {(profile.full_name || profile.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold truncate leading-tight">{profile.full_name || "—"}</h1>
              <div className="flex items-center gap-1.5 opacity-90">
                <span className="text-xs truncate">{profile.email}</span>
                <button onClick={copyEmail} className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 bg-white/20 hover:bg-red-400/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats + token bar in one row */}
        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center gap-4">
          {[
            { icon: BookOpen, label: "Материалы", value: stats?.total_resources ?? "—" },
            { icon: BarChart2, label: "Классы", value: stats?.active_classes ?? "—" },
            { icon: Zap, label: "Токены", value: profile.tokens_used_this_month?.toLocaleString() ?? 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
              <span className="text-xs text-gray-400">{label}</span>
            </div>
          ))}
          <div className="flex-1 ml-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Лимит</span>
              <span style={{ color: usageColor }}>{usagePercent}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${usagePercent}%`, background: usageColor }} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {profile.tokens_used_this_month?.toLocaleString()} / {profile.tokens_limit === -1 ? "∞" : profile.tokens_limit?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Subscription compact row */}
        <div className="px-4 py-2.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${subscription?.is_active ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
              {subscription?.is_active ? `План ${subscription.plan}` : "Бесплатный план"}
            </span>
            {subscription?.is_active && subscription.expires_at && (
              <span className="text-xs text-gray-400">· до {new Date(subscription.expires_at).toLocaleDateString("ru-RU")}</span>
            )}
          </div>
          <Link
            to="/checkout"
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
              subscription?.is_active
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
            }`}
          >
            {subscription?.is_active ? "Продлить" : "Улучшить"}
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Profile fields */}
        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
          {editing ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs text-gray-400">Имя</span>
                  <input
                    className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-700 text-sm"
                    value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Иван Иванов"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-gray-400">Телефон</span>
                  <input
                    className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-700 text-sm"
                    value={editForm.phone}
                    onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+7 900 000 00 00"
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-xs text-gray-400">Школа</span>
                <input
                  className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-700 text-sm"
                  value={editForm.school}
                  onChange={e => setEditForm(f => ({ ...f, school: e.target.value }))}
                  placeholder="Школа №1"
                />
              </label>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {savingProfile ? "Сохраняем..." : "Сохранить"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Mail, label: profile.email },
                { icon: Phone, label: profile.phone || "—" },
                { icon: School, label: profile.school || "—" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 truncate">
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Сменить пароль</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { key: "old_password", placeholder: "Текущий" },
              { key: "new_password", placeholder: "Новый" },
              { key: "confirm", placeholder: "Повторить" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="password"
                placeholder={placeholder}
                className="w-full px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-700 text-xs"
                value={pwdForm[key as keyof typeof pwdForm]}
                onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
              />
            ))}
          </div>
          <button
            onClick={changePassword}
            disabled={savingPwd || !pwdForm.old_password || !pwdForm.new_password}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
          >
            {savingPwd ? "Меняем..." : "Изменить пароль"}
          </button>
        </div>
      </div>
    </div>
  );
}
