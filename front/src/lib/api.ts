import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — добавляем токен к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — при 401 редирект на логин, при 402 показ тоста о лимите
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Token expired or invalid — redirecting to login");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:unauthorized"));
        }
        if (error.response?.status === 402) {
            const detail = error.response.data?.detail;
            if (detail?.error === "token_quota_exceeded") {
                window.dispatchEvent(new CustomEvent("quota:exceeded", { detail: { detail } }));
                import("sonner").then(({ toast }) => {
                    toast.error("Лимит генераций исчерпан. Обновите тариф.", {
                        duration: 10000,
                        action: {
                            label: "Обновить",
                            onClick: () => { window.location.href = "/checkout"; },
                        },
                    });
                });
            }
        }
        if (error.response?.status === 429) {
            const detail = error.response.data?.detail;
            const retryAfter = detail?.retry_after;
            if (retryAfter) {
                window.dispatchEvent(new CustomEvent("api:overloaded", { detail: { retryAfter } }));
            }
        }
        if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
            import("sonner").then(({ toast }) => {
                toast.error("Сервер не отвечает. Проверьте соединение и попробуйте снова.", { duration: 6000 });
            });
        } else if (!error.response) {
            import("sonner").then(({ toast }) => {
                toast.error("Нет соединения с сервером. Проверьте интернет.", { duration: 6000 });
            });
        }
        return Promise.reject(error);
    }
);

export default api;
