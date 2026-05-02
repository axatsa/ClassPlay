import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Menu, X, LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const NAV_LINKS = [
    { href: "#features", label: t("land_nav_features") },
    { href: "#how-it-works", label: t("land_nav_how") },
    { href: "#games", label: t("land_nav_games") },
    { href: "#pricing", label: t("land_nav_pricing") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(user ? "/teacher" : "/")}
          className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer"
        >
          <div className="w-9 h-9 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo_sticker.webp" alt="ClassPlay" className="w-full h-full object-contain" fetchPriority="high" />
          </div>
          <span className="text-lg font-bold text-foreground font-serif tracking-tight">ClassPlay</span>
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfile(v => !v)}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center border-none cursor-pointer"
              >
                <User className="w-4 h-4 text-white" />
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-12 w-52 bg-card rounded-2xl border border-border shadow-xl p-2 z-50"
                  >
                    <div className="px-3 py-2 border-b border-border mb-1">
                      <p className="font-bold text-sm text-foreground">{user.full_name || user.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => navigate(user.role === "super_admin" ? "/admin" : "/teacher")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-muted transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <Settings className="w-4 h-4 opacity-50" /> {t("land_dashboard")}
                    </button>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> {t("logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Button variant="ghost" className="text-sm rounded-xl" onClick={() => navigate("/demo")}>{t("land_demo")}</Button>
              <Button className="rounded-xl text-sm gap-1.5" onClick={() => navigate("/login")}>
                {t("land_login")} <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-6 py-4 space-y-3">
          {NAV_LINKS.map(({ href, label }) => (
            <a key={href} href={href} className="block text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>
              {label}
            </a>
          ))}
          <div className="pt-2 flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl text-sm" onClick={() => navigate("/demo")}>{t("land_demo")}</Button>
            <Button className="flex-1 rounded-xl text-sm" onClick={() => navigate("/login")}>{t("land_login")}</Button>
          </div>
        </div>
      )}
    </header>
  );
}
