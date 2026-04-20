import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
    baseURL: "/api/v1",
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
        return Promise.reject(error);
    }
);

export default api;
