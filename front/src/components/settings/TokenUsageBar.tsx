import { useEffect, useState } from "react";
import api from "@/lib/api";

interface SubscriptionInfo {
    plan: "free" | "pro" | "school";
    tokens_used: number;
    tokens_limit: number;
    tokens_remaining: number;
    reset_at: string | null;
    is_active: boolean;
}

const PLAN_LABEL: Record<string, string> = {
    free: "Free",
    pro: "Pro Учитель",
    school: "Для Школ",
};

export function TokenUsageBar() {
    const [info, setInfo] = useState<SubscriptionInfo | null>(null);

    useEffect(() => {
        api.get("/payments/subscription/me")
            .then((res) => setInfo(res.data))
            .catch(() => {});
    }, []);

    if (!info) return null;

    const { plan, tokens_used, tokens_limit, reset_at } = info;
    const percent = tokens_limit > 0 ? Math.min(100, Math.round((tokens_used / tokens_limit) * 100)) : 0;
    const isWarning = percent >= 80;
    const isDanger = percent >= 95;
    const barColor = isDanger ? "#FF3D68" : isWarning ? "#F97316" : "#06D6A0";

    return (
        <div style={{ padding: "12px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    Генерации — {PLAN_LABEL[plan] ?? plan}
                </span>
                <span style={{ fontSize: 13, color: barColor }}>
                    {tokens_used.toLocaleString()} / {tokens_limit.toLocaleString()} токенов
                </span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
                <div
                    style={{
                        width: `${percent}%`,
                        height: "100%",
                        borderRadius: 3,
                        background: barColor,
                        transition: "width 0.3s",
                    }}
                />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {reset_at && (
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                        Сбросится: {new Date(reset_at).toLocaleDateString("ru-RU")}
                    </p>
                )}
                {isDanger && plan === "free" && (
                    <a
                        href="/checkout?plan=pro"
                        style={{ fontSize: 12, color: "#0EA5E9", marginLeft: "auto" }}
                    >
                        Перейти на Pro →
                    </a>
                )}
            </div>
        </div>
    );
}
