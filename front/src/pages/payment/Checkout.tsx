import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, LogIn, Rocket, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { paymentService, Plan, PaymentMethod, TelegramPaymentInfo } from "@/api/paymentService";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";

const DARK = "#07101F";
const BLUE = "#0EA5E9";
const CORAL = "#FF3D68";
const CYAN = "#06D6A0";
const INK = "#0C1828";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; logo: string; color: string }[] = [
    {
        id: "payme",
        label: "Payme",
        logo: "https://static.payme.uz/img/logo_payme_mini.svg",
        color: "#00AAFF",
    },
    {
        id: "click",
        label: "Click",
        logo: "https://cdn.click.uz/click/assets/images/click-logo.svg",
        color: "#FF6600",
    },
];

export default function Checkout() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const { user } = useAuth();
    const { t } = useTranslation();

    const PLANS: Record<string, {
        name: string; price: string; period: string; features: string[];
        accent: string; planKey: Plan; free?: boolean;
    }> = {
        free: {
            name: t("planFreeName"), price: "$0", period: t("checkoutForever"),
            planKey: "pro" as Plan, free: true,
            accent: `linear-gradient(135deg, #10B981, #06D6A0)`,
            features: [t("planFreeF1"), t("planFreeF2"), t("planFreeF3"), t("planFreeF4")],
        },
        pro: {
            name: t("planProName"), price: "$15", period: t("checkoutPerMonth"),
            planKey: "pro",
            accent: `linear-gradient(135deg, ${BLUE}, ${CORAL})`,
            features: [t("planProF1"), t("planProF2"), t("planProF3"), t("planProF4"), t("planProF5")],
        },
        school: {
            name: t("planSchoolName"), price: "$49", period: t("checkoutPerMonth"),
            planKey: "school",
            accent: `linear-gradient(135deg, #F97316, #FBBF24)`,
            features: [t("planSchoolF1"), t("planSchoolF2"), t("planSchoolF3"), t("planSchoolF4"), t("planSchoolF5")],
        },
    };

    const planId = params.get("plan") || "pro";
    const plan = PLANS[planId] ?? PLANS.pro;

    const [loading, setLoading] = useState<PaymentMethod | "telegram" | null>(null);
    const [tgPayment, setTgPayment] = useState<TelegramPaymentInfo | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [authMode, setAuthMode] = useState<"login" | "register">("register");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const { login: contextLogin } = useAuth();

    const handleFreeSignup = async () => {
        setAuthLoading(true);
        try {
            const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
            const payload = authMode === "login"
                ? { email, password }
                : { email, password, full_name: fullName };
            const res = await api.post(endpoint, payload);
            contextLogin(res.data.access_token, res.data.user);
            toast.success(authMode === "login" ? t("checkoutWelcome") : t("checkoutAccountCreated"));
            navigate("/teacher");
        } catch (err: any) {
            toast.error(err.response?.data?.detail || t("checkoutAuthError"));
        } finally {
            setAuthLoading(false);
        }
    };

    const handleAuthAndPay = async (method: PaymentMethod) => {
        setLoading(method);
        try {
            let activeUser = user;

            // If not logged in, try to register/login first
            if (!activeUser) {
                setAuthLoading(true);
                try {
                    const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
                    const payload = authMode === "login" 
                        ? { email, password } 
                        : { email, password, full_name: fullName };
                    
                    const res = await api.post(endpoint, payload);
                    contextLogin(res.data.access_token, res.data.user);
                    activeUser = res.data.user;
                    toast.success(authMode === "login" ? t("checkoutLoggedIn") : t("checkoutAuthCreated"));
                } catch (err: any) {
                    toast.error(err.response?.data?.detail || t("checkoutAuthError"));
                    setLoading(null);
                    setAuthLoading(false);
                    return;
                }
                setAuthLoading(false);
            }

            // Now initiate payment
            const res = await paymentService.initiate({ plan: plan.planKey, method });
            window.location.href = res.redirect_url;
        } catch (err: any) {
            toast.error(err.response?.data?.detail || t("checkoutPaymentError"));
            setLoading(null);
        }
    };

    const handleTelegramPay = async () => {
        if (!user) { toast.error("Сначала войди в аккаунт"); return; }
        setLoading("telegram");
        try {
            const data = await paymentService.initiateTelegram(plan.planKey);
            setTgPayment(data);
        } catch {
            toast.error("Ошибка при создании платежа. Попробуй снова.");
        } finally {
            setLoading(null);
        }
    };

    const copyCode = () => {
        if (!tgPayment) return;
        navigator.clipboard.writeText(tgPayment.payment_code);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    if (plan.free && user) {
        navigate("/teacher");
        return null;
    }

    if (!user) {
        return (
            <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 32, padding: "40px",
                        maxWidth: 480, width: "100%", textAlign: "center",
                        backdropFilter: "blur(20px)",
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: plan.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 32px rgba(14,165,233,0.3)" }}>
                            <Rocket size={32} color="#fff" />
                        </div>
                    </div>

                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
                        {authMode === "register" ? t("checkoutRegister") : t("checkoutLogin")}
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
                        {t("checkoutActivatePlan")} <strong style={{ color: "#fff" }}>{plan.name}</strong>
                    </p>

                    <form style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }} onSubmit={(e) => e.preventDefault()}>
                        {authMode === "register" && (
                            <div>
                                <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginLeft: 12, marginBottom: 6, display: "block" }}>{t("checkoutFullName")}</label>
                                <input 
                                    type="text" 
                                    placeholder="Иван Иванов" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "14px 20px", color: "#fff", outline: "none" }} 
                                />
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginLeft: 12, marginBottom: 6, display: "block" }}>Email</label>
                            <input 
                                type="email" 
                                placeholder="example@mail.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "14px 20px", color: "#fff", outline: "none" }} 
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginLeft: 12, marginBottom: 6, display: "block" }}>{t("checkoutPassword")}</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "14px 20px", color: "#fff", outline: "none" }} 
                            />
                        </div>

                        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                            {plan.free ? (
                                <button
                                    disabled={authLoading || !email || !password}
                                    onClick={handleFreeSignup}
                                    style={{
                                        width: "100%", padding: "16px",
                                        background: authLoading ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, #10B981, #06D6A0)`,
                                        color: "#fff", fontSize: 15, fontWeight: 700,
                                        border: "none", borderRadius: 16, cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        opacity: (!email || !password) ? 0.5 : 1,
                                        boxShadow: (email && password) ? `0 8px 24px rgba(16,185,129,0.3)` : "none",
                                    }}
                                >
                                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : (authMode === "login" ? t("land_login") : t("land_hero_cta"))}
                                </button>
                            ) : PAYMENT_METHODS.map(m => (
                                <button
                                    key={m.id}
                                    disabled={loading !== null || !email || !password}
                                    onClick={() => handleAuthAndPay(m.id)}
                                    style={{
                                        width: "100%", padding: "16px",
                                        background: loading === m.id ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg, ${BLUE}, ${CORAL})`,
                                        color: "#fff", fontSize: 15, fontWeight: 700,
                                        border: "none", borderRadius: 16, cursor: "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                                        opacity: (!email || !password) ? 0.5 : 1,
                                        boxShadow: (email && password) ? `0 8px 24px rgba(14,165,233,0.3)` : "none",
                                    }}
                                >
                                    {loading === m.id ? <Loader2 size={18} className="animate-spin" /> : <>{t("checkoutPayWith")} {m.label}</>}
                                </button>
                            ))}
                        </div>
                    </form>

                    <button 
                        onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                        style={{ marginTop: 24, background: "none", border: "none", color: BLUE, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                    >
                        {authMode === "login" ? t("checkoutNoAccount") : t("checkoutHasAccount")}
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: DARK, padding: "32px 16px" }}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", cursor: "pointer",
                        color: "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 500,
                        marginBottom: 32, padding: 0,
                    }}
                >
                    <ArrowLeft size={16} /> {t("checkoutBack")}
                </button>

                <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 28, fontWeight: 800, color: "#fff",
                    marginBottom: 6,
                }}>
                    {t("checkoutTitle")}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginBottom: 28 }}>
                    {t("checkoutSelectMethod")}
                </p>

                {/* Plan card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 20, padding: 24, marginBottom: 20,
                        position: "relative", overflow: "hidden",
                    }}
                >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: plan.accent }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                                {t("checkoutSelectedPlan")}
                            </p>
                            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff" }}>
                                {plan.name}
                            </h2>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff" }}>
                                {plan.price}
                            </span>
                            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}> {plan.period}</span>
                        </div>
                    </div>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                        {plan.features.map((f, i) => (
                            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                                <CheckCircle2 size={15} color={CYAN} style={{ flexShrink: 0 }} />
                                {f}
                            </li>
                        ))}
                    </ul>
                </motion.div>

                {/* Payment methods */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {PAYMENT_METHODS.map((m, i) => (
                        <motion.button
                            key={m.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading !== null}
                            onClick={() => handleAuthAndPay(m.id)}
                            style={{
                                width: "100%", padding: "18px 24px",
                                background: "rgba(255,255,255,0.05)",
                                border: `1px solid rgba(255,255,255,0.1)`,
                                borderRadius: 16, cursor: loading !== null ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                transition: "background 0.2s",
                                opacity: loading !== null && loading !== m.id ? 0.4 : 1,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <img src={m.logo} alt={m.label} style={{ width: 28, height: 28, objectFit: "contain" }} />
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>{m.label}</p>
                                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                                        {t("checkoutPayVia")} {m.label}
                                    </p>
                                </div>
                            </div>

                            {loading === m.id ? (
                                <Loader2 size={20} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                                <div style={{
                                    padding: "8px 18px", borderRadius: 10,
                                    background: `linear-gradient(135deg, ${BLUE}, ${CORAL})`,
                                    color: "#fff", fontSize: 13, fontWeight: 700,
                                }}>
                                    {t("checkoutPay")}
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Telegram payment option */}
                <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading !== null}
                    onClick={handleTelegramPay}
                    style={{
                        width: "100%", padding: "18px 24px", marginTop: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(41,182,246,0.3)",
                        borderRadius: 16, cursor: loading !== null ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        opacity: loading !== null && loading !== "telegram" ? 0.4 : 1,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: "#229ED9",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.93 13.48 5.007 12.6c-.657-.203-.671-.657.136-.975l11.157-4.303c.547-.196 1.026.12.594.899z"/>
                            </svg>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Telegram</p>
                            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                                Перевод на карту — 0% комиссии
                            </p>
                        </div>
                    </div>
                    {loading === "telegram"
                        ? <Loader2 size={20} color="rgba(255,255,255,0.5)" style={{ animation: "spin 1s linear infinite" }} />
                        : <div style={{ padding: "8px 18px", borderRadius: 10, background: "#229ED9", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                            Оплатить
                        </div>
                    }
                </motion.button>

                {/* Telegram payment instructions */}
                <AnimatePresence>
                    {tgPayment && (
                        <motion.div
                            initial={{ opacity: 0, y: 12, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            style={{
                                marginTop: 16, background: "rgba(34,158,217,0.08)",
                                border: "1px solid rgba(34,158,217,0.3)",
                                borderRadius: 16, padding: 20, overflow: "hidden",
                            }}
                        >
                            <p style={{ color: "#229ED9", fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                                📋 Инструкция по оплате
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
                                    <span>💵 Сумма</span>
                                    <span style={{ color: "#fff", fontWeight: 700 }}>
                                        {tgPayment.amount_uzs.toLocaleString()} сўм
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
                                    <span>🏦 Карта</span>
                                    <span style={{ color: "#fff", fontWeight: 700 }}>{tgPayment.card_number}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
                                    <span>👤 Получатель</span>
                                    <span style={{ color: "#fff" }}>{tgPayment.card_holder}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
                                    <span>⏰ До</span>
                                    <span style={{ color: "#fff" }}>{tgPayment.expires_at}</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 16, background: "rgba(255,255,255,0.06)",
                                borderRadius: 12, padding: "12px 16px",
                            }}>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 6 }}>
                                    ⚠️ Обязательно напиши в комментарии к переводу:
                                </p>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                                    <code style={{ color: "#06D6A0", fontSize: 13, fontWeight: 700, wordBreak: "break-all" }}>
                                        {tgPayment.payment_code}
                                    </code>
                                    <button
                                        onClick={copyCode}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: codeCopied ? "#06D6A0" : "rgba(255,255,255,0.4)", flexShrink: 0 }}
                                    >
                                        {codeCopied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <a
                                href={`https://t.me/ClassPlayEdu_Purchase_Bot?start=pay`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "block", marginTop: 14, padding: "14px",
                                    background: "#229ED9", borderRadius: 12,
                                    color: "#fff", fontSize: 14, fontWeight: 700,
                                    textAlign: "center", textDecoration: "none",
                                }}
                            >
                                📱 Открыть Telegram бот и отправить чек
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer note */}
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
                    {t("checkoutFooter")}
                </p>
            </div>
        </div>
    );
}
