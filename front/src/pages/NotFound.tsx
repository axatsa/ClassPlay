import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404:", location.pathname);
  }, [location.pathname]);

  const handleHome = () => {
    if (user?.role === "super_admin") navigate("/admin");
    else if (user) navigate("/teacher");
    else navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-7xl font-bold text-foreground">404</p>
        <p className="text-xl text-muted-foreground">Страница не найдена</p>
        <button
          onClick={handleHome}
          className="mt-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          {user ? "На главную" : "На сайт"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
