import { toast } from "sonner";

/**
 * Handles AI generation errors by showing user-friendly messages 
 * and hiding technical details.
 */
export const handleAIError = (error: any, t: any) => {
  console.error("AI Generation Error:", error);

  if (error.response?.status === 402) {
    // 402 Payment Required -> Token limit reached
    const message = t('generation_limit_reached', 'Лимит генерации исчерпан. Пожалуйста, обратитесь к администратору для пополнения баланса.');
    toast.error(message, {
      duration: 5000,
    });
    return;
  }

  if (error.response?.status === 429) {
    // 429 Too Many Requests -> Rate limit
    toast.error(t('rate_limit_exceeded', 'Слишком много запросов. Пожалуйста, подождите минуту.'));
    return;
  }

  // Generic clean error message
  toast.error(t('generation_failed_generic', 'Не удалось создать материал. Пожалуйста, попробуйте еще раз.'));
};
