import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFail() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const plan = params.get("plan") || "pro";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border rounded-3xl p-14 max-w-md w-full text-center shadow-xl"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-7"
                >
                    <XCircle size={36} className="text-red-500" />
                </motion.div>

                <h1 className="text-3xl font-bold font-serif text-foreground mb-3 leading-tight">
                    Оплата не прошла
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed mb-9">
                    Что-то пошло не так. Попробуйте ещё раз или свяжитесь с поддержкой.
                </p>

                <div className="flex flex-col gap-3">
                    <Button className="w-full rounded-2xl py-6" onClick={() => navigate(`/checkout?plan=${plan}`)}>
                        <RotateCcw size={15} /> Попробовать снова
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl py-6" onClick={() => navigate("/")}>
                        <Home size={15} /> На главную
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
