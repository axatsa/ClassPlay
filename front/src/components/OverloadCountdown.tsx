import { useEffect, useState } from "react";

export function OverloadCountdown() {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const retry = (e as CustomEvent).detail?.retryAfter ?? 60;
            setSecondsLeft(retry);
        };
        window.addEventListener("api:overloaded", handler);
        return () => window.removeEventListener("api:overloaded", handler);
    }, []);

    useEffect(() => {
        if (secondsLeft === null || secondsLeft <= 0) {
            if (secondsLeft === 0) setSecondsLeft(null);
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : null)), 1000);
        return () => clearTimeout(t);
    }, [secondsLeft]);

    if (secondsLeft === null) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 9999,
                background: "#1e293b",
                border: "1px solid #F97316",
                borderRadius: 12,
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                minWidth: 260,
            }}
        >
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#F97316" }}>
                    Высокая нагрузка
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    Повторите через{" "}
                    <span style={{ color: "#fff", fontWeight: 700 }}>{secondsLeft} сек</span>
                </p>
            </div>
        </div>
    );
}
