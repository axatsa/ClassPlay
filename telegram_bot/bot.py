"""Main entry point for the ClassPlay payment Telegram bot."""
import asyncio
from telegram import Update
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler,
    MessageHandler, filters,
)
from config import BOT_TOKEN
from handlers.start import handle_start
from handlers.payment import handle_pay_command, handle_plan_selection, handle_screenshot
from handlers.status import handle_status
from handlers.admin import handle_admin_callback


async def handle_menu_callback(update: Update, context):
    query = update.callback_query
    data = query.data

    if data == "buy":
        await query.answer()
        await query.edit_message_text("Выбери план:")
        from keyboards.payment_keyboards import plan_keyboard
        await query.edit_message_reply_markup(reply_markup=plan_keyboard())
    elif data == "status":
        from handlers.status import handle_status
        await handle_status(update, context)
    elif data == "help":
        await query.answer()
        await query.edit_message_text(
            "❓ <b>Помощь</b>\n\n"
            "/pay — купить подписку\n"
            "/status — проверить подписку\n\n"
            "По вопросам: напиши администратору.",
            parse_mode="HTML",
        )
    elif data == "cancel":
        await query.answer()
        from utils.sessions import clear_session
        clear_session(query.from_user.id)
        await query.edit_message_text("Отменено.")


def main():
    if not BOT_TOKEN:
        raise RuntimeError("TELEGRAM_BOT_TOKEN не задан в .env")

    app = Application.builder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", handle_start))
    app.add_handler(CommandHandler("pay", handle_pay_command))
    app.add_handler(CommandHandler("status", handle_status))

    # Plan selection + main menu callbacks
    app.add_handler(CallbackQueryHandler(handle_plan_selection, pattern=r"^plan_"))
    app.add_handler(CallbackQueryHandler(handle_menu_callback, pattern=r"^(buy|status|help|cancel)$"))

    # Admin approve/reject callbacks
    app.add_handler(CallbackQueryHandler(handle_admin_callback, pattern=r"^(approve_|reject_|rejectreason_)"))

    # Screenshot upload
    app.add_handler(MessageHandler(filters.PHOTO | filters.Document.IMAGE, handle_screenshot))

    print("Bot started. Polling...")
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
