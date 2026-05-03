import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [status, setStatus] = useState<"verifying" | "completed" | "timeout">("verifying");
    const paymentId = searchParams.get("payment_id");
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!paymentId) {
            setStatus("completed");
            return;
        }

        timeoutRef.current = setTimeout(() => {
            setStatus("timeout");
        }, 60000);

        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/payments/${paymentId}`);
                if (res.data.status === "completed") {
                    setStatus("completed");
                    clearInterval(interval);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                } else if (res.data.status === "failed" || res.data.status === "cancelled") {
                    clearInterval(interval);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    navigate("/payment/fail");
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [paymentId, navigate]);

    const handleContinue = () => {
        if (user?.role === "super_admin") navigate("/admin");
        else navigate("/teacher");
    };

    const iconBg = status === "completed"
        ? "bg-primary/10 border-primary/30"
        : status === "timeout"
        ? "bg-amber-100 border-amber-300"
        : "bg-primary/5 border-primary/20";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-card border border-border rounded-3xl p-14 max-w-md w-full text-center shadow-xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`w-20 h-20 rounded-full border-2 ${iconBg} flex items-center justify-center mx-auto mb-7`}
                >
                    {status === "verifying" ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                            <Loader2 size={36} className="text-primary" />
                        </motion.div>
                    ) : status === "timeout" ? (
                        <AlertCircle size={36} className="text-amber-500" />
                    ) : (
                        <CheckCircle2 size={36} className="text-primary" />
                    )}
                </motion.div>

                <h1 className="text-3xl font-bold font-serif text-foreground mb-3 leading-tight">
                    {status === "verifying" ? t("payVerifying") : status === "timeout" ? t("payTimeout") : t("payDone")}
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed mb-9">
                    {status === "verifying"
                        ? t("payVerifyingDesc")
                        : status === "timeout"
                        ? t("payTimeoutDesc")
                        : t("payDoneDesc")}
                </p>

                {status === "timeout" && (
                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="w-full rounded-2xl py-6" onClick={handleContinue}>
                            {t("payStillEnter")} <ArrowRight size={15} />
                        </Button>
                        <a
                            href="mailto:support@classplay.uz"
                            className="text-sm text-muted-foreground hover:text-foreground transition no-underline mt-2"
                        >
                            {t("paySupport")}
                        </a>
                    </div>
                )}

                {status === "completed" && (
                    <Button className="w-full rounded-2xl py-6" onClick={handleContinue}>
                        {t("payGoToCabinet")} <ArrowRight size={15} />
                    </Button>
                )}
            </motion.div>
        </div>
    );
}
