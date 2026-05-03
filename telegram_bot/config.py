import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
GROUP_ID = os.getenv("TELEGRAM_GROUP_ID", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BOT_URL = os.getenv("TELEGRAM_BOT_URL", "https://t.me/ClassPlayEdu_Purchase_Bot")

PLAN_LABELS = {
    "pro": "Pro — 190 000 сўм/месяц",
    "school": "School — 620 000 сўм/месяц",
}

REJECT_REASONS = [
    "Неправильный код платежа",
    "Неправильная сумма",
    "Некорректный скриншот",
    "Скриншот не читаемый",
    "Другое",
]
