from telegram import Update
from telegram.ext import ContextTypes
from utils.api import get_token, get_subscription_status
from keyboards.payment_keyboards import main_menu_keyboard, login_keyboard


async def handle_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    token = get_token(user.id)
    if not token:
        msg = update.message or update.callback_query.message
        await msg.reply_text("Войди в ClassPlay:", reply_markup=login_keyboard())
        return

    data = await get_subscription_status(user.id)
    msg = update.message or update.callback_query.message

    if not data:
        await msg.reply_text("❌ Не удалось получить статус подписки.")
        return

    if data.get("is_active"):
        text = (
            f"✅ <b>Подписка активна</b>\n\n"
            f"📋 План: <b>{data['plan'].upper()}</b>\n"
            f"⏰ Действует до: {data['expires_at']}\n\n"
            f"🔢 Токены: {data['tokens_used']:,} / {data['tokens_limit']:,}"
        )
    else:
        text = "❌ У тебя нет активной подписки.\n\nНажми «Купить подписку» чтобы оплатить."

    await msg.reply_text(text, parse_mode="HTML", reply_markup=main_menu_keyboard())
