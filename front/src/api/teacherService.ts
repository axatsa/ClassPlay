import api from "@/lib/api";
import type {
  ClassItem,
  QuizGenerateResponse,
  MathPuzzleGenerateResponse,
} from "@/types/api";

export const teacherService = {
  getClasses: async (): Promise<ClassItem[]> => {
    const response = await api.get<ClassItem[]>("/classes/");
    return response.data;
  },

  createClass: async (data: { name: string; grade: string }): Promise<ClassItem> => {
    const response = await api.post<ClassItem>("/classes/", data);
    return response.data;
  },

  generateQuiz: async (params: { topic: string; count: number; class_id: number; lang: string }): Promise<QuizGenerateResponse> => {
    const response = await api.post<QuizGenerateResponse>("/generate/quiz", params);
    return response.data;
  },

  generateMath: async (params: { config: Record<string, unknown>; class_id: number; lang: string }): Promise<MathPuzzleGenerateResponse> => {
    const response = await api.post<MathPuzzleGenerateResponse>("/generate/math", params);
    return response.data;
  },
};
