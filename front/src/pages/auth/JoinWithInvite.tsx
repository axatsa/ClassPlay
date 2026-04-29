import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

export default function JoinWithInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("invite");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });

  useEffect(() => {
    if (!token) {
      toast.error(t("joinNoToken"));
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register-with-invite", {
        token,
        ...formData
      });
      
      toast.success(t("joinSuccess"));
      login(response.data.access_token, response.data.user);
      navigate("/teacher");
    } catch (error: any) {
      const msg = error.response?.data?.detail || t("joinError");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <UserPlus className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">{t("joinTitle")}</h1>
          <p className="text-muted-foreground mt-2 font-sans">
            {t("joinSub")}
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 font-sans">{t("joinFullName")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  required
                  placeholder={t("joinFullNamePlaceholder")}
                  className="pl-10 rounded-xl h-12 font-sans"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 font-sans">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  required
                  type="email"
                  placeholder="teacher@school.com"
                  className="pl-10 rounded-xl h-12 font-sans"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-1 font-sans">{t("joinPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 rounded-xl h-12 font-sans"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-lg font-bold mt-6 shadow-lg shadow-primary/20 gap-2"
              disabled={isLoading || !token}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {t("joinRegisterBtn")}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex flex-col gap-4">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
            >
              <ArrowLeft className="w-4 h-4" /> {t("joinHaveAccount")}
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8 font-sans px-4">
          {t("joinAgreement")}
        </p>
      </motion.div>
    </div>
  );
}
