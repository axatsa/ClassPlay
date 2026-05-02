import api from "@/lib/api";
import type {
  GamificationProfile,
  GamificationDailyStats,
  LeaderboardEntry,
  ShopItem,
  ActivityCompleteResponse,
} from "@/types/api";

export const gamificationService = {
  getProfile: async (): Promise<GamificationProfile> => {
    const response = await api.get<GamificationProfile>("/gamification/profile");
    return response.data;
  },

  getDailyStats: async (): Promise<GamificationDailyStats> => {
    const response = await api.get<GamificationDailyStats>("/gamification/daily-stats");
    return response.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const response = await api.get<LeaderboardEntry[]>("/gamification/leaderboard");
    return response.data;
  },

  completeActivity: async (activityType: string, activityId: string): Promise<ActivityCompleteResponse> => {
    const response = await api.post<ActivityCompleteResponse>("/activity/complete", {
      activity_type: activityType,
      activity_id: activityId,
    });
    return response.data;
  },

  getShopItems: async (): Promise<ShopItem[]> => {
    const response = await api.get<ShopItem[]>("/shop/items");
    return response.data;
  },

  purchaseItem: async (itemId: number): Promise<void> => {
    await api.post("/shop/purchase", { item_id: itemId });
  },
};
