"""Handles approve/reject callbacks from the admin Telegram group."""
from telegram import Update
from telegram.ext import ContextTypes
from config import REJECT_REASONS, GROUP_ID
from utils.api import admin_approve, admin_reject, get_token
from keyboards.payment_keyboards import reject_reasons_keyboard


async def handle_admin_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user = query.from_user
    data = query.data  # approve_123 | reject_123 | rejectreason_123_0

    # Only allow from the configured group
    if str(query.message.chat.id) != str(GROUP_ID):
        return

    admin_token = get_token(user.id)
    if not admin_token:
        await query.answer("Нет токена администратора. Войди в ClassPlay.", show_alert=True)
        return

    if data.startswith("approve_"):
        payment_id = int(data.split("_")[1])
        ok = await admin_approve(payment_id, admin_token)
        if ok:
            await query.edit_message_caption(
                caption=query.message.caption + "\n\n✅ ПОДТВЕРЖДЕНО",
                reply_markup=None,
            )
        else:
            await query.answer("Ошибка при подтверждении.", show_alert=True)

    elif data.startswith("reject_") and not data.startswith("rejectreason_"):
        payment_id = int(data.split("_")[1])
        await query.edit_message_reply_markup(
            reply_markup=reject_reasons_keyboard(payment_id)
        )

    elif data.startswith("rejectreason_"):
        parts = data.split("_")
        payment_id = int(parts[1])
        reason_idx = int(parts[2])
        reason = REJECT_REASONS[reason_idx] if reason_idx < len(REJECT_REASONS) else "Другое"
        ok = await admin_reject(payment_id, reason, admin_token)
        if ok:
            await query.edit_message_caption(
                caption=query.message.caption + f"\n\n❌ ОТКЛОНЕНО: {reason}",
                reply_markup=None,
            )
        else:
            await query.answer("Ошибка при отклонении.", show_alert=True)
