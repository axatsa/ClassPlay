import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Dices, Gamepad2, GraduationCap, User, BookOpen,
  ChevronDown, Plus, Check, Globe, BookMarked, Sun, Moon, Settings,
} from "lucide-react";
import { useClass } from "@/context/ClassContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classes, activeClass, setActiveClassId } = useClass();
  const { t, i18n } = useTranslation();
  const { isDark, toggle: toggleTheme } = useTheme();
  const setLang = (l: string) => i18n.changeLanguage(l);
  const lang = i18n.language;
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const navPills = [
    { key: "Generators", label: t("navGenerators"), route: "/generator" },
    { key: "History",    label: lang === "ru" ? "История" : "Tarix",  route: "/history" },
    { key: "Tools",      label: t("navTools"),      route: "/tools" },
    { key: "Games",      label: t("navGames"),      route: "/games" },
    { key: "Library",    label: t("navLibrary"),    route: "/library" },
  ] as const;

  const [activeNav, setActiveNav] = useState<typeof navPills[number]["key"]>("Generators");

  // Bento cards — compact grid
  const cards = [
    {
      title: t("cardAiTitle"),
      desc: t("cardAiDesc"),
      icon: Sparkles,
      route: "/generator",
      gradient: "from-violet-500/10 to-purple-500/5",
      iconBg: "bg-violet-500/15",
      iconColor: "text-violet-600",
      span: "md:col-span-2", // wide card
    },
    {
      title: t("cardGamesTitle"),
      desc: t("cardGamesDesc"),
      icon: Gamepad2,
      route: "/games",
      gradient: "from-emerald-500/10 to-teal-500/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-600",
      span: "",
    },
    {
      title: t("cardToolsTitle"),
      desc: t("cardToolsDesc"),
      icon: Dices,
      route: "/tools",
      gradient: "from-sky-500/10 to-blue-500/5",
      iconBg: "bg-sky-500/15",
      iconColor: "text-sky-600",
      span: "",
    },
    {
      title: lang === "ru" ? "История" : "Tarix",
      desc: lang === "ru" ? "Просмотр созданных материалов" : "Yaratilgan materiallar",
      icon: BookMarked,
      route: "/history",
      gradient: "from-amber-500/10 to-orange-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-600",
      span: "",
    },
    {
      title: t("cardLibraryTitle"),
      desc: t("cardLibraryDesc"),
      icon: BookOpen,
      route: "/library",
      gradient: "from-rose-500/10 to-pink-500/5",
      iconBg: "bg-rose-500/15",
      iconColor: "text-rose-600",
      span: "",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <button onClick={() => navigate("/teacher")} className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo_sticker.webp"
              alt="ClassPlay Logo"
              className="w-9 h-9 rounded-xl object-contain group-hover:scale-110 transition-transform duration-200"
            />
            <span className="text-lg font-display font-bold text-foreground hidden sm:inline tracking-tight">ClassPlay</span>
          </button>

          {/* Nav Pills — centered */}
          <div className="flex items-center bg-muted rounded-full p-1 gap-0.5 overflow-x-auto">
            {navPills.map((pill) => (
              <button
                key={pill.key}
                onClick={() => { setActiveNav(pill.key); navigate(pill.route); }}
                className={`relative px-4 py-1.5 text-sm font-medium font-sans rounded-full transition-colors whitespace-nowrap ${activeNav === pill.key ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {activeNav === pill.key && (
                  <motion.div
                    layoutId="activePillDash"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Class Picker */}
            <div className="relative">
              <button
                onClick={() => setShowClassPicker(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted transition-colors text-sm font-sans font-medium"
              >
                <GraduationCap className="w-3.5 h-3.5 text-violet-500" />
                {activeClass ? (
                  <span className="max-w-[80px] truncate">{activeClass.name}</span>
                ) : (
                  <span className="text-muted-foreground text-xs">{t("selectClass")}</span>
                )}
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showClassPicker ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showClassPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-11 bg-card border border-border rounded-2xl shadow-xl p-1.5 min-w-[190px] z-50 flex flex-col gap-1"
                  >
                    {classes.map((cls) => (
                      <button
                        key={cls.id}
                        onClick={() => { setActiveClassId(cls.id); setShowClassPicker(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left text-sm font-sans"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground text-sm">{cls.name}</span>
                          <span className="text-[10px] text-muted-foreground">{cls.studentCount} {t("studentsLabel")}</span>
                        </div>
                        {cls.id === activeClass?.id && <Check className="w-3.5 h-3.5 text-violet-500" />}
                      </button>
                    ))}
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => { setShowClassPicker(false); navigate("/classes"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-violet-600 font-semibold font-sans hover:bg-muted rounded-xl transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t("addClass")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(v => !v)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors text-sm font-sans font-medium text-foreground"
              >
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                {lang === "ru" ? "RU" : lang === "uz" ? "UZ" : "EN"}
              </button>
              <AnimatePresence>
                {showLangMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-10 bg-card border border-border rounded-2xl shadow-xl p-1.5 min-w-[150px] z-50"
                  >
                    {(["ru", "uz", "en"] as string[]).map(l => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setShowLangMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-sans transition-colors flex items-center gap-2 ${lang === l ? "bg-violet-50 text-violet-700 font-semibold" : "hover:bg-muted text-foreground"}`}
                      >
                        {l === "ru" ? "🇷🇺 Русский" : l === "uz" ? "🇺🇿 O'zbekcha" : "en English"}
                        {lang === l && <Check className="w-3.5 h-3.5 ml-auto" />}
                      </button>
                    ))}
                  </motion.div>   
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            >
              <User className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT — compact, single screen ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 flex flex-col gap-5">

        {/* Welcome bar + active class — compact horizontal strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card rounded-2xl border border-border px-5 py-4 shadow-sm"
        >
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              {lang === "ru" ? "Привет," : "Xush kelibsiz,"}{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                {user?.full_name?.split(" ")[0] || (lang === "ru" ? "Учитель" : "O'qituvchi")}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground font-sans mt-0.5">{t("dashSub")}</p>
          </div>

          {/* Active class badge */}
          {activeClass && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-200/50">
              <GraduationCap className="w-4 h-4 text-violet-600 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground truncate max-w-[140px]">{activeClass.name}</span>
                <span className="text-[10px] text-muted-foreground">{t("grade")} {activeClass.grade} · {activeClass.studentCount} {t("students")}</span>
              </div>
              <button
                onClick={() => navigate("/classes")}
                className="ml-2 p-1 rounded-lg hover:bg-violet-100 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-violet-500" />
              </button>
            </div>
          )}
          {!activeClass && (
            <button
              onClick={() => navigate("/classes")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-violet-300 text-violet-600 text-sm font-semibold hover:bg-violet-50 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t("createFirstClass")}
            </button>
          )}
        </motion.div>

        {/* Bento Grid — compact cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          {cards.map((card, i) => (
            <motion.button
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.route)}
              className={`text-left p-5 rounded-2xl bg-gradient-to-br ${card.gradient} bg-card border border-border shadow-sm hover:shadow-md transition-shadow min-h-[120px] flex flex-col ${card.span}`}
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center mb-3 shrink-0`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <h3 className="text-base font-bold text-foreground font-serif leading-tight">{card.title}</h3>
              <p className="text-xs text-muted-foreground font-sans mt-1 line-clamp-2">{card.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Classes quick row */}
        {classes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-2xl border border-border shadow-sm px-5 py-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground font-serif">{t("activeClass")}</h3>
              <button onClick={() => navigate("/classes")} className="text-xs text-violet-600 font-semibold hover:underline">
                {t("manageClasses")} →
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {classes.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setActiveClassId(cls.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-sans transition-colors border ${
                    cls.id === activeClass?.id
                      ? "bg-violet-600 text-white border-violet-600 font-semibold"
                      : "bg-muted border-border text-foreground hover:border-violet-300"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {cls.name}
                  <span className="text-[10px] opacity-60">{cls.studentCount}</span>
                </button>
              ))}
              <button
                onClick={() => navigate("/classes")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-sans border border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {t("addClass")}
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;
