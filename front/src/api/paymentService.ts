import api from "@/lib/api";

export type Plan = "pro" | "school";
export type PaymentMethod = "payme" | "click";

export interface InitiatePaymentRequest {
    plan: Plan;
    method: PaymentMethod;
}

export interface InitiatePaymentResponse {
    redirect_url: string;
    payment_id: string;
}

export interface TelegramPaymentInfo {
    payment_id: number;
    payment_code: string;
    amount_uzs: number;
    card_number: string;
    card_holder: string;
    expires_at: string;
}

export const paymentService = {
    initiate: async (data: InitiatePaymentRequest): Promise<InitiatePaymentResponse> => {
        const response = await api.post("/payments/initiate", data);
        return response.data;
    },

    initiateTelegram: async (plan: Plan): Promise<TelegramPaymentInfo> => {
        const response = await api.post("/payments/telegram/initiate", { plan });
        return response.data;
    },
};
