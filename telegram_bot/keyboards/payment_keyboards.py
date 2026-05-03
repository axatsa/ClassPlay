from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from config import PLAN_LABELS, REJECT_REASONS, FRONTEND_URL


def plan_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("📚 Pro — 190 000 сўм", callback_data="plan_pro")],
        [InlineKeyboardButton("🏫 School — 620 000 сўм", callback_data="plan_school")],
        [InlineKeyboardButton("❌ Отмена", callback_data="cancel")],
    ])


def main_menu_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💳 Купить подписку", callback_data="buy")],
        [InlineKeyboardButton("📊 Мой статус", callback_data="status")],
        [InlineKeyboardButton("❓ Помощь", callback_data="help")],
    ])


def reject_reasons_keyboard(payment_id: int) -> InlineKeyboardMarkup:
    buttons = [
        [InlineKeyboardButton(reason, callback_data=f"rejectreason_{payment_id}_{i}")]
        for i, reason in enumerate(REJECT_REASONS)
    ]
    return InlineKeyboardMarkup(buttons)


def login_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔑 Войти в ClassPlay", url=f"{FRONTEND_URL}/login")],
    ])
