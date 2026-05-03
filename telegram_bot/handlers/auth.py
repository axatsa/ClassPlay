from telegram import Update
from telegram.ext import ContextTypes
import httpx
from config import BACKEND_URL
from utils.api import save_token, get_token
from keyboards.payment_keyboards import main_menu_keyboard


async def handle_login(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    Usage: /login email@mail.com password123
    """
    user = update.effective_user

    if get_token(user.id):
        await update.message.reply_text(
            "✅ Ты уже авторизован.\n\nИспользуй /pay для оплаты или /status для статуса подписки.",
            reply_markup=main_menu_keyboard(),
        )
        return

    args = context.args
    if not args or len(args) < 2:
        await update.message.reply_text(
            "Введи email и пароль:\n\n<code>/login email@mail.com твой_пароль</code>",
            parse_mode="HTML",
        )
        return

    email = args[0]
    password = " ".join(args[1:])  # handle passwords with spaces

    await update.message.reply_text("⏳ Авторизуюсь...")

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{BACKEND_URL}/api/v1/auth/login",
                json={"email": email, "password": password},
                timeout=10,
            )

        if resp.status_code == 200:
            data = resp.json()
            token = data.get("access_token")
            user_data = data.get("user", {})
            save_token(user.id, token)

            full_name = user_data.get("full_name") or email.split("@")[0]
            plan = user_data.get("subscription", {}).get("plan", "free") if user_data.get("subscription") else "free"

            await update.message.reply_text(
                f"✅ <b>Авторизация успешна!</b>\n\n"
                f"👤 {full_name}\n"
                f"📋 Текущий план: <b>{plan.upper()}</b>\n\n"
                "Выбери действие:",
                parse_mode="HTML",
                reply_markup=main_menu_keyboard(),
            )
        elif resp.status_code == 401:
            await update.message.reply_text("❌ Неверный email или пароль. Попробуй снова.")
        else:
            await update.message.reply_text(f"❌ Ошибка авторизации (код {resp.status_code}). Попробуй позже.")

    except Exception as e:
        await update.message.reply_text(f"❌ Не удалось подключиться к серверу. Попробуй позже.")


async def handle_logout(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from utils.sessions import clear_session
    from utils.api import _user_tokens
    _user_tokens.pop(update.effective_user.id, None)
    clear_session(update.effective_user.id)
    await update.message.reply_text("👋 Ты вышел из аккаунта.")
